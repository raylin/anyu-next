import { afterEach, describe, expect, it, vi } from "vitest";

const {
  listRuntimeConfigValues,
  getRuntimeConfigValue,
  setRuntimeConfigValue,
  unsetRuntimeConfigValue,
  listRuntimeConfigHistory,
} = vi.hoisted(() => ({
  listRuntimeConfigValues: vi.fn(),
  getRuntimeConfigValue: vi.fn(),
  setRuntimeConfigValue: vi.fn(),
  unsetRuntimeConfigValue: vi.fn(),
  listRuntimeConfigHistory: vi.fn(),
}));

vi.mock("@/lib/runtime-config/store", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/runtime-config/store")>();

  return {
    ...actual,
    listRuntimeConfigValues,
    getRuntimeConfigValue,
    setRuntimeConfigValue,
    unsetRuntimeConfigValue,
    listRuntimeConfigHistory,
  };
});

const registryRoute = await import("@/app/api/admin/runtime-config/registry/route");
const valuesRoute = await import("@/app/api/admin/runtime-config/values/route");
const getRoute = await import("@/app/api/admin/runtime-config/get/route");
const setRoute = await import("@/app/api/admin/runtime-config/set/route");
const unsetRoute = await import("@/app/api/admin/runtime-config/unset/route");
const historyRoute = await import("@/app/api/admin/runtime-config/history/route");

function request(url: string, token?: string, body?: unknown) {
  return new Request(url, {
    method: body ? "POST" : "GET",
    headers: {
      ...(token ? { "x-admin-api-token": token } : {}),
      ...(body ? { "content-type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

const record = {
  environment: "production",
  key: "payment.window.enabled",
  scopeType: "module",
  scopeKey: "ai-temperature",
  valueType: "boolean",
  value: false,
  active: true,
  reason: "test",
  updatedBy: "test",
  createdAt: new Date("2030-01-01T00:00:00.000Z"),
  updatedAt: new Date("2030-01-01T00:00:00.000Z"),
} as const;

describe("admin runtime config routes", () => {
  afterEach(() => {
    vi.clearAllMocks();
    delete process.env.ADMIN_API_TOKEN;
  });

  it("authenticates before registry/list/get lookups", async () => {
    const response = await registryRoute.GET(request("https://example.test/api/admin/runtime-config/registry", "x"));

    expect(response.status).toBe(503);
    expect(listRuntimeConfigValues).not.toHaveBeenCalled();

    process.env.ADMIN_API_TOKEN = "correct-token";
    const unauthorized = await valuesRoute.GET(
      request("https://example.test/api/admin/runtime-config/values?environment=production", "wrong"),
    );
    expect(unauthorized.status).toBe(401);
    expect(listRuntimeConfigValues).not.toHaveBeenCalled();
  });

  it("returns registry and sanitized values", async () => {
    process.env.ADMIN_API_TOKEN = "correct-token";
    listRuntimeConfigValues.mockResolvedValue([record]);
    getRuntimeConfigValue.mockResolvedValue(record);

    const registry = await registryRoute.GET(
      request("https://example.test/api/admin/runtime-config/registry", "correct-token"),
    );
    const values = await valuesRoute.GET(
      request("https://example.test/api/admin/runtime-config/values?environment=production", "correct-token"),
    );
    const single = await getRoute.GET(
      request(
        "https://example.test/api/admin/runtime-config/get?environment=production&key=payment.window.enabled&scopeType=module&scopeKey=ai-temperature",
        "correct-token",
      ),
    );

    expect(registry.status).toBe(200);
    expect(await values.json()).toMatchObject({ ok: true, values: [{ key: "payment.window.enabled" }] });
    expect(await single.json()).toMatchObject({ ok: true, config: { active: true, valueType: "boolean" } });
  });

  it("requires reason and global confirmation through the store layer", async () => {
    process.env.ADMIN_API_TOKEN = "correct-token";
    setRuntimeConfigValue.mockResolvedValue(record);
    unsetRuntimeConfigValue.mockResolvedValue({ ...record, active: false });

    const set = await setRoute.POST(
      request("https://example.test/api/admin/runtime-config/set", "correct-token", {
        environment: "production",
        key: "payment.window.enabled",
        scopeType: "module",
        scopeKey: "ai-temperature",
        value: true,
        reason: "controlled smoke",
      }),
    );
    const unset = await unsetRoute.POST(
      request("https://example.test/api/admin/runtime-config/unset", "correct-token", {
        environment: "production",
        key: "payment.window.enabled",
        scopeType: "module",
        scopeKey: "ai-temperature",
        reason: "closed",
      }),
    );

    expect(set.status).toBe(200);
    expect(unset.status).toBe(200);
    expect(setRuntimeConfigValue).toHaveBeenCalledWith(expect.objectContaining({
      confirmGlobalImpact: false,
      actor: "admin-api",
    }));
  });

  it("returns sanitized history", async () => {
    process.env.ADMIN_API_TOKEN = "correct-token";
    listRuntimeConfigHistory.mockResolvedValue([
      {
        environment: "production",
        key: "payment.window.enabled",
        scopeType: "module",
        scopeKey: "ai-temperature",
        action: "set",
        valueBeforeJson: false,
        valueAfterJson: true,
        reason: "controlled smoke",
        actor: "admin-api",
        createdAt: new Date("2030-01-01T00:00:00.000Z"),
      },
    ]);

    const response = await historyRoute.GET(
      request(
        "https://example.test/api/admin/runtime-config/history?environment=production&key=payment.window.enabled&scopeType=module&scopeKey=ai-temperature",
        "correct-token",
      ),
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toMatchObject({ ok: true, history: [{ action: "set", reasonPresent: true }] });
    expect(JSON.stringify(data)).not.toContain("ADMIN_API_TOKEN");
  });
});
