import { mount } from "svelte";
// Tailwind entry: pulls in the plugin's real stylesheet and registers `src/ui`
// as a scan source so component-only utilities are generated too.
import "./app.css";
// Browser-only fallbacks for the `--figma-color-*` tokens that Figma injects
// at runtime but don't exist in a plain browser.
import "./theme.css";
import App from "./App.svelte";

const target = document.getElementById("app");
if (!target) throw new Error("#app missing");
mount(App, { target });
