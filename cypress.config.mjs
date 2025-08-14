import { defineConfig } from "cypress";

export default defineConfig({
  retries: 3,
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
