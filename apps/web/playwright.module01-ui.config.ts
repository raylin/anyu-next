import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  testMatch: ["module-01-checkout-ui.spec.ts"],
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  retries: 0,
  use: {
    headless: true,
    viewport: {
      width: 390,
      height: 844,
    },
    screenshot: "off",
    trace: "off",
    video: "off",
  },
  projects: [
    {
      name: "chromium",
      use: {
        browserName: "chromium",
      },
    },
  ],
});
