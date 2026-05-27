import { expect, test } from "@playwright/test";

test.describe("global LIFF fulfillment bridge", () => {
  test("missing context shows a safe fallback instead of homepage", async ({ page }) => {
    await page.goto("/line/fulfill");

    await expect(page.getByRole("heading", { name: "正在領取完整分析" })).toBeVisible();
    await expect(page.getByText("LINE 領取連結缺少有效測驗資料")).toBeVisible();
    await expect(page.getByText("請回到結果頁重新產生", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "開始分析" })).toHaveCount(0);
  });

  test("unsupported module context shows a safe fallback instead of homepage", async ({ page }) => {
    await page.goto(
      "/line/fulfill?moduleSlug=unknown-module&unlockIntentId=intent&unlockToken=token&code=A7K2Q9",
    );

    await expect(page.getByRole("heading", { name: "正在領取完整分析" })).toBeVisible();
    await expect(page.getByText("LINE 領取連結缺少有效測驗資料")).toBeVisible();
    await expect(page.getByText("A7K2Q9")).toBeVisible();
    await expect(page.getByRole("button", { name: "開始分析" })).toHaveCount(0);
  });
});
