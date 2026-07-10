import { createShortcutUrl, PluginData } from "@/web/urlConfig";

const ORIGIN = "http://localhost:3000";

export const visitWithState = (data: Partial<PluginData>) => {
  cy.visit(`${ORIGIN}${createShortcutUrl(data)}`);
  cy.get<HTMLIFrameElement>("#plugin_iframe", { timeout: 30000 }).should(
    ($iframe) => {
      const body = $iframe[0]?.contentDocument?.body;
      expect(body, "plugin iframe body").to.exist;
      expect(
        body!.childElementCount,
        "plugin iframe content",
      ).to.be.greaterThan(0);
    },
  );
};
