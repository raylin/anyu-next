import { describe, expect, it } from "vitest";
import {
  diagnoseInternalJobAuthorization,
  getInternalJobSecret,
  isInternalJobAuthorized,
} from "@/lib/runtime/internal-job-auth";

describe("internal job authorization", () => {
  it("prefers a dedicated internal job secret and falls back to cron secret", () => {
    expect(
      getInternalJobSecret({
        INTERNAL_JOB_SECRET: "internal-secret",
        CRON_SECRET: "cron-secret",
      } as NodeJS.ProcessEnv),
    ).toBe("internal-secret");
    expect(getInternalJobSecret({ CRON_SECRET: "cron-secret" } as NodeJS.ProcessEnv)).toBe(
      "cron-secret",
    );
  });

  it("requires an exact bearer token match", () => {
    const env = { INTERNAL_JOB_SECRET: "configured-secret" } as NodeJS.ProcessEnv;

    expect(isInternalJobAuthorized("Bearer configured-secret", env)).toBe(true);
    expect(isInternalJobAuthorized("Bearer wrong-secret", env)).toBe(false);
    expect(isInternalJobAuthorized(null, env)).toBe(false);
  });

  it("returns secret-safe diagnostic categories only", () => {
    const env = { INTERNAL_JOB_SECRET: "configured-secret" } as NodeJS.ProcessEnv;
    const diagnostic = diagnoseInternalJobAuthorization("Bearer wrong-secret", env);

    expect(diagnostic).toEqual({
      authHeaderPresent: true,
      authHeaderScheme: "bearer",
      internalJobSecretConfigured: true,
      internalJobSecretConfiguredSource: "INTERNAL_JOB_SECRET",
      bearerTokenPresent: true,
      authMatched: false,
      rejectionReason: "secret_mismatch",
    });
    expect(JSON.stringify(diagnostic)).not.toContain("configured-secret");
    expect(JSON.stringify(diagnostic)).not.toContain("wrong-secret");
    expect(JSON.stringify(diagnostic)).not.toContain(String("configured-secret".length));
  });

  it("diagnoses missing headers and missing secret config without exposing values", () => {
    expect(diagnoseInternalJobAuthorization(null, {} as NodeJS.ProcessEnv)).toMatchObject({
      authHeaderPresent: false,
      authHeaderScheme: "missing",
      internalJobSecretConfigured: false,
      internalJobSecretConfiguredSource: null,
      bearerTokenPresent: false,
      authMatched: false,
      rejectionReason: "missing_secret_config",
    });
    expect(
      diagnoseInternalJobAuthorization(
        "configured-secret",
        { INTERNAL_JOB_SECRET: "configured-secret" } as NodeJS.ProcessEnv,
      ),
    ).toMatchObject({
      authHeaderPresent: true,
      authHeaderScheme: "other",
      internalJobSecretConfigured: true,
      bearerTokenPresent: true,
      authMatched: true,
      rejectionReason: "invalid_scheme",
    });
  });
});
