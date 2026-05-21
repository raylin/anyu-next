import { defineConfig } from "@playwright/test";

const localBaseUrl = "http://127.0.0.1:3001";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  retries: 0,
  use: {
    baseURL: localBaseUrl,
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
  webServer: {
    command:
      "NEXT_PUBLIC_LINE_ADD_URL=https://lin.ee/S6dnbJO NEXT_PUBLIC_APP_URL=http://127.0.0.1:3001 corepack pnpm start:test",
    url: localBaseUrl,
    reuseExistingServer: true,
    timeout: 120_000,
    cwd: __dirname,
  },
});
