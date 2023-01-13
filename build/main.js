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
  function invokeEventHandler(name, args) {
    for (const id in eventHandlers) {
      if (eventHandlers[id].name === name) {
        eventHandlers[id].handler.apply(null, args);
      }
    }
  }
  var eventHandlers, currentId, emit;
  var init_events = __esm({
    "node_modules/@create-figma-plugin/utilities/lib/events.js"() {
      eventHandlers = {};
      currentId = 0;
      emit = typeof window === "undefined" ? function(name, ...args) {
        figma.ui.postMessage([name, ...args]);
      } : function(name, ...args) {
        window.parent.postMessage({
          pluginMessage: [name, ...args]
        }, "*");
      };
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
  var TOLGEE_PLUGIN_CONFIG_NAME, TOLGEE_NODE_KEY;
  var init_tolgee = __esm({
    "src/tolgee.ts"() {
      "use strict";
      TOLGEE_PLUGIN_CONFIG_NAME = "tolgee_config";
      TOLGEE_NODE_KEY = "tolgee_key";
    }
  });

  // src/setup/views/routes.ts
  var DEFAULT_SIZE, SIZES, getWindowSize;
  var init_routes = __esm({
    "src/setup/views/routes.ts"() {
      "use strict";
      DEFAULT_SIZE = { width: 500, height: 400 };
      SIZES = {
        settings: { width: 300, height: 500 }
      };
      getWindowSize = (routeKey) => {
        return SIZES[routeKey] || DEFAULT_SIZE;
      };
    }
  });

  // src/setup/main.ts
  var main_exports = {};
  __export(main_exports, {
    default: () => main_default
  });
  async function main_default() {
    figma.on("selectionchange", () => {
      const nodes = findTextNodes();
      emit("SELECTION_CHANGE", nodes);
    });
    on("SETUP", (config2) => {
      setPluginData(config2);
      figma.notify("Tolgee credentials saved.");
    });
    on("SET_LANGUAGE", (lang) => {
      const pluginData = getPluginData();
      const data = __spreadProps(__spreadValues({}, pluginData), { lang });
      setPluginData(data);
    });
    on("RESIZE", (size) => {
      figma.ui.resize(size.width, size.height);
    });
    on("SYNC_COMPLETE", () => {
      figma.notify("Synchronization completed.");
      figma.closePlugin();
    });
    on("UPDATE_NODES", async (nodes) => {
      const textNodes = nodes.map((n) => figma.getNodeById(n.id));
      await loadFontsAsync(textNodes);
      nodes.forEach(async (n) => {
        const node = textNodes.find((nod) => nod.id === n.id);
        node.autoRename = false;
        node.characters = n.characters;
      });
    });
    on("SET_NODE_CONNECTION", (nodeId, key) => {
      const node = figma.getNodeById(nodeId);
      node == null ? void 0 : node.setPluginData(TOLGEE_NODE_KEY, key);
      const nodes = findTextNodes();
      emit("SELECTION_CHANGE", nodes);
    });
    const config = getPluginData();
    showUI(
      __spreadValues({
        title: "Tolgee"
      }, getWindowSize("index")),
      { config, nodes: findTextNodes() }
    );
  }
  var findTextNodes, getPluginData, setPluginData;
  var init_main = __esm({
    "src/setup/main.ts"() {
      "use strict";
      init_lib();
      init_tolgee();
      init_routes();
      findTextNodes = (nodes) => {
        if (!nodes) {
          return findTextNodes(figma.currentPage.selection || []);
        }
        let result = [];
        for (const node of nodes) {
          if (node.type === "TEXT") {
            result.push({
              id: node.id,
              name: node.name,
              characters: node.characters,
              key: node.getPluginData(TOLGEE_NODE_KEY)
            });
          }
          if (node.children) {
            result = result.concat(findTextNodes(node.children));
          }
        }
        return result;
      };
      getPluginData = () => {
        const pluginData = figma.currentPage.getPluginData(TOLGEE_PLUGIN_CONFIG_NAME);
        return pluginData !== "" ? JSON.parse(
          figma.currentPage.getPluginData(TOLGEE_PLUGIN_CONFIG_NAME)
        ) : {};
      };
      setPluginData = (data) => {
        figma.currentPage.setPluginData(
          TOLGEE_PLUGIN_CONFIG_NAME,
          JSON.stringify(data)
        );
        emit("CONFIG_CHANGE", data);
      };
    }
  });

  // <stdin>
  var modules = { "src/setup/main.ts--default": (init_main(), __toCommonJS(main_exports))["default"] };
  var commandId = true ? "src/setup/main.ts--default" : figma.command;
  modules[commandId]();
})();
