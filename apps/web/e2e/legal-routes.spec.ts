import { expect, test } from "@playwright/test";

const legalRoutes = [
  { path: "/privacy", heading: "隱私權政策" },
  { path: "/terms", heading: "使用條款" },
  { path: "/disclaimer", heading: "免責聲明" },
  { path: "/legal", heading: "法律與說明" },
] as const;

test.describe("legal route smoke", () => {
  for (const route of legalRoutes) {
    test(`${route.path} renders`, async ({ page }) => {
      const response = await page.goto(route.path);

      expect(response?.ok()).toBeTruthy();
      await expect(page.getByRole("heading", { name: route.heading })).toBeVisible();
      await expect(page.getByRole("link", { name: "hello@anyu.tw" })).toBeVisible();
    });
  }

  test("landing footer legal links point to the expected routes", async ({ page }) => {
    await page.goto("/m/ambiguous-temperature");

    await expect(page.getByRole("link", { name: "隱私權政策" })).toHaveAttribute(
      "href",
      "/privacy",
    );
    await expect(page.getByRole("link", { name: "使用條款" })).toHaveAttribute(
      "href",
      "/terms",
    );
    await expect(page.getByRole("link", { name: "免責聲明" })).toHaveAttribute(
      "href",
      "/disclaimer",
    );
  });
});
