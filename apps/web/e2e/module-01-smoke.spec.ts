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
      "riso",
    );
    await expect(page.locator("[data-theme='ai-temperature-riso']")).toBeVisible();
    await expect(page.locator("[data-shell='module']")).toBeVisible();
    await expect(page.getByText("柔和")).toHaveCount(0);
    await expect(page.getByText("鮮明")).toHaveCount(0);
    await expect(page.getByText("視覺")).toHaveCount(0);
    await expect(page.getByText("MANUAL")).toHaveCount(0);
    await expect(page.getByText("A/B")).toHaveCount(0);
    await page.reload();
    await expect(page.locator("[data-module-theme]")).toHaveAttribute("data-module-theme", "riso");
    await expect(page.getByRole("button", { name: "切換為鮮明主題" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "切換為柔和主題" })).toHaveCount(0);
    await expect(page.getByLabel("情境描述")).toBeVisible();
    await expect(page.getByRole("button", { name: "再寫一點…" })).toBeDisabled();
    await expect(page.getByText("0 / 80")).toBeVisible();
    await expect(
      page.getByText("你不需要留下姓名或聯絡資料就能分析；請不要貼姓名、電話、地址等能識別身份的資訊。"),
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
      "我們上週末見面時聊得很自然，他也說下次可以再約。但這幾天訊息變慢，常常隔半天才回，雖然還是會看我的限動、偶爾傳生活小事。我不知道他是真的忙，還是其實已經沒那麼想靠近了。",
    );

    await expect(page.getByText("可以分析", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "分析我的曖昧溫度" })).toBeEnabled();
    await expect(page.getByText("你貼上的內容只用於產生這次結果；系統會依保留規則自動清理分析資料。")).toBeVisible();
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
    await expect(page.getByText("48 小時內，看他是自然靠近，還是只有在你提醒時才回應。")).toBeVisible();
    await expect(page.getByText("「現在最不該做的，是把壓力全部丟到自己身上。」")).toBeVisible();
  });

  test("inline CTA reveals one contact panel on demo route", async ({ page }) => {
    await page.goto("/m/ambiguous-temperature/result/demo");

    await page.getByRole("button", { name: "看下一句怎麼回" }).click();

    await expect(
      page.getByRole("heading", { name: "用 LINE 接收開放通知" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "用 LINE 接收開放通知" }),
    ).toHaveCount(1);
    await expect(page.getByRole("button", { name: "解鎖下一句怎麼回 — NT$49" })).toBeVisible();
  });
});
