import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import LegalIndexPage from "@/app/legal/page";
import PrivacyPage from "@/app/privacy/page";
import RefundPage from "@/app/refund/page";
import Home from "@/app/page";
import { aiTemperatureModule } from "@/content/modules/ai-temperature";
import { ModuleThemeShell } from "@/components/modules/ai-temperature/ModuleThemeFrame";

describe("CoreShell route boundary", () => {
  it("renders the homepage inside the neutral CoreShell", () => {
    const html = renderToStaticMarkup(<Home />);

    expect(html).toContain('data-shell="core"');
    expect(html).toContain('data-core-shell="true"');
    expect(html).toContain('data-theme="core"');
    expect(html).toContain('data-core-static-page="home"');
    expect(html).toContain('data-core-hero="home"');
    expect(html).toContain('data-core-module-card="ai-temperature"');
    expect(html).toContain('data-core-section="details"');
    expect(html).toContain('data-core-section="service"');
    expect(html).toContain('data-core-footer="true"');
    expect(html).toContain("anyu-core-shell");
    expect(html).not.toContain("anyu-card");
    expect(html).not.toContain('data-module-theme="riso"');
  });

  it("renders legal routes inside the neutral CoreShell", () => {
    const legalHtml = renderToStaticMarkup(<LegalIndexPage />);
    const privacyHtml = renderToStaticMarkup(<PrivacyPage />);
    const refundHtml = renderToStaticMarkup(<RefundPage />);

    for (const html of [legalHtml, privacyHtml, refundHtml]) {
      expect(html).toContain('data-shell="core"');
      expect(html).toContain('data-core-shell="true"');
      expect(html).toContain('data-theme="core"');
      expect(html).toContain('data-core-hero="legal"');
      expect(html).toContain("anyu-core-article");
      expect(html).not.toContain("anyu-card");
      expect(html).not.toContain('data-shell="module"');
    }

    expect(legalHtml).toContain('data-core-static-page="legal-index"');
    expect(privacyHtml).toContain('data-core-static-page="legal-detail"');
    expect(privacyHtml).toContain('data-core-article="legal"');
    expect(privacyHtml).toContain('data-core-section="legal"');
    expect(privacyHtml).toContain('data-core-footer="true"');
    expect(legalHtml).toContain("法律與說明");
    expect(privacyHtml).toContain("隱私");
    expect(refundHtml).toContain("退款");
  });

  it("keeps Module 01 surfaces on the Riso ModuleShell boundary", () => {
    const html = renderToStaticMarkup(
      <ModuleThemeShell
        moduleConfig={aiTemperatureModule}
        surface="landing"
        theme={{
          variant: "riso",
          source: "module_default",
          hydrated: true,
          themeId: "ai-temperature-riso",
        }}
      >
        <div>module content</div>
      </ModuleThemeShell>,
    );

    expect(html).toContain('data-shell="module"');
    expect(html).toContain('data-theme="ai-temperature-riso"');
    expect(html).toContain('data-module-theme="riso"');
    expect(html).not.toContain('data-core-shell="true"');
  });
});
