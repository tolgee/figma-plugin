import * as esbuild from "esbuild";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const watch = process.argv.includes("--watch");

const distDir = path.join(__dirname, "dist");
fs.mkdirSync(distDir, { recursive: true });

async function buildScript(src, outName, format = "iife") {
  return esbuild.context({
    entryPoints: [path.join(__dirname, src)],
    bundle: true,
    outfile: path.join(distDir, outName),
    target: "es2017",
    format,
    loader: { ".ts": "ts" },
    logLevel: "info",
  });
}

const uiCtx = await buildScript("src/ui.ts", "ui.js");
const editCtx = await buildScript("src/edit.ts", "edit.js");

function inlineHtml(template, scriptFile) {
  const js = fs.readFileSync(path.join(distDir, scriptFile), "utf8");
  const tpl = fs.readFileSync(path.join(__dirname, template), "utf8");
  return tpl.replace("<!--SCRIPT-->", `<script>${js}</script>`);
}

function buildHtmls() {
  const main = inlineHtml("src/ui.html", "ui.js");
  const edit = inlineHtml("src/edit.html", "edit.js");
  fs.writeFileSync(path.join(distDir, "ui.html"), main);
  fs.writeFileSync(path.join(distDir, "edit.html"), edit);
  return { main, edit };
}

async function buildWidget(htmls) {
  const ctx = await esbuild.context({
    entryPoints: [path.join(__dirname, "src/widget.tsx")],
    bundle: true,
    outfile: path.join(distDir, "widget.js"),
    target: "es2017",
    jsxFactory: "figma.widget.h",
    jsxFragment: "figma.widget.Fragment",
    loader: { ".tsx": "tsx", ".ts": "ts" },
    define: {
      __html__: JSON.stringify(htmls.main),
      EDIT_HTML: JSON.stringify(htmls.edit),
    },
    logLevel: "info",
  });
  if (watch) {
    await ctx.watch();
    return ctx;
  }
  await ctx.rebuild();
  await ctx.dispose();
  return null;
}

if (watch) {
  await uiCtx.watch();
  await editCtx.watch();
  let widgetCtx = null;
  const rebuildAll = async () => {
    const htmls = buildHtmls();
    if (widgetCtx) await widgetCtx.dispose();
    widgetCtx = await buildWidget(htmls);
  };
  for (const f of ["src/ui.html", "src/edit.html"]) {
    fs.watchFile(path.join(__dirname, f), rebuildAll);
  }
  for (const f of ["ui.js", "edit.js"]) {
    fs.watchFile(path.join(distDir, f), rebuildAll);
  }
  await rebuildAll();
  console.log("watching…");
} else {
  await uiCtx.rebuild();
  await editCtx.rebuild();
  await uiCtx.dispose();
  await editCtx.dispose();
  const htmls = buildHtmls();
  await buildWidget(htmls);
  console.log("build complete → dist/");
}
