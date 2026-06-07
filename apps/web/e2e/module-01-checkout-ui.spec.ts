import { expect, test } from "@playwright/test";

import {
  forbiddenCopy,
  gotoCheckoutHarness,
  gotoCheckoutRouteHarness,
  installCheckoutHarnessRoute,
} from "./support/module01-checkout-harness";

test.describe("Module 01 checkout-start UI foundation", () => {
  test.beforeEach(async ({ page }) => {
    await installCheckoutHarnessRoute(page);
  });

  test("desktop shows Email-only mandatory save and locked payment CTA", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await gotoCheckoutHarness(page, "desktop_locked");

    await expect(page.getByRole("heading", { name: "Email 查看連結" })).toBeVisible();
    await expect(page.locator('[data-riso-flow="checkout-save"]')).toBeVisible();
    await expect(page.locator('[data-save-option="email"]')).toBeVisible();
    await expect(page.getByRole("button", { name: "用 Email 保存查看連結" })).toBeVisible();
    await expect(page.getByText("LINE 保存查看連結")).toHaveCount(0);
    await expect(page.getByLabel("continue-payment")).toBeDisabled();
  });

  test("mobile shows LINE above Email fallback and keeps payment locked before save", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoCheckoutHarness(page, "mobile_locked");

    const lineSection = page.getByLabel("line-save");
    const emailFallback = page.getByLabel("email-fallback");
    const lineBox = await lineSection.boundingBox();
    const emailBox = await emailFallback.boundingBox();

    await expect(page.getByRole("heading", { name: "建議用 LINE 保存查看連結" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Email 備用查看連結" })).toBeVisible();
    await expect(page.locator('[data-riso-flow="checkout-save"]')).toBeVisible();
    await expect(page.locator('[data-save-option="line"]')).toBeVisible();
    await expect(page.locator('[data-save-option="email"]')).toBeVisible();
    expect(lineBox?.y).toBeLessThan(emailBox?.y ?? 0);
    await expect(page.getByLabel("continue-payment")).toBeDisabled();
  });

  test("Email fallback saved state unlocks payment without provider or delivery promises", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoCheckoutRouteHarness(page, "email_saved");

    await expect(page.getByRole("button", { name: "已保存到 Email" })).toBeVisible();
    await expect(page.getByLabel("continue-payment")).toBeEnabled();
    await expect(page).toHaveURL(/\/m\/ambiguous-temperature\/result\/fixture-result-1\/checkout/u);

    for (const copy of forbiddenCopy) {
      await expect(page.getByText(copy, { exact: false })).toHaveCount(0);
    }
  });

  test("LINE deliverable saved state unlocks payment", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoCheckoutHarness(page, "line_deliverable");

    await expect(page.getByRole("button", { name: "已保存到 LINE" })).toBeVisible();
    await expect(page.getByLabel("continue-payment")).toBeEnabled();
  });

  test("LINE contact-only incomplete state does not unlock payment", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoCheckoutHarness(page, "line_contact_only");

    await expect(page.getByText("LINE 保存沒有完成")).toBeVisible();
    await expect(page.getByRole("button", { name: "用 LINE 保存查看連結" })).toBeVisible();
    await expect(page.getByRole("button", { name: "改用 Email 保存查看連結" })).toBeVisible();
    await expect(page.getByLabel("continue-payment")).toBeDisabled();
  });
});
