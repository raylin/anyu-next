import { expect, test } from "@playwright/test";

const forbiddenCopy = [
  "internal-test",
  "no charge",
  "內部測試",
  "免付款",
  "完整報告會傳到 LINE",
  "LINE 交付完整報告",
  "Email 交付完整報告",
];

function checkoutFixture(mode: "desktop" | "mobile", saved = false) {
  const desktopOnly = mode === "desktop";

  return `
    <main aria-label="Module 01 checkout-start">
      <h1>曖昧溫度計完整分析</h1>
      <p>NT$49 一次性付款</p>
      <p>付款完成後，完整報告會在 ANYU 網頁中生成。</p>
      <section aria-label="access-link-gate">
        <h2>先保存查看連結</h2>
        ${
          desktopOnly
            ? `
              <form aria-label="email-save">
                <h3>Email 查看連結</h3>
                <p>請先用 Email 保存查看連結。Email 只會收到 /r/ 查看連結，不包含報告內容。</p>
                <button type="button">${saved ? "已保存到 Email" : "用 Email 保存查看連結"}</button>
              </form>
            `
            : `
              <section aria-label="line-save">
                <h3>建議用 LINE 保存查看連結</h3>
                <p>LINE 只會收到 /r/ 查看連結，不包含報告內容。</p>
                <button type="button">${saved ? "已用 LINE 保存專屬查看連結" : "用 LINE 保存查看連結"}</button>
              </section>
              <form aria-label="email-fallback">
                <h3>Email 備用查看連結</h3>
                <p>改用 Email 保存查看連結。</p>
                <button type="button">改用 Email 保存查看連結</button>
              </form>
            `
        }
      </section>
      <button aria-label="continue-payment" ${saved ? "" : "disabled"}>
        ${saved ? "繼續付款" : "請先保存查看連結"}
      </button>
    </main>
  `;
}

test.describe("Module 01 checkout-start UI foundation", () => {
  test("desktop shows Email-only mandatory save and locked payment CTA", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.setContent(checkoutFixture("desktop"));

    await expect(page.getByRole("heading", { name: "Email 查看連結" })).toBeVisible();
    await expect(page.getByRole("button", { name: "用 Email 保存查看連結" })).toBeVisible();
    await expect(page.getByText("LINE 保存查看連結")).toHaveCount(0);
    await expect(page.getByLabel("continue-payment")).toBeDisabled();
  });

  test("mobile shows LINE above Email fallback", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.setContent(checkoutFixture("mobile"));

    const lineSection = page.getByLabel("line-save");
    const emailFallback = page.getByLabel("email-fallback");
    const lineBox = await lineSection.boundingBox();
    const emailBox = await emailFallback.boundingBox();

    await expect(page.getByRole("heading", { name: "建議用 LINE 保存查看連結" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Email 備用查看連結" })).toBeVisible();
    expect(lineBox?.y).toBeLessThan(emailBox?.y ?? 0);
    await expect(page.getByLabel("continue-payment")).toBeDisabled();
  });

  test("saved state unlocks payment CTA without provider or delivery promises", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.setContent(checkoutFixture("mobile", true));

    await expect(page.getByLabel("continue-payment")).toBeEnabled();

    for (const copy of forbiddenCopy) {
      await expect(page.getByText(copy, { exact: false })).toHaveCount(0);
    }
  });
});
