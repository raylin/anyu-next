import { expect, test } from "@playwright/test";

test.describe("module 01 line funnel smoke", () => {
  test("paid CTA reveals the LINE-first contact panel and Email fallback", async ({ page }) => {
    await page.goto("/m/ambiguous-temperature/result/demo");

    await page.getByRole("button", { name: "解鎖下一句怎麼回 — NT$49" }).click();

    const lineButton = page.getByRole("button", { name: "加入 LINE，收到開放通知" });
    await expect(lineButton).toBeVisible();
    await expect(lineButton).toHaveAttribute("data-line-add-url", "https://lin.ee/S6dnbJO");

    await page.getByRole("button", { name: "改用 Email 接收通知" }).click();

    const emailInput = page.getByRole("textbox", { name: "Email" });
    await expect(emailInput).toBeVisible();
    await emailInput.fill("anyu-e2e@example.com");
    await page.getByRole("checkbox").check();
    await expect(page.getByRole("button", { name: "送出 Email 通知" })).toBeEnabled();

    await page.getByRole("button", { name: "送出 Email 通知" }).click();
    await expect(
      page.getByText("這是 demo 路線，目前不會真的送出，但正式流程已預留位置。"),
    ).toBeVisible();
  });
});
