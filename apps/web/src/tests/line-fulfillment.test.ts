import { createHmac } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { LineFulfillBridge } from "@/components/line/LineFulfillBridge";
import {
  buildFulfillmentExpiry,
  generateFulfillmentCode,
  generateUnlockToken,
  hashFulfillmentSecret,
  isExpired,
  isFulfillmentCodeShape,
  normalizeFulfillmentCode,
} from "@/lib/line/fulfillment";
import { buildLineLiffUrl, buildModuleUnlockPath } from "@/lib/line/config";
import { buildLiffDiagnosticSnapshot, isLiffDebugEnabled } from "@/lib/line/liff-diagnostics";
import { parseLineFulfillmentContext } from "@/lib/line/liff-context";
import { getLineLoginChannelId, verifyLineIdToken } from "@/lib/line/liff";
import { verifyLineSignature } from "@/lib/line/webhook";
import {
  buildLineWebhookDedupeKey,
  getLineWebhookRateWindowStart,
  isLineWebhookRateLimited,
} from "@/lib/line/webhook-hardening";

describe("LINE fulfillment helpers", () => {
  it("generates short codes with the expected safe shape", () => {
    const code = generateFulfillmentCode();

    expect(code).toHaveLength(6);
    expect(isFulfillmentCodeShape(code)).toBe(true);
    expect(code).not.toMatch(/[01IO]/);
  });

  it("normalizes pasted fulfillment codes", () => {
    expect(normalizeFulfillmentCode(" a7k-2q9 ")).toBe("A7K2Q9");
  });

  it("generates high entropy unlock tokens and deterministic hashes", () => {
    const token = generateUnlockToken();

    expect(token.length).toBeGreaterThanOrEqual(32);
    expect(hashFulfillmentSecret(token, "pepper")).toBe(hashFulfillmentSecret(token, "pepper"));
    expect(hashFulfillmentSecret(token, "pepper")).not.toBe(token);
  });

  it("builds the expected expiration windows", () => {
    const now = new Date("2026-05-21T00:00:00.000Z");
    const expiry = buildFulfillmentExpiry(now);

    expect(expiry.fulfillmentExpiresAt.toISOString()).toBe("2026-05-21T00:30:00.000Z");
    expect(expiry.unlockTokenExpiresAt.toISOString()).toBe("2026-05-22T00:00:00.000Z");
    expect(isExpired(expiry.fulfillmentExpiresAt, now)).toBe(false);
    expect(isExpired(now, expiry.fulfillmentExpiresAt)).toBe(true);
  });

  it("builds LIFF URLs from env-provided base URLs without appending a route path", () => {
    expect(
      buildLineLiffUrl({
        baseUrl: "https://liff.line.me/123-abc",
        unlockIntentId: "intent-1",
        unlockToken: "token-1",
        fulfillmentCode: "A7K2Q9",
        moduleSlug: "ambiguous-temperature",
      }),
    ).toBe(
      "https://liff.line.me/123-abc?moduleSlug=ambiguous-temperature&unlockIntentId=intent-1&unlockToken=token-1&code=A7K2Q9",
    );
  });

  it("does not append bridge or module paths after the LIFF ID", () => {
    const liffUrl = buildLineLiffUrl({
      baseUrl: "https://liff.line.me/123-abc/line/fulfill",
      unlockIntentId: "intent-1",
      unlockToken: "token-1",
      fulfillmentCode: "A7K2Q9",
      moduleSlug: "ambiguous-temperature",
    });

    expect(liffUrl).toBe(
      "https://liff.line.me/123-abc?moduleSlug=ambiguous-temperature&unlockIntentId=intent-1&unlockToken=token-1&code=A7K2Q9",
    );
    expect(liffUrl).not.toContain("/123-abc/line/fulfill");
    expect(liffUrl).not.toContain("/123-abc/m/");
  });

  it("can carry LIFF debug mode through generated query context", () => {
    expect(
      buildLineLiffUrl({
        baseUrl: "https://liff.line.me/123-abc",
        unlockIntentId: "intent-1",
        unlockToken: "token-1",
        fulfillmentCode: "A7K2Q9",
        moduleSlug: "ambiguous-temperature",
        debug: true,
      }),
    ).toBe(
      "https://liff.line.me/123-abc?moduleSlug=ambiguous-temperature&debug=1&unlockIntentId=intent-1&unlockToken=token-1&code=A7K2Q9",
    );
  });

  it("carries selected theme through generated LIFF and unlocked URLs", () => {
    expect(
      buildLineLiffUrl({
        baseUrl: "https://liff.line.me/123-abc",
        unlockIntentId: "intent-1",
        unlockToken: "token-1.r",
        fulfillmentCode: "A7K2Q9",
        moduleSlug: "ambiguous-temperature",
        themeVariant: "riso",
        themeSource: "manual_override",
      }),
    ).toBe(
      "https://liff.line.me/123-abc?moduleSlug=ambiguous-temperature&themeVariant=riso&themeSource=manual_override&unlockIntentId=intent-1&unlockToken=token-1.r&code=A7K2Q9",
    );
    expect(
      buildModuleUnlockPath({
        moduleSlug: "ambiguous-temperature",
        unlockToken: "token-1.r",
        themeVariant: "riso",
        themeSource: "manual_override",
      }),
    ).toBe("/m/ambiguous-temperature/unlock/token-1.r?themeVariant=riso&themeSource=manual_override");
  });

  it("builds global bridge URLs for non-LIFF base URLs too", () => {
    expect(
      buildLineLiffUrl({
        baseUrl: "https://staging.anyu.tw/m/ambiguous-temperature/line/fulfill",
        unlockIntentId: "intent-1",
        unlockToken: "token-1",
        fulfillmentCode: "A7K2Q9",
        moduleSlug: "ambiguous-temperature",
      }),
    ).toBe(
      "https://staging.anyu.tw/line/fulfill?moduleSlug=ambiguous-temperature&unlockIntentId=intent-1&unlockToken=token-1&code=A7K2Q9",
    );
  });

  it("builds root-relative module unlock paths for LIFF bind redirects", () => {
    expect(
      buildModuleUnlockPath({
        moduleSlug: "ambiguous-temperature",
        unlockToken: "token-1",
      }),
    ).toBe("/m/ambiguous-temperature/unlock/token-1");
  });

  it("keeps LIFF fulfillment context from direct query params", () => {
    expect(
      parseLineFulfillmentContext(
        "?moduleSlug=ambiguous-temperature&unlockIntentId=intent-1&unlockToken=token-1&code=A7K2Q9",
      ),
    ).toEqual({
      moduleSlug: "ambiguous-temperature",
      unlockIntentId: "intent-1",
      unlockToken: "token-1",
      code: "A7K2Q9",
      statePath: null,
      themeVariant: null,
      themeSource: "unknown",
    });
  });

  it("keeps LIFF fulfillment context from liff.state redirects", () => {
    const state = encodeURIComponent(
      "/line/fulfill?moduleSlug=ambiguous-temperature&unlockIntentId=intent-1&unlockToken=token-1&code=A7K2Q9",
    );

    expect(parseLineFulfillmentContext(`?liff.state=${state}`)).toEqual({
      moduleSlug: "ambiguous-temperature",
      unlockIntentId: "intent-1",
      unlockToken: "token-1",
      code: "A7K2Q9",
      statePath: "/line/fulfill",
      themeVariant: null,
      themeSource: "unknown",
    });
  });

  it("keeps compatibility module context from legacy liff.state paths", () => {
    const state = encodeURIComponent(
      "/m/ambiguous-temperature/line/fulfill?unlockIntentId=intent-1&unlockToken=token-1&code=A7K2Q9",
    );

    expect(parseLineFulfillmentContext(`?liff.state=${state}`)).toEqual({
      moduleSlug: "ambiguous-temperature",
      unlockIntentId: "intent-1",
      unlockToken: "token-1",
      code: "A7K2Q9",
      statePath: "/m/ambiguous-temperature/line/fulfill",
      themeVariant: null,
      themeSource: "unknown",
    });
  });

  it("uses a compatibility route module slug when query context omits it", () => {
    expect(
      parseLineFulfillmentContext("?unlockIntentId=intent-1&unlockToken=token-1&code=A7K2Q9", {
        defaultModuleSlug: "ambiguous-temperature",
      }),
    ).toEqual({
      moduleSlug: "ambiguous-temperature",
      unlockIntentId: "intent-1",
      unlockToken: "token-1",
      code: "A7K2Q9",
      statePath: null,
      themeVariant: null,
      themeSource: "unknown",
    });
  });

  it("keeps theme hints from direct query and liff.state", () => {
    expect(
      parseLineFulfillmentContext(
        "?moduleSlug=ambiguous-temperature&themeVariant=riso&themeSource=manual_override&unlockIntentId=intent-1&unlockToken=token-1.r&code=A7K2Q9",
      ),
    ).toMatchObject({
      themeVariant: "riso",
      themeSource: "manual_override",
    });

    const state = encodeURIComponent(
      "/line/fulfill?moduleSlug=ambiguous-temperature&themeVariant=classic&themeSource=query_hint&unlockIntentId=intent-1&unlockToken=token-1.c&code=A7K2Q9",
    );

    expect(parseLineFulfillmentContext(`?liff.state=${state}`)).toMatchObject({
      themeVariant: "classic",
      themeSource: "query_hint",
    });
  });

  it("recovers bridge theme from unlock-token suffix when explicit query hints are absent", () => {
    expect(
      parseLineFulfillmentContext(
        "?moduleSlug=ambiguous-temperature&unlockIntentId=intent-1&unlockToken=token-1.r&code=A7K2Q9",
      ),
    ).toMatchObject({
      themeVariant: "riso",
      themeSource: "query_hint",
    });
  });

  it("applies riso theme on the LIFF bridge from query context without a fresh assignment", () => {
    const originalWindow = globalThis.window;
    const randomSpy = vi.spyOn(Math, "random");

    vi.stubGlobal("window", {
      location: {
        pathname: "/line/fulfill",
        search:
          "?moduleSlug=ambiguous-temperature&themeVariant=riso&themeSource=manual_override&unlockIntentId=intent-1&unlockToken=token-1.r&code=A7K2Q9",
      },
    });

    try {
      const html = renderToStaticMarkup(createElement(LineFulfillBridge));

      expect(html).toContain('data-module-theme="riso"');
      expect(html).toContain('data-module-theme-source="manual_override"');
      expect(html).toContain("anyu-v2");
      expect(html).not.toContain('aria-label="主題切換"');
      expect(html).not.toContain('aria-label="切換為柔和主題"');
      expect(randomSpy).not.toHaveBeenCalled();
    } finally {
      vi.stubGlobal("window", originalWindow);
      randomSpy.mockRestore();
    }
  });

  it("server-renders the LIFF bridge with the provided theme hint before hydration", () => {
    const originalWindow = globalThis.window;
    const randomSpy = vi.spyOn(Math, "random");

    vi.stubGlobal("window", undefined);

    try {
      const html = renderToStaticMarkup(
        createElement(LineFulfillBridge, {
          initialSearch:
            "moduleSlug=ambiguous-temperature&themeVariant=riso&themeSource=query_hint&unlockIntentId=intent-1&unlockToken=token-1.r&code=A7K2Q9",
        }),
      );

      expect(html).toContain('data-module-theme="riso"');
      expect(html).toContain('data-module-theme-source="query_hint"');
      expect(html).toContain("anyu-v2");
      expect(html).not.toContain('aria-label="主題切換"');
      expect(randomSpy).not.toHaveBeenCalled();
    } finally {
      vi.stubGlobal("window", originalWindow);
      randomSpy.mockRestore();
    }
  });

  it("applies classic theme on the LIFF bridge from token suffix context", () => {
    const originalWindow = globalThis.window;

    vi.stubGlobal("window", {
      location: {
        pathname: "/line/fulfill",
        search:
          "?moduleSlug=ambiguous-temperature&unlockIntentId=intent-1&unlockToken=token-1.c&code=A7K2Q9",
      },
    });

    try {
      const html = renderToStaticMarkup(createElement(LineFulfillBridge));

      expect(html).toContain('data-module-theme="classic"');
      expect(html).toContain('data-module-theme-source="query_hint"');
      expect(html).not.toContain("anyu-v2");
      expect(html).not.toContain('aria-label="主題切換"');
    } finally {
      vi.stubGlobal("window", originalWindow);
    }
  });

  it("navigates immediately after successful non-debug LIFF bind without rendering a transient success CTA", () => {
    const source = readFileSync(
      resolve(process.cwd(), "src/components/line/LineFulfillBridge.tsx"),
      "utf8",
    );
    const assignIndex = source.indexOf("window.location.assign(redirectTarget);");
    const successStateIndex = source.indexOf('setState("success");');

    expect(assignIndex).toBeGreaterThan(0);
    expect(successStateIndex).toBeGreaterThan(assignIndex);
    expect(source).toContain("if (!isDebugEnabled) {\n          window.location.assign(redirectTarget);\n          return;\n        }");
  });

  it("formats LIFF diagnostics without token values or full URLs", () => {
    const search =
      "?debug=1&moduleSlug=ambiguous-temperature&unlockIntentId=intent-secret&unlockToken=token-secret&code=A7K2Q9";
    const context = parseLineFulfillmentContext(search);
    const diagnostic = buildLiffDiagnosticSnapshot({
      pathname: "/line/fulfill",
      search,
      context,
      allowlistedModuleSlugs: ["ambiguous-temperature"],
      bindAttemptStatus: "success",
      bindResponseTarget: "/m/ambiguous-temperature/unlock/token-secret",
      navigationMethod: "window.location.assign",
    });
    const serialized = JSON.stringify(diagnostic);

    expect(diagnostic).toMatchObject({
      currentPathname: "/line/fulfill",
      searchParamKeys: ["code", "debug", "moduleSlug", "unlockIntentId", "unlockToken"],
      contextSource: "direct_query",
      hasModuleSlug: true,
      moduleSlug: "ambiguous-temperature",
      hasUnlockIntentId: true,
      hasUnlockToken: true,
      hasFallbackCode: true,
      bindAttemptStatus: "success",
      bindResponseHasUnlockedPath: true,
      unlockedPathShape: "/m/:moduleSlug/unlock/:token",
      navigationMethod: "window.location.assign",
    });
    expect(serialized).not.toContain("token-secret");
    expect(serialized).not.toContain("intent-secret");
    expect(serialized).not.toContain("A7K2Q9");
    expect(serialized).not.toContain("/m/ambiguous-temperature/unlock/token-secret");
  });

  it("reports liff.state context source without exposing state values", () => {
    const state = encodeURIComponent(
      "/line/fulfill?moduleSlug=ambiguous-temperature&unlockIntentId=intent-secret&unlockToken=token-secret&code=A7K2Q9",
    );
    const search = `?debug=1&liff.state=${state}`;
    const diagnostic = buildLiffDiagnosticSnapshot({
      pathname: "/line/fulfill",
      search,
      context: parseLineFulfillmentContext(search),
      allowlistedModuleSlugs: ["ambiguous-temperature"],
    });
    const serialized = JSON.stringify(diagnostic);

    expect(diagnostic.contextSource).toBe("liff_state");
    expect(diagnostic.searchParamKeys).toEqual(["debug", "liff.state"]);
    expect(diagnostic.hasUnlockToken).toBe(true);
    expect(serialized).not.toContain("token-secret");
    expect(serialized).not.toContain("intent-secret");
    expect(serialized).not.toContain("A7K2Q9");
  });

  it("reports legacy liff.state context source safely", () => {
    const state = encodeURIComponent(
      "/m/ambiguous-temperature/line/fulfill?unlockIntentId=intent-secret&unlockToken=token-secret&code=A7K2Q9",
    );
    const search = `?debug=1&liff.state=${state}`;
    const diagnostic = buildLiffDiagnosticSnapshot({
      pathname: "/line/fulfill",
      search,
      context: parseLineFulfillmentContext(search),
      allowlistedModuleSlugs: ["ambiguous-temperature"],
    });

    expect(diagnostic.contextSource).toBe("legacy_state");
    expect(diagnostic.moduleSlug).toBe("ambiguous-temperature");
    expect(JSON.stringify(diagnostic)).not.toContain("token-secret");
  });

  it("enables LIFF debug mode only when the safe query flag is present", () => {
    expect(isLiffDebugEnabled("?debug=1")).toBe(true);
    expect(isLiffDebugEnabled("?debug=0")).toBe(false);
  });

  it("returns an empty context when LIFF state is missing instead of inventing a redirect", () => {
    expect(parseLineFulfillmentContext("")).toEqual({
      moduleSlug: "",
      unlockIntentId: "",
      unlockToken: "",
      code: "",
      statePath: null,
      themeVariant: null,
      themeSource: "unknown",
    });
  });

  it("verifies LINE webhook signatures", () => {
    const body = JSON.stringify({ events: [] });
    const secret = "test-secret";
    const signature = createHmac("sha256", secret).update(body).digest("base64");

    expect(verifyLineSignature({ body, signature, channelSecret: secret })).toBe(true);
    expect(verifyLineSignature({ body, signature: "bad-signature", channelSecret: secret })).toBe(
      false,
    );
  });

  it("derives LINE Login channel ID from env or LIFF ID", () => {
    expect(
      getLineLoginChannelId({
        explicitChannelId: "2000000000",
        liffId: "1234567890-abc",
      }),
    ).toBe("2000000000");
    expect(getLineLoginChannelId({ liffId: "1234567890-abc" })).toBe("1234567890");
  });

  it("verifies LINE ID tokens through the LINE verify endpoint", async () => {
    const calls: Array<{ url: string; body: string }> = [];
    const fetchImpl = async (url: string | URL | Request, init?: RequestInit) => {
      calls.push({
        url: String(url),
        body: String(init?.body),
      });

      return Response.json({ sub: "line-user-1", aud: "1234567890" });
    };

    const result = await verifyLineIdToken({
      idToken: "id-token",
      channelId: "1234567890",
      fetchImpl: fetchImpl as typeof fetch,
    });

    expect(result).toEqual({
      ok: true,
      lineUserId: "line-user-1",
      audience: "1234567890",
    });
    expect(calls[0]?.url).toBe("https://api.line.me/oauth2/v2.1/verify");
    expect(calls[0]?.body).toContain("id_token=id-token");
    expect(calls[0]?.body).toContain("client_id=1234567890");
  });

  it("rejects missing or unverifiable LINE ID tokens", async () => {
    await expect(verifyLineIdToken({ idToken: "", channelId: "123" })).resolves.toEqual({
      ok: false,
      error: "missing_token",
    });
    await expect(
      verifyLineIdToken({
        idToken: "bad-token",
        channelId: "123",
        fetchImpl: (async () => new Response("bad", { status: 401 })) as typeof fetch,
      }),
    ).resolves.toEqual({
      ok: false,
      error: "line_verify_failed",
    });
  });

  it("builds safe webhook dedupe keys without raw reply tokens", () => {
    expect(
      buildLineWebhookDedupeKey({
        type: "message",
        webhookEventId: "01HARDENED",
        replyToken: "reply-token",
      }),
    ).toBe("event:01HARDENED");

    const derived = buildLineWebhookDedupeKey({
      type: "message",
      timestamp: 123,
      replyToken: "reply-token",
    });

    expect(derived).toMatch(/^derived:[a-f0-9]{64}$/);
    expect(derived).not.toContain("reply-token");
  });

  it("tracks webhook rate windows and limits invalid attempts", () => {
    expect(getLineWebhookRateWindowStart(new Date("2026-05-21T10:12:34Z")).toISOString()).toBe(
      "2026-05-21T10:10:00.000Z",
    );
    expect(isLineWebhookRateLimited({ invalidAttemptCount: 5 })).toBe(false);
    expect(isLineWebhookRateLimited({ invalidAttemptCount: 6 })).toBe(true);
  });
});
