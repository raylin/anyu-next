import type { Page } from "@playwright/test";

type CheckoutHarnessState =
  | "desktop_locked"
  | "email_saved"
  | "mobile_locked"
  | "line_deliverable"
  | "line_contact_only";

const forbiddenCopy = [
  "internal-test",
  "no charge",
  "內部測試",
  "免付款",
  "完整報告會傳到 LINE",
  "LINE 交付完整報告",
  "Email 交付完整報告",
];

function checkoutHarnessHtml(state: CheckoutHarnessState) {
  const desktopOnly = state === "desktop_locked";
  const emailSaved = state === "email_saved";
  const lineDeliverable = state === "line_deliverable";
  const lineContactOnly = state === "line_contact_only";
  const saved = emailSaved || lineDeliverable;
  const mobile = !desktopOnly;

  return `
    <!doctype html>
    <html lang="zh-Hant">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Module 01 checkout harness</title>
      </head>
      <body>
        <main aria-label="Module 01 checkout-start" data-state="${state}">
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
                    <p>Email 只會收到 /r/ 查看連結，不包含報告內容。</p>
                    <button type="button">用 Email 保存查看連結</button>
                  </form>
                `
                : `
                  <section aria-label="line-save">
                    <h3>建議用 LINE 保存查看連結</h3>
                    <p>LINE 只會收到 /r/ 查看連結，不包含報告內容。</p>
                    <button type="button">${
                      lineDeliverable ? "已保存到 LINE" : "用 LINE 保存查看連結"
                    }</button>
                    ${
                      lineContactOnly
                        ? `<p role="status">LINE 保存沒有完成，請重試 LINE 或改用 Email。</p>`
                        : ""
                    }
                  </section>
                  <form aria-label="email-fallback">
                    <h3>Email 備用查看連結</h3>
                    <p>改用 Email 保存查看連結。</p>
                    <button type="button">${
                      emailSaved ? "已保存到 Email" : "改用 Email 保存查看連結"
                    }</button>
                  </form>
                `
            }
          </section>
          <button aria-label="continue-payment" ${saved ? "" : "disabled"}>
            ${saved ? "繼續付款" : "請先保存查看連結"}
          </button>
          ${mobile ? `<p aria-label="mobile-mode">mobile checkout</p>` : ""}
        </main>
      </body>
    </html>
  `;
}

async function installCheckoutHarnessRoute(page: Page) {
  await page.route("**/qa/module01/checkout-start**", async (route) => {
    const url = new URL(route.request().url());
    const state = (url.searchParams.get("state") ?? "mobile_locked") as CheckoutHarnessState;

    await route.fulfill({
      contentType: "text/html; charset=utf-8",
      body: checkoutHarnessHtml(state),
    });
  });

  await page.route("**/m/ambiguous-temperature/result/*/checkout**", async (route) => {
    const url = new URL(route.request().url());
    const state = (url.searchParams.get("state") ?? "mobile_locked") as CheckoutHarnessState;

    await route.fulfill({
      contentType: "text/html; charset=utf-8",
      body: checkoutHarnessHtml(state),
    });
  });
}

async function gotoCheckoutHarness(page: Page, state: CheckoutHarnessState) {
  await page.goto(`https://module01.local/qa/module01/checkout-start?state=${state}`);
}

async function gotoCheckoutRouteHarness(page: Page, state: CheckoutHarnessState) {
  await page.goto(
    `https://module01.local/m/ambiguous-temperature/result/fixture-result-1/checkout?state=${state}`,
  );
}

export {
  forbiddenCopy,
  gotoCheckoutHarness,
  gotoCheckoutRouteHarness,
  installCheckoutHarnessRoute,
};
export type { CheckoutHarnessState };
