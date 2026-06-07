import { describe, expect, it, vi } from "vitest";

const { mockInsertEvent, mockGetModuleBySlug } = vi.hoisted(() => ({
  mockInsertEvent: vi.fn(),
  mockGetModuleBySlug: vi.fn(),
}));

vi.mock("@/lib/db/runtime", () => ({
  insertEvent: mockInsertEvent,
}));

vi.mock("@/lib/modules/registry", () => ({
  getModuleBySlug: mockGetModuleBySlug,
}));

import { recordLineBindDiagnosticEvent } from "@/lib/line/recovery-bind-diagnostic-events";

describe("LINE bind diagnostic persistence sanitizer", () => {
  it("allows safe hasIdToken boolean metadata while still omitting raw identity values", async () => {
    mockGetModuleBySlug.mockReturnValue({
      moduleId: "ai-temperature",
      slug: "ambiguous-temperature",
      experimentId: "module01",
      visualModule: "riso",
      promptVersion: "v1",
      schemaVersion: "v1",
    });
    mockInsertEvent.mockResolvedValue({ id: "event-id" });

    await recordLineBindDiagnosticEvent({
      state: {
        moduleSlug: "ambiguous-temperature",
        resultId: "11111111-1111-4111-8111-111111111111",
        paymentIntentId: "22222222-2222-4222-8222-222222222222",
        returnPath: "/m/ambiguous-temperature/result/11111111-1111-4111-8111-111111111111/checkout",
        marketingOptIn: false,
      },
      source: "server",
      category: "bind_success",
      hasLiffState: true,
      hasIdToken: true,
      bindApiReached: true,
      recipientSecretRequired: true,
      recipientSecretCreated: true,
    });

    expect(mockInsertEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        eventName: "line_bind_diagnostic",
        metadata: expect.objectContaining({
          resultId: "11111111-1111-4111-8111-111111111111",
          moduleSlug: "ambiguous-temperature",
          source: "server",
          category: "bind_success",
          stage: "bind_api",
          status: "succeeded",
          hasIdToken: true,
          recipientSecretCreated: true,
        }),
      }),
    );
    expect(JSON.stringify(mockInsertEvent.mock.calls[0])).not.toContain("lineUserId");
    expect(JSON.stringify(mockInsertEvent.mock.calls[0])).not.toContain('"idToken":');
  });
});
