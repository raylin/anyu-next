import { expect, test } from "@playwright/test";

test.describe("module 01 local ui smoke", () => {
  test("landing renders guidance, privacy helper, and valid-input CTA state", async ({ page }) => {
    const response = await page.goto("/m/ambiguous-temperature");

    expect(response?.ok()).toBeTruthy();
    await expect(page.getByRole("heading", { name: "曖昧溫度計" })).toBeVisible();
    await expect(page.getByText("他是真的忙，還是其實在冷掉？")).toBeVisible();
    await expect(
      page.getByText("貼上對話或描述情境，AI 幫你讀出關係溫度，與下一句怎麼回。"),
    ).toHaveCount(0);
    await expect(page.getByText("MODULE · 01 · 曖昧溫度計")).toHaveCount(0);
    await expect(page.getByText("MODULE · 01")).toBeVisible();
    await expect(page.locator("[data-module-theme]")).toHaveAttribute(
      "data-module-theme",
      /classic|riso/,
    );
    await expect(page.getByText("柔和")).toHaveCount(0);
    await expect(page.getByText("鮮明")).toHaveCount(0);
    await page.getByRole("button", { name: "切換為鮮明主題" }).click();
    await expect(page.locator("[data-module-theme]")).toHaveAttribute("data-module-theme", "riso");
    await page.reload();
    await expect(page.locator("[data-module-theme]")).toHaveAttribute("data-module-theme", "riso");
    await page.getByRole("button", { name: "切換為柔和主題" }).click();
    await expect(page.locator("[data-module-theme]")).toHaveAttribute("data-module-theme", "classic");
    await expect(page.getByLabel("情境描述")).toBeVisible();
    await expect(page.getByRole("button", { name: "再寫一點…" })).toBeDisabled();
    await expect(page.getByText("0 / 30")).toBeVisible();
    await expect(
      page.getByText("請不要貼姓名、電話、地址或其他能識別身份的資訊。分析僅供關係觀察與自我理解參考。"),
    ).toBeVisible();

    await expect(page.getByText("情境 · 可選")).toHaveCount(0);

    await expect(page.getByRole("button", { name: "讓結果更貼近你（選填）" })).toBeVisible();
    await expect(page.getByText("你想回給對方的語氣 · 可選")).toBeVisible();
    await expect(page.getByRole("button", { name: "坦白但不施壓" })).toBeVisible();
    await page.getByRole("button", { name: "讓結果更貼近你（選填）" }).click();
    await expect(page.getByText("你想回給對方的語氣 · 可選")).toHaveCount(0);
    await page.getByRole("button", { name: "讓結果更貼近你（選填）" }).click();
    const contextChip = page.getByRole("button", { name: "我該怎麼回" });
    await contextChip.click();
    await expect(contextChip).toHaveAttribute("aria-pressed", "true");

    await page.getByLabel("情境描述").fill(
      "他最近回訊息變慢，但還是會看我的限動。我不知道他是真的忙，還是已經沒那麼喜歡我了。",
    );

    await expect(page.getByText("可以分析了")).toBeVisible();
    await expect(page.getByRole("button", { name: "分析我的曖昧溫度" })).toBeEnabled();
    await expect(page.getByText("ANYU 會先盡量去識別化，再進行分析。")).toBeVisible();
  });

  test("demo result keeps result, share, and paid-preview contracts visible", async ({ page }) => {
    const response = await page.goto("/m/ambiguous-temperature/result/demo");

    expect(response?.ok()).toBeTruthy();
    await expect(page.getByText("當前溫度")).toBeVisible();
    await expect(page.getByText("觀察到的三個小訊號")).toBeVisible();
    await expect(page.getByText("insight layer")).toBeVisible();
    await expect(page.getByText("想知道下一句怎麼回？")).toBeVisible();
    await expect(page.getByRole("button", { name: "看下一句怎麼回" })).toBeVisible();
    await expect(page.getByRole("button", { name: "分享這個結果" })).toBeVisible();
    await expect(page.getByText("複製成 LINE / Threads 可以貼上的文字")).toBeVisible();
    await expect(page.getByText("一次性查看 · 無訂閱")).toBeVisible();
    await expect(page.getByText("一次性 · no subscription")).toBeVisible();
    await expect(page.getByText("⋯ 尚未解鎖")).toHaveCount(2);
    await expect(page.getByText("「現在最不該做的，是把壓力全部丟到自己身上。」")).toBeVisible();
  });

  test("inline CTA reveals one contact panel on demo route", async ({ page }) => {
    await page.goto("/m/ambiguous-temperature/result/demo");

    await page.getByRole("button", { name: "看下一句怎麼回" }).click();

    await expect(
      page.getByRole("heading", { name: "用 LINE 領取完整分析" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "用 LINE 領取完整分析" }),
    ).toHaveCount(1);
    await expect(page.getByRole("button", { name: "解鎖下一句怎麼回 — NT$49" })).toBeVisible();
  });
});
