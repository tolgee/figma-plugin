(() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // node_modules/@create-figma-plugin/utilities/lib/events.js
  function on(name, handler) {
    const id = `${currentId}`;
    currentId += 1;
    eventHandlers[id] = { handler, name };
    return function() {
      delete eventHandlers[id];
    };
  }
  function once(name, handler) {
    let done = false;
    return on(name, function(...args) {
      if (done === true) {
        return;
      }
      done = true;
      handler(...args);
    });
  }
  function invokeEventHandler(name, args) {
    for (const id in eventHandlers) {
      if (eventHandlers[id].name === name) {
        eventHandlers[id].handler.apply(null, args);
      }
    }
  }
  var eventHandlers, currentId;
  var init_events = __esm({
    "node_modules/@create-figma-plugin/utilities/lib/events.js"() {
      eventHandlers = {};
      currentId = 0;
      if (typeof window === "undefined") {
        figma.ui.onmessage = function([name, ...args]) {
          invokeEventHandler(name, args);
        };
      } else {
        window.onmessage = function(event) {
          const [name, ...args] = event.data.pluginMessage;
          invokeEventHandler(name, args);
        };
      }
    }
  });

  // node_modules/@create-figma-plugin/utilities/lib/node/load-fonts-async.js
  async function loadFontsAsync(nodes) {
    const result = {};
    for (const node of nodes) {
      switch (node.type) {
        case "CONNECTOR":
        case "SHAPE_WITH_TEXT":
        case "STICKY": {
          collectFontsUsedInNode(node.text, result);
          break;
        }
        case "TEXT": {
          collectFontsUsedInNode(node, result);
          break;
        }
      }
    }
    await Promise.all(Object.values(result).map(function(font) {
      return figma.loadFontAsync(font);
    }));
  }
  function collectFontsUsedInNode(node, result) {
    const length = node.characters.length;
    if (length === 0) {
      const fontName = node.fontName;
      const key = createKey(fontName);
      if (key in result) {
        return;
      }
      result[key] = fontName;
      return;
    }
    let i = -1;
    while (++i < length) {
      const fontName = node.getRangeFontName(i, i + 1);
      const key = createKey(fontName);
      if (key in result) {
        continue;
      }
      result[key] = fontName;
    }
  }
  function createKey(fontName) {
    return `${fontName.family}-${fontName.style}`;
  }
  var init_load_fonts_async = __esm({
    "node_modules/@create-figma-plugin/utilities/lib/node/load-fonts-async.js"() {
    }
  });

  // node_modules/@create-figma-plugin/utilities/lib/ui.js
  function showUI(options, data) {
    if (typeof __html__ === "undefined") {
      throw new Error("No UI defined");
    }
    const html = `<div id="create-figma-plugin"></div><script>document.body.classList.add('theme-${figma.editorType}');const __FIGMA_COMMAND__='${typeof figma.command === "undefined" ? "" : figma.command}';const __SHOW_UI_DATA__=${JSON.stringify(typeof data === "undefined" ? {} : data)};${__html__}<\/script>`;
    figma.showUI(html, __spreadProps(__spreadValues({}, options), {
      themeColors: typeof options.themeColors === "undefined" ? true : options.themeColors
    }));
  }
  var init_ui = __esm({
    "node_modules/@create-figma-plugin/utilities/lib/ui.js"() {
    }
  });

  // node_modules/@create-figma-plugin/utilities/lib/index.js
  var init_lib = __esm({
    "node_modules/@create-figma-plugin/utilities/lib/index.js"() {
      init_events();
      init_load_fonts_async();
      init_ui();
    }
  });

  // src/tolgee.ts
  var TOLGEE_PREFIX, TOLGEE_PLUGIN_CONFIG_NAME;
  var init_tolgee = __esm({
    "src/tolgee.ts"() {
      "use strict";
      TOLGEE_PREFIX = "t:";
      TOLGEE_PLUGIN_CONFIG_NAME = "tolgee_config";
    }
  });

  // src/setup/main.ts
  var main_exports = {};
  __export(main_exports, {
    default: () => main_default
  });
  async function main_default() {
    once("SETUP", (config2) => {
      figma.currentPage.setPluginData(TOLGEE_PLUGIN_CONFIG_NAME, JSON.stringify(config2));
      figma.notify("Tolgee credentials saved.");
      figma.closePlugin();
    });
    once("CLOSE", function() {
      figma.closePlugin();
    });
    const nodes = figma.currentPage.children.filter((node) => node.type === "TEXT" && node.name.startsWith(TOLGEE_PREFIX)).map((node) => ({ name: node.name, characters: node.characters, id: node.id }));
    const pluginData = figma.currentPage.getPluginData(TOLGEE_PLUGIN_CONFIG_NAME);
    const config = pluginData !== "" ? JSON.parse(figma.currentPage.getPluginData(TOLGEE_PLUGIN_CONFIG_NAME)) : null;
    showUI({
      height: 320,
      width: 300,
      title: "Tolgee Settings"
    }, { config, nodes });
  }
  var init_main = __esm({
    "src/setup/main.ts"() {
      "use strict";
      init_lib();
      init_tolgee();
    }
  });

  // src/syncFigmaToTolgee/main.ts
  var main_exports2 = {};
  __export(main_exports2, {
    default: () => main_default2
  });
  async function main_default2() {
    once("SYNC_COMPLETE", () => {
      figma.notify("Synchronization completed.");
      figma.closePlugin();
    });
    once("CLOSE", function() {
      figma.closePlugin();
    });
    on("UPDATE_NODES", async (nodes2) => {
      const textNodes = nodes2.map((n) => figma.getNodeById(n.id));
      await loadFontsAsync(textNodes);
      nodes2.forEach(async (n) => {
        const node = textNodes.find((nod) => nod.id === n.id);
        node.autoRename = false;
        node.characters = n.characters;
      });
    });
    let nodes = [];
    const conflictingNodes = [];
    figma.currentPage.children.filter((node) => node.type === "TEXT" && node.name.startsWith(TOLGEE_PREFIX)).map((node) => ({ name: node.name, characters: node.characters, id: node.id })).forEach((node) => {
      if (nodes.findIndex((n) => n.characters === node.characters && node.name === n.name) === -1) {
        nodes.push(node);
      }
      const conflictingNode = nodes.find((n) => n.name === node.name && n.characters !== node.characters);
      if (conflictingNode) {
        conflictingNodes.push(conflictingNode);
      }
    });
    nodes = nodes.sort((n1, n2) => {
      if (conflictingNodes.includes(n1) && conflictingNodes.includes(n2) && n1.name === n2.name) {
        return -1;
      } else {
        return 0;
      }
    });
    const pluginData = figma.currentPage.getPluginData(TOLGEE_PLUGIN_CONFIG_NAME);
    const config = pluginData !== "" ? JSON.parse(figma.currentPage.getPluginData(TOLGEE_PLUGIN_CONFIG_NAME)) : null;
    if (config && config.lang && config.apiKey && config.url) {
      showUI({
        height: 800,
        width: 500,
        title: "Sync Figma to Tolgee"
      }, { config, nodes, conflictingNodes });
    } else {
      figma.notify('Please run "Setup Tolgee" first.');
      figma.closePlugin();
    }
  }
  var init_main2 = __esm({
    "src/syncFigmaToTolgee/main.ts"() {
      "use strict";
      init_lib();
      init_tolgee();
    }
  });

  // src/syncTolgeeToFigma/main.ts
  var main_exports3 = {};
  __export(main_exports3, {
    default: () => main_default3
  });
  async function main_default3() {
    once("SYNC_COMPLETE", () => {
      figma.notify("Synchronization completed.");
      figma.closePlugin();
    });
    once("CLOSE", function() {
      figma.closePlugin();
    });
    on("UPDATE_NODES", async (nodes2) => {
      const textNodes = nodes2.map((n) => figma.getNodeById(n.id));
      await loadFontsAsync(textNodes);
      nodes2.forEach(async (n) => {
        const node = textNodes.find((nod) => nod.id === n.id);
        node.autoRename = false;
        node.characters = n.characters;
      });
      figma.notify("Document translations updated");
      figma.closePlugin();
    });
    const nodes = figma.currentPage.children.filter((node) => node.type === "TEXT" && node.name.startsWith(TOLGEE_PREFIX)).map((node) => ({ name: node.name, characters: node.characters, id: node.id }));
    const pluginData = figma.currentPage.getPluginData(TOLGEE_PLUGIN_CONFIG_NAME);
    const config = pluginData !== "" ? JSON.parse(figma.currentPage.getPluginData(TOLGEE_PLUGIN_CONFIG_NAME)) : null;
    if (config && config.lang && config.apiKey && config.url) {
      console.log("CONFIG FOUND: ", config);
      showUI({
        height: 800,
        width: 500,
        title: "Sync Tolgee to Figma"
      }, { config, nodes });
    } else {
      console.log("NO CONFIG FOUND");
      figma.notify('Please run "Setup Tolgee" first.');
      figma.closePlugin();
    }
  }
  var init_main3 = __esm({
    "src/syncTolgeeToFigma/main.ts"() {
      "use strict";
      init_lib();
      init_tolgee();
    }
  });

  // <stdin>
  var modules = { "src/setup/main.ts--default": (init_main(), __toCommonJS(main_exports))["default"], "src/syncFigmaToTolgee/main.ts--default": (init_main2(), __toCommonJS(main_exports2))["default"], "src/syncTolgeeToFigma/main.ts--default": (init_main3(), __toCommonJS(main_exports3))["default"] };
  var commandId = typeof figma.command === "undefined" || figma.command === "" ? "src/setup/main.ts--default" : figma.command;
  modules[commandId]();
})();
