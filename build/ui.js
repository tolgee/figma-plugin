(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a4, b3) => {
    for (var prop in b3 || (b3 = {}))
      if (__hasOwnProp.call(b3, prop))
        __defNormalProp(a4, prop, b3[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b3)) {
        if (__propIsEnum.call(b3, prop))
          __defNormalProp(a4, prop, b3[prop]);
      }
    return a4;
  };
  var __spreadProps = (a4, b3) => __defProps(a4, __getOwnPropDescs(b3));
  var __objRest = (source, exclude) => {
    var target = {};
    for (var prop in source)
      if (__hasOwnProp.call(source, prop) && exclude.indexOf(prop) < 0)
        target[prop] = source[prop];
    if (source != null && __getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(source)) {
        if (exclude.indexOf(prop) < 0 && __propIsEnum.call(source, prop))
          target[prop] = source[prop];
      }
    return target;
  };
  var __esm = (fn2, res) => function __init() {
    return fn2 && (res = (0, fn2[__getOwnPropNames(fn2)[0]])(fn2 = 0)), res;
  };
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
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
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // node_modules/preact/dist/preact.module.js
  function s(n2, l3) {
    for (var u3 in l3)
      n2[u3] = l3[u3];
    return n2;
  }
  function a(n2) {
    var l3 = n2.parentNode;
    l3 && l3.removeChild(n2);
  }
  function h(l3, u3, i4) {
    var t3, o3, r4, f4 = {};
    for (r4 in u3)
      "key" == r4 ? t3 = u3[r4] : "ref" == r4 ? o3 = u3[r4] : f4[r4] = u3[r4];
    if (arguments.length > 2 && (f4.children = arguments.length > 3 ? n.call(arguments, 2) : i4), "function" == typeof l3 && null != l3.defaultProps)
      for (r4 in l3.defaultProps)
        void 0 === f4[r4] && (f4[r4] = l3.defaultProps[r4]);
    return v(l3, f4, t3, o3, null);
  }
  function v(n2, i4, t3, o3, r4) {
    var f4 = { type: n2, props: i4, key: t3, ref: o3, __k: null, __: null, __b: 0, __e: null, __d: void 0, __c: null, __h: null, constructor: void 0, __v: null == r4 ? ++u : r4 };
    return null == r4 && null != l.vnode && l.vnode(f4), f4;
  }
  function y() {
    return { current: null };
  }
  function p(n2) {
    return n2.children;
  }
  function d(n2, l3) {
    this.props = n2, this.context = l3;
  }
  function _(n2, l3) {
    if (null == l3)
      return n2.__ ? _(n2.__, n2.__.__k.indexOf(n2) + 1) : null;
    for (var u3; l3 < n2.__k.length; l3++)
      if (null != (u3 = n2.__k[l3]) && null != u3.__e)
        return u3.__e;
    return "function" == typeof n2.type ? _(n2) : null;
  }
  function k(n2) {
    var l3, u3;
    if (null != (n2 = n2.__) && null != n2.__c) {
      for (n2.__e = n2.__c.base = null, l3 = 0; l3 < n2.__k.length; l3++)
        if (null != (u3 = n2.__k[l3]) && null != u3.__e) {
          n2.__e = n2.__c.base = u3.__e;
          break;
        }
      return k(n2);
    }
  }
  function b(n2) {
    (!n2.__d && (n2.__d = true) && t.push(n2) && !g.__r++ || o !== l.debounceRendering) && ((o = l.debounceRendering) || setTimeout)(g);
  }
  function g() {
    for (var n2; g.__r = t.length; )
      n2 = t.sort(function(n3, l3) {
        return n3.__v.__b - l3.__v.__b;
      }), t = [], n2.some(function(n3) {
        var l3, u3, i4, t3, o3, r4;
        n3.__d && (o3 = (t3 = (l3 = n3).__v).__e, (r4 = l3.__P) && (u3 = [], (i4 = s({}, t3)).__v = t3.__v + 1, j(r4, t3, i4, l3.__n, void 0 !== r4.ownerSVGElement, null != t3.__h ? [o3] : null, u3, null == o3 ? _(t3) : o3, t3.__h), z(u3, t3), t3.__e != o3 && k(t3)));
      });
  }
  function w(n2, l3, u3, i4, t3, o3, r4, c3, s3, a4) {
    var h4, y3, d4, k4, b3, g4, w4, x4 = i4 && i4.__k || e, C3 = x4.length;
    for (u3.__k = [], h4 = 0; h4 < l3.length; h4++)
      if (null != (k4 = u3.__k[h4] = null == (k4 = l3[h4]) || "boolean" == typeof k4 ? null : "string" == typeof k4 || "number" == typeof k4 || "bigint" == typeof k4 ? v(null, k4, null, null, k4) : Array.isArray(k4) ? v(p, { children: k4 }, null, null, null) : k4.__b > 0 ? v(k4.type, k4.props, k4.key, k4.ref ? k4.ref : null, k4.__v) : k4)) {
        if (k4.__ = u3, k4.__b = u3.__b + 1, null === (d4 = x4[h4]) || d4 && k4.key == d4.key && k4.type === d4.type)
          x4[h4] = void 0;
        else
          for (y3 = 0; y3 < C3; y3++) {
            if ((d4 = x4[y3]) && k4.key == d4.key && k4.type === d4.type) {
              x4[y3] = void 0;
              break;
            }
            d4 = null;
          }
        j(n2, k4, d4 = d4 || f, t3, o3, r4, c3, s3, a4), b3 = k4.__e, (y3 = k4.ref) && d4.ref != y3 && (w4 || (w4 = []), d4.ref && w4.push(d4.ref, null, k4), w4.push(y3, k4.__c || b3, k4)), null != b3 ? (null == g4 && (g4 = b3), "function" == typeof k4.type && k4.__k === d4.__k ? k4.__d = s3 = m(k4, s3, n2) : s3 = A(n2, k4, d4, x4, b3, s3), "function" == typeof u3.type && (u3.__d = s3)) : s3 && d4.__e == s3 && s3.parentNode != n2 && (s3 = _(d4));
      }
    for (u3.__e = g4, h4 = C3; h4--; )
      null != x4[h4] && N(x4[h4], x4[h4]);
    if (w4)
      for (h4 = 0; h4 < w4.length; h4++)
        M(w4[h4], w4[++h4], w4[++h4]);
  }
  function m(n2, l3, u3) {
    for (var i4, t3 = n2.__k, o3 = 0; t3 && o3 < t3.length; o3++)
      (i4 = t3[o3]) && (i4.__ = n2, l3 = "function" == typeof i4.type ? m(i4, l3, u3) : A(u3, i4, i4, t3, i4.__e, l3));
    return l3;
  }
  function x(n2, l3) {
    return l3 = l3 || [], null == n2 || "boolean" == typeof n2 || (Array.isArray(n2) ? n2.some(function(n3) {
      x(n3, l3);
    }) : l3.push(n2)), l3;
  }
  function A(n2, l3, u3, i4, t3, o3) {
    var r4, f4, e3;
    if (void 0 !== l3.__d)
      r4 = l3.__d, l3.__d = void 0;
    else if (null == u3 || t3 != o3 || null == t3.parentNode)
      n:
        if (null == o3 || o3.parentNode !== n2)
          n2.appendChild(t3), r4 = null;
        else {
          for (f4 = o3, e3 = 0; (f4 = f4.nextSibling) && e3 < i4.length; e3 += 1)
            if (f4 == t3)
              break n;
          n2.insertBefore(t3, o3), r4 = o3;
        }
    return void 0 !== r4 ? r4 : t3.nextSibling;
  }
  function C(n2, l3, u3, i4, t3) {
    var o3;
    for (o3 in u3)
      "children" === o3 || "key" === o3 || o3 in l3 || H(n2, o3, null, u3[o3], i4);
    for (o3 in l3)
      t3 && "function" != typeof l3[o3] || "children" === o3 || "key" === o3 || "value" === o3 || "checked" === o3 || u3[o3] === l3[o3] || H(n2, o3, l3[o3], u3[o3], i4);
  }
  function $(n2, l3, u3) {
    "-" === l3[0] ? n2.setProperty(l3, u3) : n2[l3] = null == u3 ? "" : "number" != typeof u3 || c.test(l3) ? u3 : u3 + "px";
  }
  function H(n2, l3, u3, i4, t3) {
    var o3;
    n:
      if ("style" === l3)
        if ("string" == typeof u3)
          n2.style.cssText = u3;
        else {
          if ("string" == typeof i4 && (n2.style.cssText = i4 = ""), i4)
            for (l3 in i4)
              u3 && l3 in u3 || $(n2.style, l3, "");
          if (u3)
            for (l3 in u3)
              i4 && u3[l3] === i4[l3] || $(n2.style, l3, u3[l3]);
        }
      else if ("o" === l3[0] && "n" === l3[1])
        o3 = l3 !== (l3 = l3.replace(/Capture$/, "")), l3 = l3.toLowerCase() in n2 ? l3.toLowerCase().slice(2) : l3.slice(2), n2.l || (n2.l = {}), n2.l[l3 + o3] = u3, u3 ? i4 || n2.addEventListener(l3, o3 ? T : I, o3) : n2.removeEventListener(l3, o3 ? T : I, o3);
      else if ("dangerouslySetInnerHTML" !== l3) {
        if (t3)
          l3 = l3.replace(/xlink(H|:h)/, "h").replace(/sName$/, "s");
        else if ("href" !== l3 && "list" !== l3 && "form" !== l3 && "tabIndex" !== l3 && "download" !== l3 && l3 in n2)
          try {
            n2[l3] = null == u3 ? "" : u3;
            break n;
          } catch (n3) {
          }
        "function" == typeof u3 || (null == u3 || false === u3 && -1 == l3.indexOf("-") ? n2.removeAttribute(l3) : n2.setAttribute(l3, u3));
      }
  }
  function I(n2) {
    this.l[n2.type + false](l.event ? l.event(n2) : n2);
  }
  function T(n2) {
    this.l[n2.type + true](l.event ? l.event(n2) : n2);
  }
  function j(n2, u3, i4, t3, o3, r4, f4, e3, c3) {
    var a4, h4, v4, y3, _3, k4, b3, g4, m3, x4, A4, C3, $3, H3, I3, T4 = u3.type;
    if (void 0 !== u3.constructor)
      return null;
    null != i4.__h && (c3 = i4.__h, e3 = u3.__e = i4.__e, u3.__h = null, r4 = [e3]), (a4 = l.__b) && a4(u3);
    try {
      n:
        if ("function" == typeof T4) {
          if (g4 = u3.props, m3 = (a4 = T4.contextType) && t3[a4.__c], x4 = a4 ? m3 ? m3.props.value : a4.__ : t3, i4.__c ? b3 = (h4 = u3.__c = i4.__c).__ = h4.__E : ("prototype" in T4 && T4.prototype.render ? u3.__c = h4 = new T4(g4, x4) : (u3.__c = h4 = new d(g4, x4), h4.constructor = T4, h4.render = O), m3 && m3.sub(h4), h4.props = g4, h4.state || (h4.state = {}), h4.context = x4, h4.__n = t3, v4 = h4.__d = true, h4.__h = [], h4._sb = []), null == h4.__s && (h4.__s = h4.state), null != T4.getDerivedStateFromProps && (h4.__s == h4.state && (h4.__s = s({}, h4.__s)), s(h4.__s, T4.getDerivedStateFromProps(g4, h4.__s))), y3 = h4.props, _3 = h4.state, v4)
            null == T4.getDerivedStateFromProps && null != h4.componentWillMount && h4.componentWillMount(), null != h4.componentDidMount && h4.__h.push(h4.componentDidMount);
          else {
            if (null == T4.getDerivedStateFromProps && g4 !== y3 && null != h4.componentWillReceiveProps && h4.componentWillReceiveProps(g4, x4), !h4.__e && null != h4.shouldComponentUpdate && false === h4.shouldComponentUpdate(g4, h4.__s, x4) || u3.__v === i4.__v) {
              for (h4.props = g4, h4.state = h4.__s, u3.__v !== i4.__v && (h4.__d = false), h4.__v = u3, u3.__e = i4.__e, u3.__k = i4.__k, u3.__k.forEach(function(n3) {
                n3 && (n3.__ = u3);
              }), A4 = 0; A4 < h4._sb.length; A4++)
                h4.__h.push(h4._sb[A4]);
              h4._sb = [], h4.__h.length && f4.push(h4);
              break n;
            }
            null != h4.componentWillUpdate && h4.componentWillUpdate(g4, h4.__s, x4), null != h4.componentDidUpdate && h4.__h.push(function() {
              h4.componentDidUpdate(y3, _3, k4);
            });
          }
          if (h4.context = x4, h4.props = g4, h4.__v = u3, h4.__P = n2, C3 = l.__r, $3 = 0, "prototype" in T4 && T4.prototype.render) {
            for (h4.state = h4.__s, h4.__d = false, C3 && C3(u3), a4 = h4.render(h4.props, h4.state, h4.context), H3 = 0; H3 < h4._sb.length; H3++)
              h4.__h.push(h4._sb[H3]);
            h4._sb = [];
          } else
            do {
              h4.__d = false, C3 && C3(u3), a4 = h4.render(h4.props, h4.state, h4.context), h4.state = h4.__s;
            } while (h4.__d && ++$3 < 25);
          h4.state = h4.__s, null != h4.getChildContext && (t3 = s(s({}, t3), h4.getChildContext())), v4 || null == h4.getSnapshotBeforeUpdate || (k4 = h4.getSnapshotBeforeUpdate(y3, _3)), I3 = null != a4 && a4.type === p && null == a4.key ? a4.props.children : a4, w(n2, Array.isArray(I3) ? I3 : [I3], u3, i4, t3, o3, r4, f4, e3, c3), h4.base = u3.__e, u3.__h = null, h4.__h.length && f4.push(h4), b3 && (h4.__E = h4.__ = null), h4.__e = false;
        } else
          null == r4 && u3.__v === i4.__v ? (u3.__k = i4.__k, u3.__e = i4.__e) : u3.__e = L(i4.__e, u3, i4, t3, o3, r4, f4, c3);
      (a4 = l.diffed) && a4(u3);
    } catch (n3) {
      u3.__v = null, (c3 || null != r4) && (u3.__e = e3, u3.__h = !!c3, r4[r4.indexOf(e3)] = null), l.__e(n3, u3, i4);
    }
  }
  function z(n2, u3) {
    l.__c && l.__c(u3, n2), n2.some(function(u4) {
      try {
        n2 = u4.__h, u4.__h = [], n2.some(function(n3) {
          n3.call(u4);
        });
      } catch (n3) {
        l.__e(n3, u4.__v);
      }
    });
  }
  function L(l3, u3, i4, t3, o3, r4, e3, c3) {
    var s3, h4, v4, y3 = i4.props, p4 = u3.props, d4 = u3.type, k4 = 0;
    if ("svg" === d4 && (o3 = true), null != r4) {
      for (; k4 < r4.length; k4++)
        if ((s3 = r4[k4]) && "setAttribute" in s3 == !!d4 && (d4 ? s3.localName === d4 : 3 === s3.nodeType)) {
          l3 = s3, r4[k4] = null;
          break;
        }
    }
    if (null == l3) {
      if (null === d4)
        return document.createTextNode(p4);
      l3 = o3 ? document.createElementNS("http://www.w3.org/2000/svg", d4) : document.createElement(d4, p4.is && p4), r4 = null, c3 = false;
    }
    if (null === d4)
      y3 === p4 || c3 && l3.data === p4 || (l3.data = p4);
    else {
      if (r4 = r4 && n.call(l3.childNodes), h4 = (y3 = i4.props || f).dangerouslySetInnerHTML, v4 = p4.dangerouslySetInnerHTML, !c3) {
        if (null != r4)
          for (y3 = {}, k4 = 0; k4 < l3.attributes.length; k4++)
            y3[l3.attributes[k4].name] = l3.attributes[k4].value;
        (v4 || h4) && (v4 && (h4 && v4.__html == h4.__html || v4.__html === l3.innerHTML) || (l3.innerHTML = v4 && v4.__html || ""));
      }
      if (C(l3, p4, y3, o3, c3), v4)
        u3.__k = [];
      else if (k4 = u3.props.children, w(l3, Array.isArray(k4) ? k4 : [k4], u3, i4, t3, o3 && "foreignObject" !== d4, r4, e3, r4 ? r4[0] : i4.__k && _(i4, 0), c3), null != r4)
        for (k4 = r4.length; k4--; )
          null != r4[k4] && a(r4[k4]);
      c3 || ("value" in p4 && void 0 !== (k4 = p4.value) && (k4 !== l3.value || "progress" === d4 && !k4 || "option" === d4 && k4 !== y3.value) && H(l3, "value", k4, y3.value, false), "checked" in p4 && void 0 !== (k4 = p4.checked) && k4 !== l3.checked && H(l3, "checked", k4, y3.checked, false));
    }
    return l3;
  }
  function M(n2, u3, i4) {
    try {
      "function" == typeof n2 ? n2(u3) : n2.current = u3;
    } catch (n3) {
      l.__e(n3, i4);
    }
  }
  function N(n2, u3, i4) {
    var t3, o3;
    if (l.unmount && l.unmount(n2), (t3 = n2.ref) && (t3.current && t3.current !== n2.__e || M(t3, null, u3)), null != (t3 = n2.__c)) {
      if (t3.componentWillUnmount)
        try {
          t3.componentWillUnmount();
        } catch (n3) {
          l.__e(n3, u3);
        }
      t3.base = t3.__P = null, n2.__c = void 0;
    }
    if (t3 = n2.__k)
      for (o3 = 0; o3 < t3.length; o3++)
        t3[o3] && N(t3[o3], u3, i4 || "function" != typeof n2.type);
    i4 || null == n2.__e || a(n2.__e), n2.__ = n2.__e = n2.__d = void 0;
  }
  function O(n2, l3, u3) {
    return this.constructor(n2, u3);
  }
  function P(u3, i4, t3) {
    var o3, r4, e3;
    l.__ && l.__(u3, i4), r4 = (o3 = "function" == typeof t3) ? null : t3 && t3.__k || i4.__k, e3 = [], j(i4, u3 = (!o3 && t3 || i4).__k = h(p, null, [u3]), r4 || f, f, void 0 !== i4.ownerSVGElement, !o3 && t3 ? [t3] : r4 ? null : i4.firstChild ? n.call(i4.childNodes) : null, e3, !o3 && t3 ? t3 : r4 ? r4.__e : i4.firstChild, o3), z(e3, u3);
  }
  function S(n2, l3) {
    P(n2, l3, S);
  }
  function q(l3, u3, i4) {
    var t3, o3, r4, f4 = s({}, l3.props);
    for (r4 in u3)
      "key" == r4 ? t3 = u3[r4] : "ref" == r4 ? o3 = u3[r4] : f4[r4] = u3[r4];
    return arguments.length > 2 && (f4.children = arguments.length > 3 ? n.call(arguments, 2) : i4), v(l3.type, f4, t3 || l3.key, o3 || l3.ref, null);
  }
  function B(n2, l3) {
    var u3 = { __c: l3 = "__cC" + r++, __: n2, Consumer: function(n3, l4) {
      return n3.children(l4);
    }, Provider: function(n3) {
      var u4, i4;
      return this.getChildContext || (u4 = [], (i4 = {})[l3] = this, this.getChildContext = function() {
        return i4;
      }, this.shouldComponentUpdate = function(n4) {
        this.props.value !== n4.value && u4.some(b);
      }, this.sub = function(n4) {
        u4.push(n4);
        var l4 = n4.componentWillUnmount;
        n4.componentWillUnmount = function() {
          u4.splice(u4.indexOf(n4), 1), l4 && l4.call(n4);
        };
      }), n3.children;
    } };
    return u3.Provider.__ = u3.Consumer.contextType = u3;
  }
  var n, l, u, i, t, o, r, f, e, c;
  var init_preact_module = __esm({
    "node_modules/preact/dist/preact.module.js"() {
      f = {};
      e = [];
      c = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;
      n = e.slice, l = { __e: function(n2, l3, u3, i4) {
        for (var t3, o3, r4; l3 = l3.__; )
          if ((t3 = l3.__c) && !t3.__)
            try {
              if ((o3 = t3.constructor) && null != o3.getDerivedStateFromError && (t3.setState(o3.getDerivedStateFromError(n2)), r4 = t3.__d), null != t3.componentDidCatch && (t3.componentDidCatch(n2, i4 || {}), r4 = t3.__d), r4)
                return t3.__E = t3;
            } catch (l4) {
              n2 = l4;
            }
        throw n2;
      } }, u = 0, i = function(n2) {
        return null != n2 && void 0 === n2.constructor;
      }, d.prototype.setState = function(n2, l3) {
        var u3;
        u3 = null != this.__s && this.__s !== this.state ? this.__s : this.__s = s({}, this.state), "function" == typeof n2 && (n2 = n2(s({}, u3), this.props)), n2 && s(u3, n2), null != n2 && this.__v && (l3 && this._sb.push(l3), b(this));
      }, d.prototype.forceUpdate = function(n2) {
        this.__v && (this.__e = true, n2 && this.__h.push(n2), b(this));
      }, d.prototype.render = p, t = [], g.__r = 0, r = 0;
    }
  });

  // node_modules/@create-figma-plugin/ui/lib/utilities/create-class-name.js
  function createClassName(classNames) {
    return classNames.filter(function(className) {
      return className !== null;
    }).join(" ");
  }
  var init_create_class_name = __esm({
    "node_modules/@create-figma-plugin/ui/lib/utilities/create-class-name.js"() {
    }
  });

  // ../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/c43e8bfa-c030-4fdd-8356-9d9b94e3dc4b/banner.js
  var banner_default;
  var init_banner = __esm({
    "../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/c43e8bfa-c030-4fdd-8356-9d9b94e3dc4b/banner.js"() {
      if (document.getElementById("3168a726a5") === null) {
        const element = document.createElement("style");
        element.id = "3168a726a5";
        element.textContent = `._banner_1qlmg_1 {
  position: relative;
  display: flex;
  min-height: 48px;
  align-items: center;
  padding: var(--space-small) var(--space-medium) var(--space-small) 44px;
  background-color: var(--figma-color-bg-brand-tertiary);
}
._success_1qlmg_9 {
  background-color: var(--figma-color-bg-success);
}
._warning_1qlmg_12 {
  background-color: var(--figma-color-bg-warning);
}

._icon_1qlmg_16 {
  position: absolute;
  top: 24px;
  left: 24px;
  color: var(--figma-color-icon);
  transform: translate(-50%, -50%);
}
._success_1qlmg_9 ._icon_1qlmg_16 {
  color: var(--figma-color-icon-onsuccess);
}
._warning_1qlmg_12 ._icon_1qlmg_16 {
  color: var(--figma-color-icon-onwarning);
}

._children_1qlmg_30 {
  color: var(--figma-color-text);
}
._success_1qlmg_9 ._children_1qlmg_30 {
  color: var(--figma-color-text-onsuccess);
}
._warning_1qlmg_12 ._children_1qlmg_30 {
  color: var(--figma-color-text-onwarning);
}

/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9AY3JlYXRlLWZpZ21hLXBsdWdpbi91aS9saWIvY29tcG9uZW50cy9iYW5uZXIvYmFubmVyLmNzcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUNFLGtCQUFrQjtFQUNsQixhQUFhO0VBQ2IsZ0JBQWdCO0VBQ2hCLG1CQUFtQjtFQUNuQix1RUFBdUU7RUFDdkUsc0RBQXNEO0FBQ3hEO0FBQ0E7RUFDRSwrQ0FBK0M7QUFDakQ7QUFDQTtFQUNFLCtDQUErQztBQUNqRDs7QUFFQTtFQUNFLGtCQUFrQjtFQUNsQixTQUFTO0VBQ1QsVUFBVTtFQUNWLDhCQUE4QjtFQUM5QixnQ0FBZ0M7QUFDbEM7QUFDQTtFQUNFLHdDQUF3QztBQUMxQztBQUNBO0VBQ0Usd0NBQXdDO0FBQzFDOztBQUVBO0VBQ0UsOEJBQThCO0FBQ2hDO0FBQ0E7RUFDRSx3Q0FBd0M7QUFDMUM7QUFDQTtFQUNFLHdDQUF3QztBQUMxQyIsImZpbGUiOiJub2RlX21vZHVsZXMvQGNyZWF0ZS1maWdtYS1wbHVnaW4vdWkvbGliL2NvbXBvbmVudHMvYmFubmVyL2Jhbm5lci5jc3MiLCJzb3VyY2VzQ29udGVudCI6WyIuYmFubmVyIHtcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xuICBkaXNwbGF5OiBmbGV4O1xuICBtaW4taGVpZ2h0OiA0OHB4O1xuICBhbGlnbi1pdGVtczogY2VudGVyO1xuICBwYWRkaW5nOiB2YXIoLS1zcGFjZS1zbWFsbCkgdmFyKC0tc3BhY2UtbWVkaXVtKSB2YXIoLS1zcGFjZS1zbWFsbCkgNDRweDtcbiAgYmFja2dyb3VuZC1jb2xvcjogdmFyKC0tZmlnbWEtY29sb3ItYmctYnJhbmQtdGVydGlhcnkpO1xufVxuLnN1Y2Nlc3Mge1xuICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1maWdtYS1jb2xvci1iZy1zdWNjZXNzKTtcbn1cbi53YXJuaW5nIHtcbiAgYmFja2dyb3VuZC1jb2xvcjogdmFyKC0tZmlnbWEtY29sb3ItYmctd2FybmluZyk7XG59XG5cbi5pY29uIHtcbiAgcG9zaXRpb246IGFic29sdXRlO1xuICB0b3A6IDI0cHg7XG4gIGxlZnQ6IDI0cHg7XG4gIGNvbG9yOiB2YXIoLS1maWdtYS1jb2xvci1pY29uKTtcbiAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoLTUwJSwgLTUwJSk7XG59XG4uc3VjY2VzcyAuaWNvbiB7XG4gIGNvbG9yOiB2YXIoLS1maWdtYS1jb2xvci1pY29uLW9uc3VjY2Vzcyk7XG59XG4ud2FybmluZyAuaWNvbiB7XG4gIGNvbG9yOiB2YXIoLS1maWdtYS1jb2xvci1pY29uLW9ud2FybmluZyk7XG59XG5cbi5jaGlsZHJlbiB7XG4gIGNvbG9yOiB2YXIoLS1maWdtYS1jb2xvci10ZXh0KTtcbn1cbi5zdWNjZXNzIC5jaGlsZHJlbiB7XG4gIGNvbG9yOiB2YXIoLS1maWdtYS1jb2xvci10ZXh0LW9uc3VjY2Vzcyk7XG59XG4ud2FybmluZyAuY2hpbGRyZW4ge1xuICBjb2xvcjogdmFyKC0tZmlnbWEtY29sb3ItdGV4dC1vbndhcm5pbmcpO1xufVxuIl19 */`;
        document.head.append(element);
      }
      banner_default = { "banner": "_banner_1qlmg_1", "success": "_success_1qlmg_9", "warning": "_warning_1qlmg_12", "icon": "_icon_1qlmg_16", "children": "_children_1qlmg_30" };
    }
  });

  // node_modules/@create-figma-plugin/ui/lib/components/banner/banner.js
  function Banner(_a) {
    var _b = _a, { children, icon, variant } = _b, rest = __objRest(_b, ["children", "icon", "variant"]);
    return h("div", __spreadProps(__spreadValues({}, rest), { class: createClassName([
      banner_default.banner,
      typeof variant === "undefined" ? null : banner_default[variant]
    ]) }), h("div", { class: banner_default.icon }, icon), h("div", { class: banner_default.children }, children));
  }
  var init_banner2 = __esm({
    "node_modules/@create-figma-plugin/ui/lib/components/banner/banner.js"() {
      init_preact_module();
      init_create_class_name();
      init_banner();
    }
  });

  // node_modules/preact/hooks/dist/hooks.module.js
  function d2(t3, u3) {
    l.__h && l.__h(r2, t3, o2 || u3), o2 = 0;
    var i4 = r2.__H || (r2.__H = { __: [], __h: [] });
    return t3 >= i4.__.length && i4.__.push({ __V: c2 }), i4.__[t3];
  }
  function p2(n2) {
    return o2 = 1, y2(B2, n2);
  }
  function y2(n2, u3, i4) {
    var o3 = d2(t2++, 2);
    if (o3.t = n2, !o3.__c && (o3.__ = [i4 ? i4(u3) : B2(void 0, u3), function(n3) {
      var t3 = o3.__N ? o3.__N[0] : o3.__[0], r4 = o3.t(t3, n3);
      t3 !== r4 && (o3.__N = [r4, o3.__[1]], o3.__c.setState({}));
    }], o3.__c = r2, !r2.u)) {
      r2.u = true;
      var f4 = r2.shouldComponentUpdate;
      r2.shouldComponentUpdate = function(n3, t3, r4) {
        if (!o3.__c.__H)
          return true;
        var u4 = o3.__c.__H.__.filter(function(n4) {
          return n4.__c;
        });
        if (u4.every(function(n4) {
          return !n4.__N;
        }))
          return !f4 || f4.call(this, n3, t3, r4);
        var i5 = false;
        return u4.forEach(function(n4) {
          if (n4.__N) {
            var t4 = n4.__[0];
            n4.__ = n4.__N, n4.__N = void 0, t4 !== n4.__[0] && (i5 = true);
          }
        }), !(!i5 && o3.__c.props === n3) && (!f4 || f4.call(this, n3, t3, r4));
      };
    }
    return o3.__N || o3.__;
  }
  function h2(u3, i4) {
    var o3 = d2(t2++, 3);
    !l.__s && z2(o3.__H, i4) && (o3.__ = u3, o3.i = i4, r2.__H.__h.push(o3));
  }
  function s2(u3, i4) {
    var o3 = d2(t2++, 4);
    !l.__s && z2(o3.__H, i4) && (o3.__ = u3, o3.i = i4, r2.__h.push(o3));
  }
  function _2(n2) {
    return o2 = 5, F(function() {
      return { current: n2 };
    }, []);
  }
  function A2(n2, t3, r4) {
    o2 = 6, s2(function() {
      return "function" == typeof n2 ? (n2(t3()), function() {
        return n2(null);
      }) : n2 ? (n2.current = t3(), function() {
        return n2.current = null;
      }) : void 0;
    }, null == r4 ? r4 : r4.concat(n2));
  }
  function F(n2, r4) {
    var u3 = d2(t2++, 7);
    return z2(u3.__H, r4) ? (u3.__V = n2(), u3.i = r4, u3.__h = n2, u3.__V) : u3.__;
  }
  function T2(n2, t3) {
    return o2 = 8, F(function() {
      return n2;
    }, t3);
  }
  function q2(n2) {
    var u3 = r2.context[n2.__c], i4 = d2(t2++, 9);
    return i4.c = n2, u3 ? (null == i4.__ && (i4.__ = true, u3.sub(r2)), u3.props.value) : n2.__;
  }
  function x2(t3, r4) {
    l.useDebugValue && l.useDebugValue(r4 ? r4(t3) : t3);
  }
  function V() {
    var n2 = d2(t2++, 11);
    if (!n2.__) {
      for (var u3 = r2.__v; null !== u3 && !u3.__m && null !== u3.__; )
        u3 = u3.__;
      var i4 = u3.__m || (u3.__m = [0, 0]);
      n2.__ = "P" + i4[0] + "-" + i4[1]++;
    }
    return n2.__;
  }
  function b2() {
    for (var t3; t3 = f2.shift(); )
      if (t3.__P && t3.__H)
        try {
          t3.__H.__h.forEach(k2), t3.__H.__h.forEach(w2), t3.__H.__h = [];
        } catch (r4) {
          t3.__H.__h = [], l.__e(r4, t3.__v);
        }
  }
  function j2(n2) {
    var t3, r4 = function() {
      clearTimeout(u3), g2 && cancelAnimationFrame(t3), setTimeout(n2);
    }, u3 = setTimeout(r4, 100);
    g2 && (t3 = requestAnimationFrame(r4));
  }
  function k2(n2) {
    var t3 = r2, u3 = n2.__c;
    "function" == typeof u3 && (n2.__c = void 0, u3()), r2 = t3;
  }
  function w2(n2) {
    var t3 = r2;
    n2.__c = n2.__(), r2 = t3;
  }
  function z2(n2, t3) {
    return !n2 || n2.length !== t3.length || t3.some(function(t4, r4) {
      return t4 !== n2[r4];
    });
  }
  function B2(n2, t3) {
    return "function" == typeof t3 ? t3(n2) : t3;
  }
  var t2, r2, u2, i2, o2, f2, c2, e2, a2, v2, l2, m2, g2;
  var init_hooks_module = __esm({
    "node_modules/preact/hooks/dist/hooks.module.js"() {
      init_preact_module();
      o2 = 0;
      f2 = [];
      c2 = [];
      e2 = l.__b;
      a2 = l.__r;
      v2 = l.diffed;
      l2 = l.__c;
      m2 = l.unmount;
      l.__b = function(n2) {
        r2 = null, e2 && e2(n2);
      }, l.__r = function(n2) {
        a2 && a2(n2), t2 = 0;
        var i4 = (r2 = n2.__c).__H;
        i4 && (u2 === r2 ? (i4.__h = [], r2.__h = [], i4.__.forEach(function(n3) {
          n3.__N && (n3.__ = n3.__N), n3.__V = c2, n3.__N = n3.i = void 0;
        })) : (i4.__h.forEach(k2), i4.__h.forEach(w2), i4.__h = [])), u2 = r2;
      }, l.diffed = function(t3) {
        v2 && v2(t3);
        var o3 = t3.__c;
        o3 && o3.__H && (o3.__H.__h.length && (1 !== f2.push(o3) && i2 === l.requestAnimationFrame || ((i2 = l.requestAnimationFrame) || j2)(b2)), o3.__H.__.forEach(function(n2) {
          n2.i && (n2.__H = n2.i), n2.__V !== c2 && (n2.__ = n2.__V), n2.i = void 0, n2.__V = c2;
        })), u2 = r2 = null;
      }, l.__c = function(t3, r4) {
        r4.some(function(t4) {
          try {
            t4.__h.forEach(k2), t4.__h = t4.__h.filter(function(n2) {
              return !n2.__ || w2(n2);
            });
          } catch (u3) {
            r4.some(function(n2) {
              n2.__h && (n2.__h = []);
            }), r4 = [], l.__e(u3, t4.__v);
          }
        }), l2 && l2(t3, r4);
      }, l.unmount = function(t3) {
        m2 && m2(t3);
        var r4, u3 = t3.__c;
        u3 && u3.__H && (u3.__H.__.forEach(function(n2) {
          try {
            k2(n2);
          } catch (n3) {
            r4 = n3;
          }
        }), u3.__H = void 0, r4 && l.__e(r4, u3.__v));
      };
      g2 = "function" == typeof requestAnimationFrame;
    }
  });

  // ../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/a6182fa1-2fb6-4808-8172-484fbfeb2b0c/loading-indicator.js
  var loading_indicator_default;
  var init_loading_indicator = __esm({
    "../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/a6182fa1-2fb6-4808-8172-484fbfeb2b0c/loading-indicator.js"() {
      if (document.getElementById("25a2c53e04") === null) {
        const element = document.createElement("style");
        element.id = "25a2c53e04";
        element.textContent = `._loadingIndicator_pl5c3_1 {
  position: relative;
  width: 16px;
  height: 16px;
  margin: 0 auto;
}

._svg_pl5c3_8 {
  position: absolute;
  top: 0;
  left: 0;
  width: 16px;
  height: 16px;
  animation: _rotating_pl5c3_1 0.5s linear infinite;
  fill: currentColor;
}

@keyframes _rotating_pl5c3_1 {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9AY3JlYXRlLWZpZ21hLXBsdWdpbi91aS9saWIvY29tcG9uZW50cy9sb2FkaW5nLWluZGljYXRvci9sb2FkaW5nLWluZGljYXRvci5jc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFDRSxrQkFBa0I7RUFDbEIsV0FBVztFQUNYLFlBQVk7RUFDWixjQUFjO0FBQ2hCOztBQUVBO0VBQ0Usa0JBQWtCO0VBQ2xCLE1BQU07RUFDTixPQUFPO0VBQ1AsV0FBVztFQUNYLFlBQVk7RUFDWixpREFBd0M7RUFDeEMsa0JBQWtCO0FBQ3BCOztBQUVBO0VBQ0U7SUFDRSx1QkFBdUI7RUFDekI7RUFDQTtJQUNFLHlCQUF5QjtFQUMzQjtBQUNGIiwiZmlsZSI6Im5vZGVfbW9kdWxlcy9AY3JlYXRlLWZpZ21hLXBsdWdpbi91aS9saWIvY29tcG9uZW50cy9sb2FkaW5nLWluZGljYXRvci9sb2FkaW5nLWluZGljYXRvci5jc3MiLCJzb3VyY2VzQ29udGVudCI6WyIubG9hZGluZ0luZGljYXRvciB7XG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgd2lkdGg6IDE2cHg7XG4gIGhlaWdodDogMTZweDtcbiAgbWFyZ2luOiAwIGF1dG87XG59XG5cbi5zdmcge1xuICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gIHRvcDogMDtcbiAgbGVmdDogMDtcbiAgd2lkdGg6IDE2cHg7XG4gIGhlaWdodDogMTZweDtcbiAgYW5pbWF0aW9uOiByb3RhdGluZyAwLjVzIGxpbmVhciBpbmZpbml0ZTtcbiAgZmlsbDogY3VycmVudENvbG9yO1xufVxuXG5Aa2V5ZnJhbWVzIHJvdGF0aW5nIHtcbiAgZnJvbSB7XG4gICAgdHJhbnNmb3JtOiByb3RhdGUoMGRlZyk7XG4gIH1cbiAgdG8ge1xuICAgIHRyYW5zZm9ybTogcm90YXRlKDM2MGRlZyk7XG4gIH1cbn1cbiJdfQ== */`;
        document.head.append(element);
      }
      loading_indicator_default = { "loadingIndicator": "_loadingIndicator_pl5c3_1", "svg": "_svg_pl5c3_8", "rotating": "_rotating_pl5c3_1" };
    }
  });

  // node_modules/@create-figma-plugin/ui/lib/components/loading-indicator/loading-indicator.js
  function LoadingIndicator(_a) {
    var _b = _a, { color } = _b, rest = __objRest(_b, ["color"]);
    return h("div", __spreadProps(__spreadValues({}, rest), { class: loading_indicator_default.loadingIndicator }), h("svg", { class: loading_indicator_default.svg, style: typeof color === "undefined" ? void 0 : {
      fill: `var(--figma-color-icon-${color})`
    } }, h("path", { d: "M8 15C11.866 15 15 11.866 15 8C15 6.7865 14.6912 5.64511 14.1479 4.65013L15.0263 4.17174C15.6471 5.30882 16 6.6132 16 8C16 12.4183 12.4183 16 8 16C3.58172 16 0 12.4183 0 8C0 5.54138 1.10909 3.34181 2.85426 1.8743L3.47761 2.65678C1.96204 3.94081 1 5.85806 1 8C1 11.866 4.13401 15 8 15Z" })));
  }
  var init_loading_indicator2 = __esm({
    "node_modules/@create-figma-plugin/ui/lib/components/loading-indicator/loading-indicator.js"() {
      init_preact_module();
      init_loading_indicator();
    }
  });

  // ../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/e5148177-c526-4030-8c10-7fb9b175c26f/button.js
  var button_default;
  var init_button = __esm({
    "../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/e5148177-c526-4030-8c10-7fb9b175c26f/button.js"() {
      if (document.getElementById("4698edce65") === null) {
        const element = document.createElement("style");
        element.id = "4698edce65";
        element.textContent = `._button_5fxgc_1 {
  position: relative;
  z-index: var(--z-index-1);
  display: inline-block;
}

._fullWidth_5fxgc_7 {
  display: block;
}

._button_5fxgc_1 button {
  display: inline-block;
  height: 32px;
  border-radius: var(--border-radius-6);
}

._disabled_5fxgc_17 button {
  cursor: not-allowed;
}

._fullWidth_5fxgc_7 button {
  display: block;
  overflow: hidden;
  width: 100%;
  text-overflow: ellipsis;
  white-space: nowrap;
}

._default_5fxgc_29 button {
  padding: 0 14px;
  border: 2px solid transparent;
  background-color: var(--figma-color-bg-brand);
  color: var(--figma-color-text-onbrand);
  line-height: 28px;
}
._default_5fxgc_29:not(._disabled_5fxgc_17) button:focus {
  border-color: var(--figma-color-border-brand-strong);
}
._default_5fxgc_29._disabled_5fxgc_17 button {
  background-color: var(--figma-color-bg-disabled);
  color: var(--figma-color-text-ondisabled);
}

._default_5fxgc_29._danger_5fxgc_44 button {
  background-color: var(--figma-color-bg-danger);
  color: var(--figma-color-text-ondanger);
}
._default_5fxgc_29._danger_5fxgc_44:not(._disabled_5fxgc_17) button:focus {
  border-color: var(--figma-color-border-danger-strong);
}
._default_5fxgc_29._danger_5fxgc_44._disabled_5fxgc_17 button {
  background-color: var(--figma-color-bg-disabled);
  color: var(--figma-color-text-ondisabled);
}

._secondary_5fxgc_56 button {
  padding: 0 15px;
  border: 1px solid var(--figma-color-border-strong);
  background-color: transparent;
  color: var(--figma-color-text);
  line-height: 30px;
}
._secondary_5fxgc_56:not(._disabled_5fxgc_17) button:focus {
  padding: 0 14px;
  border-width: 2px;
  border-color: var(--figma-color-border-brand-strong);
  line-height: 28px;
}
._secondary_5fxgc_56._disabled_5fxgc_17 button {
  border-color: var(--figma-color-border-disabled-strong);
  color: var(--figma-color-text-disabled);
}

._secondary_5fxgc_56._danger_5fxgc_44 button {
  border-color: var(--figma-color-border-danger-strong);
  color: var(--figma-color-text-danger);
}
._secondary_5fxgc_56._danger_5fxgc_44:not(._disabled_5fxgc_17) button:focus {
  border-color: var(--figma-color-border-danger-strong);
}
._secondary_5fxgc_56._danger_5fxgc_44._disabled_5fxgc_17 button {
  border-color: var(--figma-color-border-disabled-strong);
  color: var(--figma-color-text-disabled);
}

._loadingIndicator_5fxgc_86 {
  position: absolute;
  top: 50%;
  left: 50%;
  pointer-events: none;
  transform: translate(-50%, -50%);
}

._default_5fxgc_29 ._loadingIndicator_5fxgc_86 {
  color: var(--figma-color-icon-onbrand);
}
._default_5fxgc_29._disabled_5fxgc_17 ._loadingIndicator_5fxgc_86 {
  color: var(--figma-color-icon-ondisabled);
}

._default_5fxgc_29._danger_5fxgc_44 ._loadingIndicator_5fxgc_86 {
  color: var(--figma-color-icon-ondanger);
}
._default_5fxgc_29._danger_5fxgc_44._disabled_5fxgc_17 ._loadingIndicator_5fxgc_86 {
  color: var(--figma-color-icon-ondisabled);
}

._secondary_5fxgc_56 ._loadingIndicator_5fxgc_86 {
  color: var(--figma-color-text);
}
._secondary_5fxgc_56._disabled_5fxgc_17 ._loadingIndicator_5fxgc_86 {
  color: var(--figma-color-text-disabled);
}

._secondary_5fxgc_56._danger_5fxgc_44 ._loadingIndicator_5fxgc_86 {
  color: var(--figma-color-text-danger);
}
._secondary_5fxgc_56._danger_5fxgc_44._disabled_5fxgc_17 ._loadingIndicator_5fxgc_86 {
  color: var(--figma-color-text-disabled);
}

._children_5fxgc_122 {
  display: inline;
}
._loading_5fxgc_86 ._children_5fxgc_122 {
  visibility: hidden;
}

/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9AY3JlYXRlLWZpZ21hLXBsdWdpbi91aS9saWIvY29tcG9uZW50cy9idXR0b24vYnV0dG9uLmNzcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUNFLGtCQUFrQjtFQUNsQix5QkFBeUI7RUFDekIscUJBQXFCO0FBQ3ZCOztBQUVBO0VBQ0UsY0FBYztBQUNoQjs7QUFFQTtFQUNFLHFCQUFxQjtFQUNyQixZQUFZO0VBQ1oscUNBQXFDO0FBQ3ZDOztBQUVBO0VBQ0UsbUJBQW1CO0FBQ3JCOztBQUVBO0VBQ0UsY0FBYztFQUNkLGdCQUFnQjtFQUNoQixXQUFXO0VBQ1gsdUJBQXVCO0VBQ3ZCLG1CQUFtQjtBQUNyQjs7QUFFQTtFQUNFLGVBQWU7RUFDZiw2QkFBNkI7RUFDN0IsNkNBQTZDO0VBQzdDLHNDQUFzQztFQUN0QyxpQkFBaUI7QUFDbkI7QUFDQTtFQUNFLG9EQUFvRDtBQUN0RDtBQUNBO0VBQ0UsZ0RBQWdEO0VBQ2hELHlDQUF5QztBQUMzQzs7QUFFQTtFQUNFLDhDQUE4QztFQUM5Qyx1Q0FBdUM7QUFDekM7QUFDQTtFQUNFLHFEQUFxRDtBQUN2RDtBQUNBO0VBQ0UsZ0RBQWdEO0VBQ2hELHlDQUF5QztBQUMzQzs7QUFFQTtFQUNFLGVBQWU7RUFDZixrREFBa0Q7RUFDbEQsNkJBQTZCO0VBQzdCLDhCQUE4QjtFQUM5QixpQkFBaUI7QUFDbkI7QUFDQTtFQUNFLGVBQWU7RUFDZixpQkFBaUI7RUFDakIsb0RBQW9EO0VBQ3BELGlCQUFpQjtBQUNuQjtBQUNBO0VBQ0UsdURBQXVEO0VBQ3ZELHVDQUF1QztBQUN6Qzs7QUFFQTtFQUNFLHFEQUFxRDtFQUNyRCxxQ0FBcUM7QUFDdkM7QUFDQTtFQUNFLHFEQUFxRDtBQUN2RDtBQUNBO0VBQ0UsdURBQXVEO0VBQ3ZELHVDQUF1QztBQUN6Qzs7QUFFQTtFQUNFLGtCQUFrQjtFQUNsQixRQUFRO0VBQ1IsU0FBUztFQUNULG9CQUFvQjtFQUNwQixnQ0FBZ0M7QUFDbEM7O0FBRUE7RUFDRSxzQ0FBc0M7QUFDeEM7QUFDQTtFQUNFLHlDQUF5QztBQUMzQzs7QUFFQTtFQUNFLHVDQUF1QztBQUN6QztBQUNBO0VBQ0UseUNBQXlDO0FBQzNDOztBQUVBO0VBQ0UsOEJBQThCO0FBQ2hDO0FBQ0E7RUFDRSx1Q0FBdUM7QUFDekM7O0FBRUE7RUFDRSxxQ0FBcUM7QUFDdkM7QUFDQTtFQUNFLHVDQUF1QztBQUN6Qzs7QUFFQTtFQUNFLGVBQWU7QUFDakI7QUFDQTtFQUNFLGtCQUFrQjtBQUNwQiIsImZpbGUiOiJub2RlX21vZHVsZXMvQGNyZWF0ZS1maWdtYS1wbHVnaW4vdWkvbGliL2NvbXBvbmVudHMvYnV0dG9uL2J1dHRvbi5jc3MiLCJzb3VyY2VzQ29udGVudCI6WyIuYnV0dG9uIHtcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xuICB6LWluZGV4OiB2YXIoLS16LWluZGV4LTEpO1xuICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XG59XG5cbi5mdWxsV2lkdGgge1xuICBkaXNwbGF5OiBibG9jaztcbn1cblxuLmJ1dHRvbiBidXR0b24ge1xuICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XG4gIGhlaWdodDogMzJweDtcbiAgYm9yZGVyLXJhZGl1czogdmFyKC0tYm9yZGVyLXJhZGl1cy02KTtcbn1cblxuLmRpc2FibGVkIGJ1dHRvbiB7XG4gIGN1cnNvcjogbm90LWFsbG93ZWQ7XG59XG5cbi5mdWxsV2lkdGggYnV0dG9uIHtcbiAgZGlzcGxheTogYmxvY2s7XG4gIG92ZXJmbG93OiBoaWRkZW47XG4gIHdpZHRoOiAxMDAlO1xuICB0ZXh0LW92ZXJmbG93OiBlbGxpcHNpcztcbiAgd2hpdGUtc3BhY2U6IG5vd3JhcDtcbn1cblxuLmRlZmF1bHQgYnV0dG9uIHtcbiAgcGFkZGluZzogMCAxNHB4O1xuICBib3JkZXI6IDJweCBzb2xpZCB0cmFuc3BhcmVudDtcbiAgYmFja2dyb3VuZC1jb2xvcjogdmFyKC0tZmlnbWEtY29sb3ItYmctYnJhbmQpO1xuICBjb2xvcjogdmFyKC0tZmlnbWEtY29sb3ItdGV4dC1vbmJyYW5kKTtcbiAgbGluZS1oZWlnaHQ6IDI4cHg7XG59XG4uZGVmYXVsdDpub3QoLmRpc2FibGVkKSBidXR0b246Zm9jdXMge1xuICBib3JkZXItY29sb3I6IHZhcigtLWZpZ21hLWNvbG9yLWJvcmRlci1icmFuZC1zdHJvbmcpO1xufVxuLmRlZmF1bHQuZGlzYWJsZWQgYnV0dG9uIHtcbiAgYmFja2dyb3VuZC1jb2xvcjogdmFyKC0tZmlnbWEtY29sb3ItYmctZGlzYWJsZWQpO1xuICBjb2xvcjogdmFyKC0tZmlnbWEtY29sb3ItdGV4dC1vbmRpc2FibGVkKTtcbn1cblxuLmRlZmF1bHQuZGFuZ2VyIGJ1dHRvbiB7XG4gIGJhY2tncm91bmQtY29sb3I6IHZhcigtLWZpZ21hLWNvbG9yLWJnLWRhbmdlcik7XG4gIGNvbG9yOiB2YXIoLS1maWdtYS1jb2xvci10ZXh0LW9uZGFuZ2VyKTtcbn1cbi5kZWZhdWx0LmRhbmdlcjpub3QoLmRpc2FibGVkKSBidXR0b246Zm9jdXMge1xuICBib3JkZXItY29sb3I6IHZhcigtLWZpZ21hLWNvbG9yLWJvcmRlci1kYW5nZXItc3Ryb25nKTtcbn1cbi5kZWZhdWx0LmRhbmdlci5kaXNhYmxlZCBidXR0b24ge1xuICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1maWdtYS1jb2xvci1iZy1kaXNhYmxlZCk7XG4gIGNvbG9yOiB2YXIoLS1maWdtYS1jb2xvci10ZXh0LW9uZGlzYWJsZWQpO1xufVxuXG4uc2Vjb25kYXJ5IGJ1dHRvbiB7XG4gIHBhZGRpbmc6IDAgMTVweDtcbiAgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tZmlnbWEtY29sb3ItYm9yZGVyLXN0cm9uZyk7XG4gIGJhY2tncm91bmQtY29sb3I6IHRyYW5zcGFyZW50O1xuICBjb2xvcjogdmFyKC0tZmlnbWEtY29sb3ItdGV4dCk7XG4gIGxpbmUtaGVpZ2h0OiAzMHB4O1xufVxuLnNlY29uZGFyeTpub3QoLmRpc2FibGVkKSBidXR0b246Zm9jdXMge1xuICBwYWRkaW5nOiAwIDE0cHg7XG4gIGJvcmRlci13aWR0aDogMnB4O1xuICBib3JkZXItY29sb3I6IHZhcigtLWZpZ21hLWNvbG9yLWJvcmRlci1icmFuZC1zdHJvbmcpO1xuICBsaW5lLWhlaWdodDogMjhweDtcbn1cbi5zZWNvbmRhcnkuZGlzYWJsZWQgYnV0dG9uIHtcbiAgYm9yZGVyLWNvbG9yOiB2YXIoLS1maWdtYS1jb2xvci1ib3JkZXItZGlzYWJsZWQtc3Ryb25nKTtcbiAgY29sb3I6IHZhcigtLWZpZ21hLWNvbG9yLXRleHQtZGlzYWJsZWQpO1xufVxuXG4uc2Vjb25kYXJ5LmRhbmdlciBidXR0b24ge1xuICBib3JkZXItY29sb3I6IHZhcigtLWZpZ21hLWNvbG9yLWJvcmRlci1kYW5nZXItc3Ryb25nKTtcbiAgY29sb3I6IHZhcigtLWZpZ21hLWNvbG9yLXRleHQtZGFuZ2VyKTtcbn1cbi5zZWNvbmRhcnkuZGFuZ2VyOm5vdCguZGlzYWJsZWQpIGJ1dHRvbjpmb2N1cyB7XG4gIGJvcmRlci1jb2xvcjogdmFyKC0tZmlnbWEtY29sb3ItYm9yZGVyLWRhbmdlci1zdHJvbmcpO1xufVxuLnNlY29uZGFyeS5kYW5nZXIuZGlzYWJsZWQgYnV0dG9uIHtcbiAgYm9yZGVyLWNvbG9yOiB2YXIoLS1maWdtYS1jb2xvci1ib3JkZXItZGlzYWJsZWQtc3Ryb25nKTtcbiAgY29sb3I6IHZhcigtLWZpZ21hLWNvbG9yLXRleHQtZGlzYWJsZWQpO1xufVxuXG4ubG9hZGluZ0luZGljYXRvciB7XG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgdG9wOiA1MCU7XG4gIGxlZnQ6IDUwJTtcbiAgcG9pbnRlci1ldmVudHM6IG5vbmU7XG4gIHRyYW5zZm9ybTogdHJhbnNsYXRlKC01MCUsIC01MCUpO1xufVxuXG4uZGVmYXVsdCAubG9hZGluZ0luZGljYXRvciB7XG4gIGNvbG9yOiB2YXIoLS1maWdtYS1jb2xvci1pY29uLW9uYnJhbmQpO1xufVxuLmRlZmF1bHQuZGlzYWJsZWQgLmxvYWRpbmdJbmRpY2F0b3Ige1xuICBjb2xvcjogdmFyKC0tZmlnbWEtY29sb3ItaWNvbi1vbmRpc2FibGVkKTtcbn1cblxuLmRlZmF1bHQuZGFuZ2VyIC5sb2FkaW5nSW5kaWNhdG9yIHtcbiAgY29sb3I6IHZhcigtLWZpZ21hLWNvbG9yLWljb24tb25kYW5nZXIpO1xufVxuLmRlZmF1bHQuZGFuZ2VyLmRpc2FibGVkIC5sb2FkaW5nSW5kaWNhdG9yIHtcbiAgY29sb3I6IHZhcigtLWZpZ21hLWNvbG9yLWljb24tb25kaXNhYmxlZCk7XG59XG5cbi5zZWNvbmRhcnkgLmxvYWRpbmdJbmRpY2F0b3Ige1xuICBjb2xvcjogdmFyKC0tZmlnbWEtY29sb3ItdGV4dCk7XG59XG4uc2Vjb25kYXJ5LmRpc2FibGVkIC5sb2FkaW5nSW5kaWNhdG9yIHtcbiAgY29sb3I6IHZhcigtLWZpZ21hLWNvbG9yLXRleHQtZGlzYWJsZWQpO1xufVxuXG4uc2Vjb25kYXJ5LmRhbmdlciAubG9hZGluZ0luZGljYXRvciB7XG4gIGNvbG9yOiB2YXIoLS1maWdtYS1jb2xvci10ZXh0LWRhbmdlcik7XG59XG4uc2Vjb25kYXJ5LmRhbmdlci5kaXNhYmxlZCAubG9hZGluZ0luZGljYXRvciB7XG4gIGNvbG9yOiB2YXIoLS1maWdtYS1jb2xvci10ZXh0LWRpc2FibGVkKTtcbn1cblxuLmNoaWxkcmVuIHtcbiAgZGlzcGxheTogaW5saW5lO1xufVxuLmxvYWRpbmcgLmNoaWxkcmVuIHtcbiAgdmlzaWJpbGl0eTogaGlkZGVuO1xufVxuIl19 */`;
        document.head.append(element);
      }
      button_default = { "button": "_button_5fxgc_1", "fullWidth": "_fullWidth_5fxgc_7", "disabled": "_disabled_5fxgc_17", "default": "_default_5fxgc_29", "danger": "_danger_5fxgc_44", "secondary": "_secondary_5fxgc_56", "loadingIndicator": "_loadingIndicator_5fxgc_86", "children": "_children_5fxgc_122", "loading": "_loading_5fxgc_86" };
    }
  });

  // node_modules/@create-figma-plugin/ui/lib/components/button/button.js
  function Button(_a) {
    var _b = _a, { children, danger = false, disabled = false, fullWidth = false, loading = false, onClick, propagateEscapeKeyDown = true, secondary = false } = _b, rest = __objRest(_b, ["children", "danger", "disabled", "fullWidth", "loading", "onClick", "propagateEscapeKeyDown", "secondary"]);
    const handleKeyDown = T2(function(event) {
      if (event.key !== "Escape") {
        return;
      }
      if (propagateEscapeKeyDown === false) {
        event.stopPropagation();
      }
      event.currentTarget.blur();
    }, [propagateEscapeKeyDown]);
    return h("div", { class: createClassName([
      button_default.button,
      secondary === true ? button_default.secondary : button_default.default,
      danger === true ? button_default.danger : null,
      fullWidth === true ? button_default.fullWidth : null,
      disabled === true ? button_default.disabled : null,
      loading === true ? button_default.loading : null
    ]) }, loading === true ? h("div", { class: button_default.loadingIndicator }, h(LoadingIndicator, null)) : null, h("button", __spreadProps(__spreadValues({}, rest), { disabled: disabled === true, onClick: disabled === true || loading === true ? void 0 : onClick, onKeyDown: disabled === true || loading === true ? void 0 : handleKeyDown, tabIndex: disabled === true ? -1 : 0 }), h("div", { class: button_default.children }, children)));
  }
  var init_button2 = __esm({
    "node_modules/@create-figma-plugin/ui/lib/components/button/button.js"() {
      init_preact_module();
      init_hooks_module();
      init_create_class_name();
      init_loading_indicator2();
      init_button();
    }
  });

  // ../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/ceb447fe-be1e-474d-9615-4b3f1e627e77/icon.js
  var icon_default;
  var init_icon = __esm({
    "../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/ceb447fe-be1e-474d-9615-4b3f1e627e77/icon.js"() {
      if (document.getElementById("3b0a4baebe") === null) {
        const element = document.createElement("style");
        element.id = "3b0a4baebe";
        element.textContent = `._icon_13804_1 {
  fill: currentColor;
}

/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9AY3JlYXRlLWZpZ21hLXBsdWdpbi91aS9saWIvaWNvbnMvaWNvbi5jc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFDRSxrQkFBa0I7QUFDcEIiLCJmaWxlIjoibm9kZV9tb2R1bGVzL0BjcmVhdGUtZmlnbWEtcGx1Z2luL3VpL2xpYi9pY29ucy9pY29uLmNzcyIsInNvdXJjZXNDb250ZW50IjpbIi5pY29uIHtcbiAgZmlsbDogY3VycmVudENvbG9yO1xufVxuIl19 */`;
        document.head.append(element);
      }
      icon_default = { "icon": "_icon_13804_1" };
    }
  });

  // node_modules/@create-figma-plugin/ui/lib/icons/create-icon.js
  function createIcon(path, options) {
    const { width, height } = options;
    return function Icon(_a) {
      var _b = _a, { color } = _b, rest = __objRest(_b, ["color"]);
      return h("svg", __spreadProps(__spreadValues({}, rest), { class: icon_default.icon, height, style: typeof color === "undefined" ? void 0 : {
        fill: `var(--figma-color-icon-${color})`
      }, width, xmlns: "http://www.w3.org/2000/svg" }), h("path", { "clip-rule": "evenodd", d: path, "fill-rule": "evenodd" }));
    };
  }
  var init_create_icon = __esm({
    "node_modules/@create-figma-plugin/ui/lib/icons/create-icon.js"() {
      init_preact_module();
      init_icon();
    }
  });

  // ../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/56785a0c-4922-475c-88d8-77d4eb9fb903/divider.js
  var divider_default;
  var init_divider = __esm({
    "../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/56785a0c-4922-475c-88d8-77d4eb9fb903/divider.js"() {
      if (document.getElementById("947a88d8c0") === null) {
        const element = document.createElement("style");
        element.id = "947a88d8c0";
        element.textContent = `._divider_m18ta_1 {
  width: 100%;
  height: 1px;
  background-color: var(--figma-color-border);
}

/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9AY3JlYXRlLWZpZ21hLXBsdWdpbi91aS9saWIvY29tcG9uZW50cy9kaXZpZGVyL2RpdmlkZXIuY3NzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQ0UsV0FBVztFQUNYLFdBQVc7RUFDWCwyQ0FBMkM7QUFDN0MiLCJmaWxlIjoibm9kZV9tb2R1bGVzL0BjcmVhdGUtZmlnbWEtcGx1Z2luL3VpL2xpYi9jb21wb25lbnRzL2RpdmlkZXIvZGl2aWRlci5jc3MiLCJzb3VyY2VzQ29udGVudCI6WyIuZGl2aWRlciB7XG4gIHdpZHRoOiAxMDAlO1xuICBoZWlnaHQ6IDFweDtcbiAgYmFja2dyb3VuZC1jb2xvcjogdmFyKC0tZmlnbWEtY29sb3ItYm9yZGVyKTtcbn1cbiJdfQ== */`;
        document.head.append(element);
      }
      divider_default = { "divider": "_divider_m18ta_1" };
    }
  });

  // node_modules/@create-figma-plugin/ui/lib/components/divider/divider.js
  function Divider(props) {
    return h("hr", __spreadProps(__spreadValues({}, props), { class: divider_default.divider }));
  }
  var init_divider2 = __esm({
    "node_modules/@create-figma-plugin/ui/lib/components/divider/divider.js"() {
      init_preact_module();
      init_divider();
    }
  });

  // node_modules/@create-figma-plugin/ui/lib/utilities/get-current-from-ref.js
  function getCurrentFromRef(ref) {
    if (ref.current === null) {
      throw new Error("`ref.current` is `undefined`");
    }
    return ref.current;
  }
  var init_get_current_from_ref = __esm({
    "node_modules/@create-figma-plugin/ui/lib/utilities/get-current-from-ref.js"() {
    }
  });

  // ../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/94ae915b-27a7-46c9-bfb6-9fa0a3d960d9/text.js
  var text_default;
  var init_text = __esm({
    "../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/94ae915b-27a7-46c9-bfb6-9fa0a3d960d9/text.js"() {
      if (document.getElementById("38f0619aa4") === null) {
        const element = document.createElement("style");
        element.id = "38f0619aa4";
        element.textContent = `._text_mh6mm_1 {
  padding-top: 1px;
  color: var(--figma-color-text);
  pointer-events: none;
  transform: translateY(4px);
}
._text_mh6mm_1:before {
  display: block;
  height: 0;
  margin-top: -9px;
  content: '';
  pointer-events: none;
}

._numeric_mh6mm_15 {
  font-variant-numeric: tabular-nums;
}

._left_mh6mm_19 {
  text-align: left;
}
._center_mh6mm_22 {
  text-align: center;
}
._right_mh6mm_25 {
  text-align: right;
}

/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9AY3JlYXRlLWZpZ21hLXBsdWdpbi91aS9saWIvY29tcG9uZW50cy90ZXh0L3RleHQuY3NzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQ0UsZ0JBQWdCO0VBQ2hCLDhCQUE4QjtFQUM5QixvQkFBb0I7RUFDcEIsMEJBQTBCO0FBQzVCO0FBQ0E7RUFDRSxjQUFjO0VBQ2QsU0FBUztFQUNULGdCQUFnQjtFQUNoQixXQUFXO0VBQ1gsb0JBQW9CO0FBQ3RCOztBQUVBO0VBQ0Usa0NBQWtDO0FBQ3BDOztBQUVBO0VBQ0UsZ0JBQWdCO0FBQ2xCO0FBQ0E7RUFDRSxrQkFBa0I7QUFDcEI7QUFDQTtFQUNFLGlCQUFpQjtBQUNuQiIsImZpbGUiOiJub2RlX21vZHVsZXMvQGNyZWF0ZS1maWdtYS1wbHVnaW4vdWkvbGliL2NvbXBvbmVudHMvdGV4dC90ZXh0LmNzcyIsInNvdXJjZXNDb250ZW50IjpbIi50ZXh0IHtcbiAgcGFkZGluZy10b3A6IDFweDtcbiAgY29sb3I6IHZhcigtLWZpZ21hLWNvbG9yLXRleHQpO1xuICBwb2ludGVyLWV2ZW50czogbm9uZTtcbiAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKDRweCk7XG59XG4udGV4dDpiZWZvcmUge1xuICBkaXNwbGF5OiBibG9jaztcbiAgaGVpZ2h0OiAwO1xuICBtYXJnaW4tdG9wOiAtOXB4O1xuICBjb250ZW50OiAnJztcbiAgcG9pbnRlci1ldmVudHM6IG5vbmU7XG59XG5cbi5udW1lcmljIHtcbiAgZm9udC12YXJpYW50LW51bWVyaWM6IHRhYnVsYXItbnVtcztcbn1cblxuLmxlZnQge1xuICB0ZXh0LWFsaWduOiBsZWZ0O1xufVxuLmNlbnRlciB7XG4gIHRleHQtYWxpZ246IGNlbnRlcjtcbn1cbi5yaWdodCB7XG4gIHRleHQtYWxpZ246IHJpZ2h0O1xufVxuIl19 */`;
        document.head.append(element);
      }
      text_default = { "text": "_text_mh6mm_1", "numeric": "_numeric_mh6mm_15", "left": "_left_mh6mm_19", "center": "_center_mh6mm_22", "right": "_right_mh6mm_25" };
    }
  });

  // node_modules/@create-figma-plugin/ui/lib/components/text/text.js
  function Text(_a) {
    var _b = _a, { align = "left", children, numeric = false } = _b, rest = __objRest(_b, ["align", "children", "numeric"]);
    return h("div", __spreadProps(__spreadValues({}, rest), { class: createClassName([
      text_default.text,
      text_default[align],
      numeric === true ? text_default.numeric : null
    ]) }), children);
  }
  var init_text2 = __esm({
    "node_modules/@create-figma-plugin/ui/lib/components/text/text.js"() {
      init_preact_module();
      init_create_class_name();
      init_text();
    }
  });

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

  // node_modules/@create-figma-plugin/utilities/lib/mixed-values.js
  var MIXED_STRING;
  var init_mixed_values = __esm({
    "node_modules/@create-figma-plugin/utilities/lib/mixed-values.js"() {
      MIXED_STRING = "999999999999999";
    }
  });

  // node_modules/@create-figma-plugin/utilities/lib/index.js
  var init_lib = __esm({
    "node_modules/@create-figma-plugin/utilities/lib/index.js"() {
      init_events();
      init_mixed_values();
    }
  });

  // node_modules/@create-figma-plugin/ui/lib/components/textbox/private/is-keycode-character-generating.js
  function isKeyCodeCharacterGenerating(keyCode) {
    return keyCode === 32 || keyCode >= 48 && keyCode <= 57 || keyCode >= 65 && keyCode <= 90 || keyCode >= 96 && keyCode <= 105 || keyCode >= 186 && keyCode <= 192 || keyCode >= 219 && keyCode <= 222;
  }
  var init_is_keycode_character_generating = __esm({
    "node_modules/@create-figma-plugin/ui/lib/components/textbox/private/is-keycode-character-generating.js"() {
    }
  });

  // node_modules/@create-figma-plugin/ui/lib/components/textbox/textbox/private/raw-textbox.js
  function RawTextbox(_a) {
    var _b = _a, { disabled = false, name, onInput = function() {
    }, onValueInput = function() {
    }, password = false, placeholder, propagateEscapeKeyDown = true, revertOnEscapeKeyDown = false, spellCheck = false, validateOnBlur, value } = _b, rest = __objRest(_b, ["disabled", "name", "onInput", "onValueInput", "password", "placeholder", "propagateEscapeKeyDown", "revertOnEscapeKeyDown", "spellCheck", "validateOnBlur", "value"]);
    const inputElementRef = _2(null);
    const revertOnEscapeKeyDownRef = _2(false);
    const [originalValue, setOriginalValue] = p2(EMPTY_STRING);
    const setInputElementValue = T2(function(value2) {
      const inputElement = getCurrentFromRef(inputElementRef);
      inputElement.value = value2;
      const inputEvent = document.createEvent("Event");
      inputEvent.initEvent("input", true, true);
      inputElement.dispatchEvent(inputEvent);
    }, []);
    const handleBlur = T2(function() {
      if (revertOnEscapeKeyDownRef.current === true) {
        revertOnEscapeKeyDownRef.current = false;
        return;
      }
      if (typeof validateOnBlur !== "undefined") {
        const result = validateOnBlur(value);
        if (typeof result === "string") {
          setInputElementValue(result);
          setOriginalValue(EMPTY_STRING);
          return;
        }
        if (result === false) {
          if (value !== originalValue) {
            setInputElementValue(originalValue);
          }
          setOriginalValue(EMPTY_STRING);
          return;
        }
      }
      setOriginalValue(EMPTY_STRING);
    }, [originalValue, setInputElementValue, validateOnBlur, value]);
    const handleFocus = T2(function(event) {
      setOriginalValue(value);
      event.currentTarget.select();
    }, [value]);
    const handleInput = T2(function(event) {
      onValueInput(event.currentTarget.value, name);
      onInput(event);
    }, [name, onInput, onValueInput]);
    const handleKeyDown = T2(function(event) {
      const key = event.key;
      if (key === "Escape") {
        if (propagateEscapeKeyDown === false) {
          event.stopPropagation();
        }
        if (revertOnEscapeKeyDown === true) {
          revertOnEscapeKeyDownRef.current = true;
          setInputElementValue(originalValue);
          setOriginalValue(EMPTY_STRING);
        }
        event.currentTarget.blur();
        return;
      }
      if (key === "Enter") {
        event.currentTarget.blur();
        return;
      }
      if (value === MIXED_STRING && isKeyCodeCharacterGenerating(event.keyCode) === false) {
        event.preventDefault();
        event.currentTarget.select();
      }
    }, [
      originalValue,
      propagateEscapeKeyDown,
      revertOnEscapeKeyDown,
      setInputElementValue,
      value
    ]);
    const handleMouseUp = T2(function(event) {
      if (value === MIXED_STRING) {
        event.preventDefault();
      }
    }, [value]);
    return h("input", __spreadProps(__spreadValues({}, rest), { ref: inputElementRef, disabled: disabled === true, name, onBlur: handleBlur, onFocus: handleFocus, onInput: handleInput, onKeyDown: handleKeyDown, onMouseUp: handleMouseUp, placeholder, spellcheck: spellCheck, tabIndex: disabled === true ? -1 : 0, type: password === true ? "password" : "text", value: value === MIXED_STRING ? "Mixed" : value }));
  }
  var EMPTY_STRING;
  var init_raw_textbox = __esm({
    "node_modules/@create-figma-plugin/ui/lib/components/textbox/textbox/private/raw-textbox.js"() {
      init_lib();
      init_preact_module();
      init_hooks_module();
      init_get_current_from_ref();
      init_is_keycode_character_generating();
      EMPTY_STRING = "";
    }
  });

  // ../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/602e3269-000f-4e19-8352-d470d125281b/textbox.js
  var textbox_default;
  var init_textbox = __esm({
    "../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/602e3269-000f-4e19-8352-d470d125281b/textbox.js"() {
      if (document.getElementById("119378e3f7") === null) {
        const element = document.createElement("style");
        element.id = "119378e3f7";
        element.textContent = `._textbox_18q9w_1 {
  position: relative;
  z-index: var(--z-index-1);
}
._textbox_18q9w_1:focus-within {
  z-index: var(--z-index-2); /* Stack \`.textbox\` over its sibling elements */
}

._input_18q9w_9 {
  display: block;
  width: 100%;
  height: 28px;
  padding-left: var(--space-extra-small);
  background-color: transparent;
  color: var(--figma-color-text);
}
._disabled_18q9w_17 ._input_18q9w_9 {
  color: var(--figma-color-text-disabled);
  cursor: not-allowed;
}
._hasIcon_18q9w_21 ._input_18q9w_9 {
  padding-left: 32px;
}

._input_18q9w_9::placeholder {
  color: var(--figma-color-text-tertiary);
}

._icon_18q9w_29 {
  position: absolute;
  top: 14px;
  left: 16px;
  color: var(--figma-color-icon-secondary);
  pointer-events: none; /* so that clicking the icon focuses the textbox */
  text-align: center;
  transform: translate(-50%, -50%);
}
._textbox_18q9w_1:not(._disabled_18q9w_17) ._input_18q9w_9:focus ~ ._icon_18q9w_29 {
  color: var(--figma-color-icon-brand);
}
._disabled_18q9w_17 ._icon_18q9w_29 {
  color: var(--figma-color-icon-disabled);
}

._icon_18q9w_29 svg {
  fill: currentColor;
}

._border_18q9w_49 {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  border: 1px solid transparent;
  border-radius: var(--border-radius-2);
  pointer-events: none;
}
._hasBorder_18q9w_59 ._border_18q9w_49,
._textbox_18q9w_1:not(._disabled_18q9w_17):hover ._border_18q9w_49 {
  border-color: var(--figma-color-border);
}
._textbox_18q9w_1:not(._disabled_18q9w_17) ._input_18q9w_9:focus ~ ._border_18q9w_49 {
  top: -1px;
  bottom: -1px;
  border-width: 2px;
  border-color: var(--figma-color-border-brand-strong);
}

._underline_18q9w_70 {
  position: absolute;
  right: var(--space-extra-small);
  bottom: 0;
  left: var(--space-extra-small);
  height: 1px;
  background-color: var(--figma-color-border);
}
._textbox_18q9w_1:not(._disabled_18q9w_17) ._input_18q9w_9:focus ~ ._underline_18q9w_70,
._textbox_18q9w_1:not(._disabled_18q9w_17):hover ._underline_18q9w_70 {
  background-color: transparent;
}

/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9AY3JlYXRlLWZpZ21hLXBsdWdpbi91aS9saWIvY29tcG9uZW50cy90ZXh0Ym94L3RleHRib3gvdGV4dGJveC5jc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFDRSxrQkFBa0I7RUFDbEIseUJBQXlCO0FBQzNCO0FBQ0E7RUFDRSx5QkFBeUIsRUFBRSwrQ0FBK0M7QUFDNUU7O0FBRUE7RUFDRSxjQUFjO0VBQ2QsV0FBVztFQUNYLFlBQVk7RUFDWixzQ0FBc0M7RUFDdEMsNkJBQTZCO0VBQzdCLDhCQUE4QjtBQUNoQztBQUNBO0VBQ0UsdUNBQXVDO0VBQ3ZDLG1CQUFtQjtBQUNyQjtBQUNBO0VBQ0Usa0JBQWtCO0FBQ3BCOztBQUVBO0VBQ0UsdUNBQXVDO0FBQ3pDOztBQUVBO0VBQ0Usa0JBQWtCO0VBQ2xCLFNBQVM7RUFDVCxVQUFVO0VBQ1Ysd0NBQXdDO0VBQ3hDLG9CQUFvQixFQUFFLGtEQUFrRDtFQUN4RSxrQkFBa0I7RUFDbEIsZ0NBQWdDO0FBQ2xDO0FBQ0E7RUFDRSxvQ0FBb0M7QUFDdEM7QUFDQTtFQUNFLHVDQUF1QztBQUN6Qzs7QUFFQTtFQUNFLGtCQUFrQjtBQUNwQjs7QUFFQTtFQUNFLGtCQUFrQjtFQUNsQixNQUFNO0VBQ04sUUFBUTtFQUNSLFNBQVM7RUFDVCxPQUFPO0VBQ1AsNkJBQTZCO0VBQzdCLHFDQUFxQztFQUNyQyxvQkFBb0I7QUFDdEI7QUFDQTs7RUFFRSx1Q0FBdUM7QUFDekM7QUFDQTtFQUNFLFNBQVM7RUFDVCxZQUFZO0VBQ1osaUJBQWlCO0VBQ2pCLG9EQUFvRDtBQUN0RDs7QUFFQTtFQUNFLGtCQUFrQjtFQUNsQiwrQkFBK0I7RUFDL0IsU0FBUztFQUNULDhCQUE4QjtFQUM5QixXQUFXO0VBQ1gsMkNBQTJDO0FBQzdDO0FBQ0E7O0VBRUUsNkJBQTZCO0FBQy9CIiwiZmlsZSI6Im5vZGVfbW9kdWxlcy9AY3JlYXRlLWZpZ21hLXBsdWdpbi91aS9saWIvY29tcG9uZW50cy90ZXh0Ym94L3RleHRib3gvdGV4dGJveC5jc3MiLCJzb3VyY2VzQ29udGVudCI6WyIudGV4dGJveCB7XG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgei1pbmRleDogdmFyKC0tei1pbmRleC0xKTtcbn1cbi50ZXh0Ym94OmZvY3VzLXdpdGhpbiB7XG4gIHotaW5kZXg6IHZhcigtLXotaW5kZXgtMik7IC8qIFN0YWNrIGAudGV4dGJveGAgb3ZlciBpdHMgc2libGluZyBlbGVtZW50cyAqL1xufVxuXG4uaW5wdXQge1xuICBkaXNwbGF5OiBibG9jaztcbiAgd2lkdGg6IDEwMCU7XG4gIGhlaWdodDogMjhweDtcbiAgcGFkZGluZy1sZWZ0OiB2YXIoLS1zcGFjZS1leHRyYS1zbWFsbCk7XG4gIGJhY2tncm91bmQtY29sb3I6IHRyYW5zcGFyZW50O1xuICBjb2xvcjogdmFyKC0tZmlnbWEtY29sb3ItdGV4dCk7XG59XG4uZGlzYWJsZWQgLmlucHV0IHtcbiAgY29sb3I6IHZhcigtLWZpZ21hLWNvbG9yLXRleHQtZGlzYWJsZWQpO1xuICBjdXJzb3I6IG5vdC1hbGxvd2VkO1xufVxuLmhhc0ljb24gLmlucHV0IHtcbiAgcGFkZGluZy1sZWZ0OiAzMnB4O1xufVxuXG4uaW5wdXQ6OnBsYWNlaG9sZGVyIHtcbiAgY29sb3I6IHZhcigtLWZpZ21hLWNvbG9yLXRleHQtdGVydGlhcnkpO1xufVxuXG4uaWNvbiB7XG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgdG9wOiAxNHB4O1xuICBsZWZ0OiAxNnB4O1xuICBjb2xvcjogdmFyKC0tZmlnbWEtY29sb3ItaWNvbi1zZWNvbmRhcnkpO1xuICBwb2ludGVyLWV2ZW50czogbm9uZTsgLyogc28gdGhhdCBjbGlja2luZyB0aGUgaWNvbiBmb2N1c2VzIHRoZSB0ZXh0Ym94ICovXG4gIHRleHQtYWxpZ246IGNlbnRlcjtcbiAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoLTUwJSwgLTUwJSk7XG59XG4udGV4dGJveDpub3QoLmRpc2FibGVkKSAuaW5wdXQ6Zm9jdXMgfiAuaWNvbiB7XG4gIGNvbG9yOiB2YXIoLS1maWdtYS1jb2xvci1pY29uLWJyYW5kKTtcbn1cbi5kaXNhYmxlZCAuaWNvbiB7XG4gIGNvbG9yOiB2YXIoLS1maWdtYS1jb2xvci1pY29uLWRpc2FibGVkKTtcbn1cblxuLmljb24gc3ZnIHtcbiAgZmlsbDogY3VycmVudENvbG9yO1xufVxuXG4uYm9yZGVyIHtcbiAgcG9zaXRpb246IGFic29sdXRlO1xuICB0b3A6IDA7XG4gIHJpZ2h0OiAwO1xuICBib3R0b206IDA7XG4gIGxlZnQ6IDA7XG4gIGJvcmRlcjogMXB4IHNvbGlkIHRyYW5zcGFyZW50O1xuICBib3JkZXItcmFkaXVzOiB2YXIoLS1ib3JkZXItcmFkaXVzLTIpO1xuICBwb2ludGVyLWV2ZW50czogbm9uZTtcbn1cbi5oYXNCb3JkZXIgLmJvcmRlcixcbi50ZXh0Ym94Om5vdCguZGlzYWJsZWQpOmhvdmVyIC5ib3JkZXIge1xuICBib3JkZXItY29sb3I6IHZhcigtLWZpZ21hLWNvbG9yLWJvcmRlcik7XG59XG4udGV4dGJveDpub3QoLmRpc2FibGVkKSAuaW5wdXQ6Zm9jdXMgfiAuYm9yZGVyIHtcbiAgdG9wOiAtMXB4O1xuICBib3R0b206IC0xcHg7XG4gIGJvcmRlci13aWR0aDogMnB4O1xuICBib3JkZXItY29sb3I6IHZhcigtLWZpZ21hLWNvbG9yLWJvcmRlci1icmFuZC1zdHJvbmcpO1xufVxuXG4udW5kZXJsaW5lIHtcbiAgcG9zaXRpb246IGFic29sdXRlO1xuICByaWdodDogdmFyKC0tc3BhY2UtZXh0cmEtc21hbGwpO1xuICBib3R0b206IDA7XG4gIGxlZnQ6IHZhcigtLXNwYWNlLWV4dHJhLXNtYWxsKTtcbiAgaGVpZ2h0OiAxcHg7XG4gIGJhY2tncm91bmQtY29sb3I6IHZhcigtLWZpZ21hLWNvbG9yLWJvcmRlcik7XG59XG4udGV4dGJveDpub3QoLmRpc2FibGVkKSAuaW5wdXQ6Zm9jdXMgfiAudW5kZXJsaW5lLFxuLnRleHRib3g6bm90KC5kaXNhYmxlZCk6aG92ZXIgLnVuZGVybGluZSB7XG4gIGJhY2tncm91bmQtY29sb3I6IHRyYW5zcGFyZW50O1xufVxuIl19 */`;
        document.head.append(element);
      }
      textbox_default = { "textbox": "_textbox_18q9w_1", "input": "_input_18q9w_9", "disabled": "_disabled_18q9w_17", "hasIcon": "_hasIcon_18q9w_21", "icon": "_icon_18q9w_29", "border": "_border_18q9w_49", "hasBorder": "_hasBorder_18q9w_59", "underline": "_underline_18q9w_70" };
    }
  });

  // node_modules/@create-figma-plugin/ui/lib/components/textbox/textbox/textbox.js
  function Textbox(_a) {
    var _b = _a, { icon, variant } = _b, rest = __objRest(_b, ["icon", "variant"]);
    if (typeof icon === "string" && icon.length !== 1) {
      throw new Error(`String \`icon\` must be a single character: ${icon}`);
    }
    return h("div", { class: createClassName([
      textbox_default.textbox,
      typeof variant === "undefined" ? null : variant === "border" ? textbox_default.hasBorder : null,
      typeof icon === "undefined" ? null : textbox_default.hasIcon,
      rest.disabled === true ? textbox_default.disabled : null
    ]) }, h(RawTextbox, __spreadProps(__spreadValues({}, rest), { class: textbox_default.input })), typeof icon === "undefined" ? null : h("div", { class: textbox_default.icon }, icon), h("div", { class: textbox_default.border }), variant === "underline" ? h("div", { class: textbox_default.underline }) : null);
  }
  var init_textbox2 = __esm({
    "node_modules/@create-figma-plugin/ui/lib/components/textbox/textbox/textbox.js"() {
      init_preact_module();
      init_create_class_name();
      init_raw_textbox();
      init_textbox();
    }
  });

  // node_modules/@create-figma-plugin/ui/lib/icons/icon-32/icon-chevron-left-32.js
  var IconChevronLeft32;
  var init_icon_chevron_left_32 = __esm({
    "node_modules/@create-figma-plugin/ui/lib/icons/icon-32/icon-chevron-left-32.js"() {
      init_create_icon();
      IconChevronLeft32 = createIcon("M18.914 11.708 18.206 11 13 15.999l5.206 4.9996.708-.708-4.5-4.2916 4.5-4.291Z", { height: 32, width: 32 });
    }
  });

  // node_modules/@create-figma-plugin/ui/lib/icons/icon-32/icon-warning-32.js
  var IconWarning32;
  var init_icon_warning_32 = __esm({
    "node_modules/@create-figma-plugin/ui/lib/icons/icon-32/icon-warning-32.js"() {
      init_create_icon();
      IconWarning32 = createIcon("M23.2901 22 16 9.03973 8.70983 22H23.2901ZM16.8716 8.54947c-.3823-.67965-1.3609-.67965-1.7432 0L7.83825 21.5097C7.46329 22.1763 7.945 23 8.70983 23H23.2901c.7649 0 1.2466-.8237.8716-1.4903L16.8716 8.54947Zm-.8717 4.42383c.4142 0 .75.3358.75.75v2.5294c0 .4142-.3358.75-.75.75s-.75-.3358-.75-.75v-2.5294c0-.4142.3358-.75.75-.75Zm1 6.5269c0-.5523-.4477-1-1-1s-1 .4477-1 1v.0685c0 .5523.4477 1 1 1s1-.4477 1-1v-.0685Z", { height: 32, width: 32 });
    }
  });

  // ../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/06a61dd0-327c-4c1c-8fe1-f02afb0c32ca/muted.js
  var muted_default;
  var init_muted = __esm({
    "../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/06a61dd0-327c-4c1c-8fe1-f02afb0c32ca/muted.js"() {
      if (document.getElementById("7456fb9670") === null) {
        const element = document.createElement("style");
        element.id = "7456fb9670";
        element.textContent = `._muted_139yx_1 {
  color: var(--figma-color-text-secondary);
}

/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9AY3JlYXRlLWZpZ21hLXBsdWdpbi91aS9saWIvaW5saW5lLXRleHQvbXV0ZWQvbXV0ZWQuY3NzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQ0Usd0NBQXdDO0FBQzFDIiwiZmlsZSI6Im5vZGVfbW9kdWxlcy9AY3JlYXRlLWZpZ21hLXBsdWdpbi91aS9saWIvaW5saW5lLXRleHQvbXV0ZWQvbXV0ZWQuY3NzIiwic291cmNlc0NvbnRlbnQiOlsiLm11dGVkIHtcbiAgY29sb3I6IHZhcigtLWZpZ21hLWNvbG9yLXRleHQtc2Vjb25kYXJ5KTtcbn1cbiJdfQ== */`;
        document.head.append(element);
      }
      muted_default = { "muted": "_muted_139yx_1" };
    }
  });

  // node_modules/@create-figma-plugin/ui/lib/inline-text/muted/muted.js
  function Muted(_a) {
    var _b = _a, { children } = _b, rest = __objRest(_b, ["children"]);
    return h("span", __spreadProps(__spreadValues({}, rest), { class: muted_default.muted }), children);
  }
  var init_muted2 = __esm({
    "node_modules/@create-figma-plugin/ui/lib/inline-text/muted/muted.js"() {
      init_preact_module();
      init_muted();
    }
  });

  // ../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/680d82d2-ac62-43cf-a33e-1c8ebefdaf54/container.js
  var container_default;
  var init_container = __esm({
    "../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/680d82d2-ac62-43cf-a33e-1c8ebefdaf54/container.js"() {
      if (document.getElementById("66b2a54611") === null) {
        const element = document.createElement("style");
        element.id = "66b2a54611";
        element.textContent = `._extraSmall_1oe77_1 {
  padding: 0 var(--space-extra-small);
}
._small_1oe77_4 {
  padding: 0 var(--space-small);
}
._medium_1oe77_7 {
  padding: 0 var(--space-medium);
}
._large_1oe77_10 {
  padding: 0 var(--space-large);
}
._extraLarge_1oe77_13 {
  padding: 0 var(--space-extra-large);
}

/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9AY3JlYXRlLWZpZ21hLXBsdWdpbi91aS9saWIvbGF5b3V0L2NvbnRhaW5lci9jb250YWluZXIuY3NzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQ0UsbUNBQW1DO0FBQ3JDO0FBQ0E7RUFDRSw2QkFBNkI7QUFDL0I7QUFDQTtFQUNFLDhCQUE4QjtBQUNoQztBQUNBO0VBQ0UsNkJBQTZCO0FBQy9CO0FBQ0E7RUFDRSxtQ0FBbUM7QUFDckMiLCJmaWxlIjoibm9kZV9tb2R1bGVzL0BjcmVhdGUtZmlnbWEtcGx1Z2luL3VpL2xpYi9sYXlvdXQvY29udGFpbmVyL2NvbnRhaW5lci5jc3MiLCJzb3VyY2VzQ29udGVudCI6WyIuZXh0cmFTbWFsbCB7XG4gIHBhZGRpbmc6IDAgdmFyKC0tc3BhY2UtZXh0cmEtc21hbGwpO1xufVxuLnNtYWxsIHtcbiAgcGFkZGluZzogMCB2YXIoLS1zcGFjZS1zbWFsbCk7XG59XG4ubWVkaXVtIHtcbiAgcGFkZGluZzogMCB2YXIoLS1zcGFjZS1tZWRpdW0pO1xufVxuLmxhcmdlIHtcbiAgcGFkZGluZzogMCB2YXIoLS1zcGFjZS1sYXJnZSk7XG59XG4uZXh0cmFMYXJnZSB7XG4gIHBhZGRpbmc6IDAgdmFyKC0tc3BhY2UtZXh0cmEtbGFyZ2UpO1xufVxuIl19 */`;
        document.head.append(element);
      }
      container_default = { "extraSmall": "_extraSmall_1oe77_1", "small": "_small_1oe77_4", "medium": "_medium_1oe77_7", "large": "_large_1oe77_10", "extraLarge": "_extraLarge_1oe77_13" };
    }
  });

  // node_modules/@create-figma-plugin/ui/lib/layout/container/container.js
  function Container(_a) {
    var _b = _a, { space } = _b, rest = __objRest(_b, ["space"]);
    return h("div", __spreadProps(__spreadValues({}, rest), { class: container_default[space] }));
  }
  var init_container2 = __esm({
    "node_modules/@create-figma-plugin/ui/lib/layout/container/container.js"() {
      init_preact_module();
      init_container();
    }
  });

  // ../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/e2b29abe-6024-4a9d-bee0-7eb58ca7af00/vertical-space.js
  var vertical_space_default;
  var init_vertical_space = __esm({
    "../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/e2b29abe-6024-4a9d-bee0-7eb58ca7af00/vertical-space.js"() {
      if (document.getElementById("8d65b44de9") === null) {
        const element = document.createElement("style");
        element.id = "8d65b44de9";
        element.textContent = `._extraSmall_zc4n0_1 {
  height: var(--space-extra-small);
}
._small_zc4n0_4 {
  height: var(--space-small);
}
._medium_zc4n0_7 {
  height: var(--space-medium);
}
._large_zc4n0_10 {
  height: var(--space-large);
}
._extraLarge_zc4n0_13 {
  height: var(--space-extra-large);
}

/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9AY3JlYXRlLWZpZ21hLXBsdWdpbi91aS9saWIvbGF5b3V0L3ZlcnRpY2FsLXNwYWNlL3ZlcnRpY2FsLXNwYWNlLmNzcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUNFLGdDQUFnQztBQUNsQztBQUNBO0VBQ0UsMEJBQTBCO0FBQzVCO0FBQ0E7RUFDRSwyQkFBMkI7QUFDN0I7QUFDQTtFQUNFLDBCQUEwQjtBQUM1QjtBQUNBO0VBQ0UsZ0NBQWdDO0FBQ2xDIiwiZmlsZSI6Im5vZGVfbW9kdWxlcy9AY3JlYXRlLWZpZ21hLXBsdWdpbi91aS9saWIvbGF5b3V0L3ZlcnRpY2FsLXNwYWNlL3ZlcnRpY2FsLXNwYWNlLmNzcyIsInNvdXJjZXNDb250ZW50IjpbIi5leHRyYVNtYWxsIHtcbiAgaGVpZ2h0OiB2YXIoLS1zcGFjZS1leHRyYS1zbWFsbCk7XG59XG4uc21hbGwge1xuICBoZWlnaHQ6IHZhcigtLXNwYWNlLXNtYWxsKTtcbn1cbi5tZWRpdW0ge1xuICBoZWlnaHQ6IHZhcigtLXNwYWNlLW1lZGl1bSk7XG59XG4ubGFyZ2Uge1xuICBoZWlnaHQ6IHZhcigtLXNwYWNlLWxhcmdlKTtcbn1cbi5leHRyYUxhcmdlIHtcbiAgaGVpZ2h0OiB2YXIoLS1zcGFjZS1leHRyYS1sYXJnZSk7XG59XG4iXX0= */`;
        document.head.append(element);
      }
      vertical_space_default = { "extraSmall": "_extraSmall_zc4n0_1", "small": "_small_zc4n0_4", "medium": "_medium_zc4n0_7", "large": "_large_zc4n0_10", "extraLarge": "_extraLarge_zc4n0_13" };
    }
  });

  // node_modules/@create-figma-plugin/ui/lib/layout/vertical-space/vertical-space.js
  function VerticalSpace(_a) {
    var _b = _a, { space } = _b, rest = __objRest(_b, ["space"]);
    return h("div", __spreadProps(__spreadValues({}, rest), { class: vertical_space_default[space] }));
  }
  var init_vertical_space2 = __esm({
    "node_modules/@create-figma-plugin/ui/lib/layout/vertical-space/vertical-space.js"() {
      init_preact_module();
      init_vertical_space();
    }
  });

  // ../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/5e63b64f-5882-4350-b108-de684bb5fa4e/base.js
  var init_base = __esm({
    "../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/5e63b64f-5882-4350-b108-de684bb5fa4e/base.js"() {
      if (document.getElementById("46215c86c3") === null) {
        const element = document.createElement("style");
        element.id = "46215c86c3";
        element.textContent = `@import url('https://fonts.googleapis.com/css?family=Inter:400,600&display=swap');

:root {
  /* border-radius */
  --border-radius-2: 2px;
  --border-radius-6: 6px;
  /* box-shadow */
  --box-shadow: var(--box-shadow-menu);
  --box-shadow-menu: 0 5px 17px rgba(0, 0, 0, 0.2),
    0 2px 7px rgba(0, 0, 0, 0.15), inset 0 0 0 0.5px #000000,
    0 0 0 0.5px rgba(0, 0, 0, 0.1);
  --box-shadow-modal: 0 2px 14px rgba(0, 0, 0, 0.15),
    0 0 0 0.5px rgba(0, 0, 0, 0.2);
  /* font */
  --font-family: 'Inter', 'Helvetica', sans-serif;
  --font-family-code: SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono',
    'Courier New', monospace;
  --font-size-11: 11px;
  --font-size-12: 12px;
  --font-weight-regular: 400;
  --font-weight-bold: 600;
  --line-height-16: 16px;
  /* opacity */
  --opacity-30: 0.3;
  /* space */
  --space-extra-small: 8px;
  --space-small: 12px;
  --space-medium: 16px;
  --space-large: 20px;
  --space-extra-large: 24px;
  /* z-index */
  --z-index-1: 1;
  --z-index-2: 2;
}

.figma-dark {
  color-scheme: dark;
}

* {
  box-sizing: border-box;
  border-width: 0;
  border-style: solid;
  border-color: currentColor;
}

body {
  margin: 0;
  background-color: var(--figma-color-bg);
  color: var(--figma-color-text);
  font-family: var(--font-family);
  font-size: var(--font-size-11);
  font-weight: var(--font-weight-regular);
  line-height: var(--line-height-16);
}

div,
span {
  cursor: default;
  user-select: none;
}

h1,
h2,
h3 {
  margin: 0;
  font-weight: inherit;
}

button {
  padding: 0;
  border: 0;
  -webkit-appearance: none;
  background-color: transparent;
  font: inherit;
  outline: 0;
}

hr {
  border: 0;
  margin: 0;
}

label {
  display: block;
}

input,
textarea {
  padding: 0;
  border: 0;
  margin: 0;
  -webkit-appearance: none;
  cursor: default;
  font: inherit;
  outline: 0;
}

svg {
  display: block;
}

::selection {
  background-color: var(--figma-color-bg-onselected);
}
`;
        document.head.prepend(element);
      }
    }
  });

  // node_modules/@create-figma-plugin/ui/lib/utilities/render.js
  function render(Plugin2) {
    return function(rootNode2, props) {
      P(h(Plugin2, __spreadValues({}, props)), rootNode2);
    };
  }
  var init_render = __esm({
    "node_modules/@create-figma-plugin/ui/lib/utilities/render.js"() {
      init_base();
      init_preact_module();
    }
  });

  // node_modules/@create-figma-plugin/ui/lib/index.js
  var init_lib2 = __esm({
    "node_modules/@create-figma-plugin/ui/lib/index.js"() {
      init_banner2();
      init_button2();
      init_divider2();
      init_loading_indicator2();
      init_text2();
      init_textbox2();
      init_icon_chevron_left_32();
      init_icon_warning_32();
      init_muted2();
      init_container2();
      init_vertical_space2();
      init_render();
    }
  });

  // ../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/0d018ecc-53fb-4720-94bf-2a824420a26e/styles.js
  var init_styles = __esm({
    "../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/0d018ecc-53fb-4720-94bf-2a824420a26e/styles.js"() {
      if (document.getElementById("5260158beb") === null) {
        const element = document.createElement("style");
        element.id = "5260158beb";
        element.textContent = `[class^="_selectableItem_"] {
  height: auto;
  padding: var(--space-medium) var(--space-small) var(--space-medium)
    var(--space-medium);
  margin-bottom: var(--space-small);
}

[class^="_selectableItem_"]:not([class^="_disabled_"])
  [class^="_input_"]:checked
  ~ [class^="_children_"] {
  color: var(--figma-color-text-onbrand);
}
[class^="_selectableItem_"]:not([class^="_disabled_"])
  [class^="_input_"]:checked
  ~ [class^="_box_"] {
  background-color: rgb(130, 43, 85);
}
:root {
  --figma-color-bg-brand: rgb(130, 43, 85);
  --figma-color-bg-selected: rgb(130, 43, 85);
  --figma-color-icon-brand: white;
}
`;
        document.head.append(element);
      }
    }
  });

  // node_modules/@babel/runtime/helpers/esm/setPrototypeOf.js
  function _setPrototypeOf(o3, p4) {
    _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf2(o4, p5) {
      o4.__proto__ = p5;
      return o4;
    };
    return _setPrototypeOf(o3, p4);
  }
  var init_setPrototypeOf = __esm({
    "node_modules/@babel/runtime/helpers/esm/setPrototypeOf.js"() {
    }
  });

  // node_modules/@babel/runtime/helpers/esm/inheritsLoose.js
  function _inheritsLoose(subClass, superClass) {
    subClass.prototype = Object.create(superClass.prototype);
    subClass.prototype.constructor = subClass;
    _setPrototypeOf(subClass, superClass);
  }
  var init_inheritsLoose = __esm({
    "node_modules/@babel/runtime/helpers/esm/inheritsLoose.js"() {
      init_setPrototypeOf();
    }
  });

  // node_modules/react-query/es/core/subscribable.js
  var Subscribable;
  var init_subscribable = __esm({
    "node_modules/react-query/es/core/subscribable.js"() {
      Subscribable = /* @__PURE__ */ function() {
        function Subscribable2() {
          this.listeners = [];
        }
        var _proto = Subscribable2.prototype;
        _proto.subscribe = function subscribe(listener) {
          var _this = this;
          var callback = listener || function() {
            return void 0;
          };
          this.listeners.push(callback);
          this.onSubscribe();
          return function() {
            _this.listeners = _this.listeners.filter(function(x4) {
              return x4 !== callback;
            });
            _this.onUnsubscribe();
          };
        };
        _proto.hasListeners = function hasListeners() {
          return this.listeners.length > 0;
        };
        _proto.onSubscribe = function onSubscribe() {
        };
        _proto.onUnsubscribe = function onUnsubscribe() {
        };
        return Subscribable2;
      }();
    }
  });

  // node_modules/@babel/runtime/helpers/esm/extends.js
  function _extends() {
    _extends = Object.assign ? Object.assign.bind() : function(target) {
      for (var i4 = 1; i4 < arguments.length; i4++) {
        var source = arguments[i4];
        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
      return target;
    };
    return _extends.apply(this, arguments);
  }
  var init_extends = __esm({
    "node_modules/@babel/runtime/helpers/esm/extends.js"() {
    }
  });

  // node_modules/react-query/es/core/utils.js
  function noop() {
    return void 0;
  }
  function functionalUpdate(updater, input) {
    return typeof updater === "function" ? updater(input) : updater;
  }
  function isValidTimeout(value) {
    return typeof value === "number" && value >= 0 && value !== Infinity;
  }
  function ensureQueryKeyArray(value) {
    return Array.isArray(value) ? value : [value];
  }
  function timeUntilStale(updatedAt, staleTime) {
    return Math.max(updatedAt + (staleTime || 0) - Date.now(), 0);
  }
  function parseQueryArgs(arg1, arg2, arg3) {
    if (!isQueryKey(arg1)) {
      return arg1;
    }
    if (typeof arg2 === "function") {
      return _extends({}, arg3, {
        queryKey: arg1,
        queryFn: arg2
      });
    }
    return _extends({}, arg2, {
      queryKey: arg1
    });
  }
  function parseMutationArgs(arg1, arg2, arg3) {
    if (isQueryKey(arg1)) {
      if (typeof arg2 === "function") {
        return _extends({}, arg3, {
          mutationKey: arg1,
          mutationFn: arg2
        });
      }
      return _extends({}, arg2, {
        mutationKey: arg1
      });
    }
    if (typeof arg1 === "function") {
      return _extends({}, arg2, {
        mutationFn: arg1
      });
    }
    return _extends({}, arg1);
  }
  function parseFilterArgs(arg1, arg2, arg3) {
    return isQueryKey(arg1) ? [_extends({}, arg2, {
      queryKey: arg1
    }), arg3] : [arg1 || {}, arg2];
  }
  function mapQueryStatusFilter(active, inactive) {
    if (active === true && inactive === true || active == null && inactive == null) {
      return "all";
    } else if (active === false && inactive === false) {
      return "none";
    } else {
      var isActive = active != null ? active : !inactive;
      return isActive ? "active" : "inactive";
    }
  }
  function matchQuery(filters, query) {
    var active = filters.active, exact = filters.exact, fetching = filters.fetching, inactive = filters.inactive, predicate = filters.predicate, queryKey = filters.queryKey, stale = filters.stale;
    if (isQueryKey(queryKey)) {
      if (exact) {
        if (query.queryHash !== hashQueryKeyByOptions(queryKey, query.options)) {
          return false;
        }
      } else if (!partialMatchKey(query.queryKey, queryKey)) {
        return false;
      }
    }
    var queryStatusFilter = mapQueryStatusFilter(active, inactive);
    if (queryStatusFilter === "none") {
      return false;
    } else if (queryStatusFilter !== "all") {
      var isActive = query.isActive();
      if (queryStatusFilter === "active" && !isActive) {
        return false;
      }
      if (queryStatusFilter === "inactive" && isActive) {
        return false;
      }
    }
    if (typeof stale === "boolean" && query.isStale() !== stale) {
      return false;
    }
    if (typeof fetching === "boolean" && query.isFetching() !== fetching) {
      return false;
    }
    if (predicate && !predicate(query)) {
      return false;
    }
    return true;
  }
  function matchMutation(filters, mutation) {
    var exact = filters.exact, fetching = filters.fetching, predicate = filters.predicate, mutationKey = filters.mutationKey;
    if (isQueryKey(mutationKey)) {
      if (!mutation.options.mutationKey) {
        return false;
      }
      if (exact) {
        if (hashQueryKey(mutation.options.mutationKey) !== hashQueryKey(mutationKey)) {
          return false;
        }
      } else if (!partialMatchKey(mutation.options.mutationKey, mutationKey)) {
        return false;
      }
    }
    if (typeof fetching === "boolean" && mutation.state.status === "loading" !== fetching) {
      return false;
    }
    if (predicate && !predicate(mutation)) {
      return false;
    }
    return true;
  }
  function hashQueryKeyByOptions(queryKey, options) {
    var hashFn = (options == null ? void 0 : options.queryKeyHashFn) || hashQueryKey;
    return hashFn(queryKey);
  }
  function hashQueryKey(queryKey) {
    var asArray = ensureQueryKeyArray(queryKey);
    return stableValueHash(asArray);
  }
  function stableValueHash(value) {
    return JSON.stringify(value, function(_3, val) {
      return isPlainObject(val) ? Object.keys(val).sort().reduce(function(result, key) {
        result[key] = val[key];
        return result;
      }, {}) : val;
    });
  }
  function partialMatchKey(a4, b3) {
    return partialDeepEqual(ensureQueryKeyArray(a4), ensureQueryKeyArray(b3));
  }
  function partialDeepEqual(a4, b3) {
    if (a4 === b3) {
      return true;
    }
    if (typeof a4 !== typeof b3) {
      return false;
    }
    if (a4 && b3 && typeof a4 === "object" && typeof b3 === "object") {
      return !Object.keys(b3).some(function(key) {
        return !partialDeepEqual(a4[key], b3[key]);
      });
    }
    return false;
  }
  function replaceEqualDeep(a4, b3) {
    if (a4 === b3) {
      return a4;
    }
    var array = Array.isArray(a4) && Array.isArray(b3);
    if (array || isPlainObject(a4) && isPlainObject(b3)) {
      var aSize = array ? a4.length : Object.keys(a4).length;
      var bItems = array ? b3 : Object.keys(b3);
      var bSize = bItems.length;
      var copy = array ? [] : {};
      var equalItems = 0;
      for (var i4 = 0; i4 < bSize; i4++) {
        var key = array ? i4 : bItems[i4];
        copy[key] = replaceEqualDeep(a4[key], b3[key]);
        if (copy[key] === a4[key]) {
          equalItems++;
        }
      }
      return aSize === bSize && equalItems === aSize ? a4 : copy;
    }
    return b3;
  }
  function shallowEqualObjects(a4, b3) {
    if (a4 && !b3 || b3 && !a4) {
      return false;
    }
    for (var key in a4) {
      if (a4[key] !== b3[key]) {
        return false;
      }
    }
    return true;
  }
  function isPlainObject(o3) {
    if (!hasObjectPrototype(o3)) {
      return false;
    }
    var ctor = o3.constructor;
    if (typeof ctor === "undefined") {
      return true;
    }
    var prot = ctor.prototype;
    if (!hasObjectPrototype(prot)) {
      return false;
    }
    if (!prot.hasOwnProperty("isPrototypeOf")) {
      return false;
    }
    return true;
  }
  function hasObjectPrototype(o3) {
    return Object.prototype.toString.call(o3) === "[object Object]";
  }
  function isQueryKey(value) {
    return typeof value === "string" || Array.isArray(value);
  }
  function sleep(timeout) {
    return new Promise(function(resolve) {
      setTimeout(resolve, timeout);
    });
  }
  function scheduleMicrotask(callback) {
    Promise.resolve().then(callback).catch(function(error) {
      return setTimeout(function() {
        throw error;
      });
    });
  }
  function getAbortController() {
    if (typeof AbortController === "function") {
      return new AbortController();
    }
  }
  var isServer;
  var init_utils = __esm({
    "node_modules/react-query/es/core/utils.js"() {
      init_extends();
      isServer = typeof window === "undefined";
    }
  });

  // node_modules/react-query/es/core/focusManager.js
  var FocusManager, focusManager;
  var init_focusManager = __esm({
    "node_modules/react-query/es/core/focusManager.js"() {
      init_inheritsLoose();
      init_subscribable();
      init_utils();
      FocusManager = /* @__PURE__ */ function(_Subscribable) {
        _inheritsLoose(FocusManager2, _Subscribable);
        function FocusManager2() {
          var _this;
          _this = _Subscribable.call(this) || this;
          _this.setup = function(onFocus) {
            var _window;
            if (!isServer && ((_window = window) == null ? void 0 : _window.addEventListener)) {
              var listener = function listener2() {
                return onFocus();
              };
              window.addEventListener("visibilitychange", listener, false);
              window.addEventListener("focus", listener, false);
              return function() {
                window.removeEventListener("visibilitychange", listener);
                window.removeEventListener("focus", listener);
              };
            }
          };
          return _this;
        }
        var _proto = FocusManager2.prototype;
        _proto.onSubscribe = function onSubscribe() {
          if (!this.cleanup) {
            this.setEventListener(this.setup);
          }
        };
        _proto.onUnsubscribe = function onUnsubscribe() {
          if (!this.hasListeners()) {
            var _this$cleanup;
            (_this$cleanup = this.cleanup) == null ? void 0 : _this$cleanup.call(this);
            this.cleanup = void 0;
          }
        };
        _proto.setEventListener = function setEventListener(setup) {
          var _this$cleanup2, _this2 = this;
          this.setup = setup;
          (_this$cleanup2 = this.cleanup) == null ? void 0 : _this$cleanup2.call(this);
          this.cleanup = setup(function(focused) {
            if (typeof focused === "boolean") {
              _this2.setFocused(focused);
            } else {
              _this2.onFocus();
            }
          });
        };
        _proto.setFocused = function setFocused(focused) {
          this.focused = focused;
          if (focused) {
            this.onFocus();
          }
        };
        _proto.onFocus = function onFocus() {
          this.listeners.forEach(function(listener) {
            listener();
          });
        };
        _proto.isFocused = function isFocused() {
          if (typeof this.focused === "boolean") {
            return this.focused;
          }
          if (typeof document === "undefined") {
            return true;
          }
          return [void 0, "visible", "prerender"].includes(document.visibilityState);
        };
        return FocusManager2;
      }(Subscribable);
      focusManager = new FocusManager();
    }
  });

  // node_modules/react-query/es/core/onlineManager.js
  var OnlineManager, onlineManager;
  var init_onlineManager = __esm({
    "node_modules/react-query/es/core/onlineManager.js"() {
      init_inheritsLoose();
      init_subscribable();
      init_utils();
      OnlineManager = /* @__PURE__ */ function(_Subscribable) {
        _inheritsLoose(OnlineManager2, _Subscribable);
        function OnlineManager2() {
          var _this;
          _this = _Subscribable.call(this) || this;
          _this.setup = function(onOnline) {
            var _window;
            if (!isServer && ((_window = window) == null ? void 0 : _window.addEventListener)) {
              var listener = function listener2() {
                return onOnline();
              };
              window.addEventListener("online", listener, false);
              window.addEventListener("offline", listener, false);
              return function() {
                window.removeEventListener("online", listener);
                window.removeEventListener("offline", listener);
              };
            }
          };
          return _this;
        }
        var _proto = OnlineManager2.prototype;
        _proto.onSubscribe = function onSubscribe() {
          if (!this.cleanup) {
            this.setEventListener(this.setup);
          }
        };
        _proto.onUnsubscribe = function onUnsubscribe() {
          if (!this.hasListeners()) {
            var _this$cleanup;
            (_this$cleanup = this.cleanup) == null ? void 0 : _this$cleanup.call(this);
            this.cleanup = void 0;
          }
        };
        _proto.setEventListener = function setEventListener(setup) {
          var _this$cleanup2, _this2 = this;
          this.setup = setup;
          (_this$cleanup2 = this.cleanup) == null ? void 0 : _this$cleanup2.call(this);
          this.cleanup = setup(function(online) {
            if (typeof online === "boolean") {
              _this2.setOnline(online);
            } else {
              _this2.onOnline();
            }
          });
        };
        _proto.setOnline = function setOnline(online) {
          this.online = online;
          if (online) {
            this.onOnline();
          }
        };
        _proto.onOnline = function onOnline() {
          this.listeners.forEach(function(listener) {
            listener();
          });
        };
        _proto.isOnline = function isOnline() {
          if (typeof this.online === "boolean") {
            return this.online;
          }
          if (typeof navigator === "undefined" || typeof navigator.onLine === "undefined") {
            return true;
          }
          return navigator.onLine;
        };
        return OnlineManager2;
      }(Subscribable);
      onlineManager = new OnlineManager();
    }
  });

  // node_modules/react-query/es/core/retryer.js
  function defaultRetryDelay(failureCount) {
    return Math.min(1e3 * Math.pow(2, failureCount), 3e4);
  }
  function isCancelable(value) {
    return typeof (value == null ? void 0 : value.cancel) === "function";
  }
  function isCancelledError(value) {
    return value instanceof CancelledError;
  }
  var CancelledError, Retryer;
  var init_retryer = __esm({
    "node_modules/react-query/es/core/retryer.js"() {
      init_focusManager();
      init_onlineManager();
      init_utils();
      CancelledError = function CancelledError2(options) {
        this.revert = options == null ? void 0 : options.revert;
        this.silent = options == null ? void 0 : options.silent;
      };
      Retryer = function Retryer2(config) {
        var _this = this;
        var cancelRetry = false;
        var cancelFn;
        var continueFn;
        var promiseResolve;
        var promiseReject;
        this.abort = config.abort;
        this.cancel = function(cancelOptions) {
          return cancelFn == null ? void 0 : cancelFn(cancelOptions);
        };
        this.cancelRetry = function() {
          cancelRetry = true;
        };
        this.continueRetry = function() {
          cancelRetry = false;
        };
        this.continue = function() {
          return continueFn == null ? void 0 : continueFn();
        };
        this.failureCount = 0;
        this.isPaused = false;
        this.isResolved = false;
        this.isTransportCancelable = false;
        this.promise = new Promise(function(outerResolve, outerReject) {
          promiseResolve = outerResolve;
          promiseReject = outerReject;
        });
        var resolve = function resolve2(value) {
          if (!_this.isResolved) {
            _this.isResolved = true;
            config.onSuccess == null ? void 0 : config.onSuccess(value);
            continueFn == null ? void 0 : continueFn();
            promiseResolve(value);
          }
        };
        var reject = function reject2(value) {
          if (!_this.isResolved) {
            _this.isResolved = true;
            config.onError == null ? void 0 : config.onError(value);
            continueFn == null ? void 0 : continueFn();
            promiseReject(value);
          }
        };
        var pause = function pause2() {
          return new Promise(function(continueResolve) {
            continueFn = continueResolve;
            _this.isPaused = true;
            config.onPause == null ? void 0 : config.onPause();
          }).then(function() {
            continueFn = void 0;
            _this.isPaused = false;
            config.onContinue == null ? void 0 : config.onContinue();
          });
        };
        var run = function run2() {
          if (_this.isResolved) {
            return;
          }
          var promiseOrValue;
          try {
            promiseOrValue = config.fn();
          } catch (error) {
            promiseOrValue = Promise.reject(error);
          }
          cancelFn = function cancelFn2(cancelOptions) {
            if (!_this.isResolved) {
              reject(new CancelledError(cancelOptions));
              _this.abort == null ? void 0 : _this.abort();
              if (isCancelable(promiseOrValue)) {
                try {
                  promiseOrValue.cancel();
                } catch (_unused) {
                }
              }
            }
          };
          _this.isTransportCancelable = isCancelable(promiseOrValue);
          Promise.resolve(promiseOrValue).then(resolve).catch(function(error) {
            var _config$retry, _config$retryDelay;
            if (_this.isResolved) {
              return;
            }
            var retry = (_config$retry = config.retry) != null ? _config$retry : 3;
            var retryDelay = (_config$retryDelay = config.retryDelay) != null ? _config$retryDelay : defaultRetryDelay;
            var delay = typeof retryDelay === "function" ? retryDelay(_this.failureCount, error) : retryDelay;
            var shouldRetry = retry === true || typeof retry === "number" && _this.failureCount < retry || typeof retry === "function" && retry(_this.failureCount, error);
            if (cancelRetry || !shouldRetry) {
              reject(error);
              return;
            }
            _this.failureCount++;
            config.onFail == null ? void 0 : config.onFail(_this.failureCount, error);
            sleep(delay).then(function() {
              if (!focusManager.isFocused() || !onlineManager.isOnline()) {
                return pause();
              }
            }).then(function() {
              if (cancelRetry) {
                reject(error);
              } else {
                run2();
              }
            });
          });
        };
        run();
      };
    }
  });

  // node_modules/react-query/es/core/notifyManager.js
  var NotifyManager, notifyManager;
  var init_notifyManager = __esm({
    "node_modules/react-query/es/core/notifyManager.js"() {
      init_utils();
      NotifyManager = /* @__PURE__ */ function() {
        function NotifyManager2() {
          this.queue = [];
          this.transactions = 0;
          this.notifyFn = function(callback) {
            callback();
          };
          this.batchNotifyFn = function(callback) {
            callback();
          };
        }
        var _proto = NotifyManager2.prototype;
        _proto.batch = function batch(callback) {
          var result;
          this.transactions++;
          try {
            result = callback();
          } finally {
            this.transactions--;
            if (!this.transactions) {
              this.flush();
            }
          }
          return result;
        };
        _proto.schedule = function schedule(callback) {
          var _this = this;
          if (this.transactions) {
            this.queue.push(callback);
          } else {
            scheduleMicrotask(function() {
              _this.notifyFn(callback);
            });
          }
        };
        _proto.batchCalls = function batchCalls(callback) {
          var _this2 = this;
          return function() {
            for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
              args[_key] = arguments[_key];
            }
            _this2.schedule(function() {
              callback.apply(void 0, args);
            });
          };
        };
        _proto.flush = function flush() {
          var _this3 = this;
          var queue = this.queue;
          this.queue = [];
          if (queue.length) {
            scheduleMicrotask(function() {
              _this3.batchNotifyFn(function() {
                queue.forEach(function(callback) {
                  _this3.notifyFn(callback);
                });
              });
            });
          }
        };
        _proto.setNotifyFunction = function setNotifyFunction(fn2) {
          this.notifyFn = fn2;
        };
        _proto.setBatchNotifyFunction = function setBatchNotifyFunction(fn2) {
          this.batchNotifyFn = fn2;
        };
        return NotifyManager2;
      }();
      notifyManager = new NotifyManager();
    }
  });

  // node_modules/react-query/es/core/logger.js
  function getLogger() {
    return logger;
  }
  function setLogger(newLogger) {
    logger = newLogger;
  }
  var logger;
  var init_logger = __esm({
    "node_modules/react-query/es/core/logger.js"() {
      logger = console;
    }
  });

  // node_modules/react-query/es/core/query.js
  var Query;
  var init_query = __esm({
    "node_modules/react-query/es/core/query.js"() {
      init_extends();
      init_utils();
      init_notifyManager();
      init_logger();
      init_retryer();
      Query = /* @__PURE__ */ function() {
        function Query3(config) {
          this.abortSignalConsumed = false;
          this.hadObservers = false;
          this.defaultOptions = config.defaultOptions;
          this.setOptions(config.options);
          this.observers = [];
          this.cache = config.cache;
          this.queryKey = config.queryKey;
          this.queryHash = config.queryHash;
          this.initialState = config.state || this.getDefaultState(this.options);
          this.state = this.initialState;
          this.meta = config.meta;
          this.scheduleGc();
        }
        var _proto = Query3.prototype;
        _proto.setOptions = function setOptions(options) {
          var _this$options$cacheTi;
          this.options = _extends({}, this.defaultOptions, options);
          this.meta = options == null ? void 0 : options.meta;
          this.cacheTime = Math.max(this.cacheTime || 0, (_this$options$cacheTi = this.options.cacheTime) != null ? _this$options$cacheTi : 5 * 60 * 1e3);
        };
        _proto.setDefaultOptions = function setDefaultOptions(options) {
          this.defaultOptions = options;
        };
        _proto.scheduleGc = function scheduleGc() {
          var _this = this;
          this.clearGcTimeout();
          if (isValidTimeout(this.cacheTime)) {
            this.gcTimeout = setTimeout(function() {
              _this.optionalRemove();
            }, this.cacheTime);
          }
        };
        _proto.clearGcTimeout = function clearGcTimeout() {
          if (this.gcTimeout) {
            clearTimeout(this.gcTimeout);
            this.gcTimeout = void 0;
          }
        };
        _proto.optionalRemove = function optionalRemove() {
          if (!this.observers.length) {
            if (this.state.isFetching) {
              if (this.hadObservers) {
                this.scheduleGc();
              }
            } else {
              this.cache.remove(this);
            }
          }
        };
        _proto.setData = function setData(updater, options) {
          var _this$options$isDataE, _this$options;
          var prevData = this.state.data;
          var data = functionalUpdate(updater, prevData);
          if ((_this$options$isDataE = (_this$options = this.options).isDataEqual) == null ? void 0 : _this$options$isDataE.call(_this$options, prevData, data)) {
            data = prevData;
          } else if (this.options.structuralSharing !== false) {
            data = replaceEqualDeep(prevData, data);
          }
          this.dispatch({
            data,
            type: "success",
            dataUpdatedAt: options == null ? void 0 : options.updatedAt
          });
          return data;
        };
        _proto.setState = function setState(state, setStateOptions) {
          this.dispatch({
            type: "setState",
            state,
            setStateOptions
          });
        };
        _proto.cancel = function cancel(options) {
          var _this$retryer;
          var promise = this.promise;
          (_this$retryer = this.retryer) == null ? void 0 : _this$retryer.cancel(options);
          return promise ? promise.then(noop).catch(noop) : Promise.resolve();
        };
        _proto.destroy = function destroy() {
          this.clearGcTimeout();
          this.cancel({
            silent: true
          });
        };
        _proto.reset = function reset() {
          this.destroy();
          this.setState(this.initialState);
        };
        _proto.isActive = function isActive() {
          return this.observers.some(function(observer) {
            return observer.options.enabled !== false;
          });
        };
        _proto.isFetching = function isFetching() {
          return this.state.isFetching;
        };
        _proto.isStale = function isStale2() {
          return this.state.isInvalidated || !this.state.dataUpdatedAt || this.observers.some(function(observer) {
            return observer.getCurrentResult().isStale;
          });
        };
        _proto.isStaleByTime = function isStaleByTime(staleTime) {
          if (staleTime === void 0) {
            staleTime = 0;
          }
          return this.state.isInvalidated || !this.state.dataUpdatedAt || !timeUntilStale(this.state.dataUpdatedAt, staleTime);
        };
        _proto.onFocus = function onFocus() {
          var _this$retryer2;
          var observer = this.observers.find(function(x4) {
            return x4.shouldFetchOnWindowFocus();
          });
          if (observer) {
            observer.refetch();
          }
          (_this$retryer2 = this.retryer) == null ? void 0 : _this$retryer2.continue();
        };
        _proto.onOnline = function onOnline() {
          var _this$retryer3;
          var observer = this.observers.find(function(x4) {
            return x4.shouldFetchOnReconnect();
          });
          if (observer) {
            observer.refetch();
          }
          (_this$retryer3 = this.retryer) == null ? void 0 : _this$retryer3.continue();
        };
        _proto.addObserver = function addObserver(observer) {
          if (this.observers.indexOf(observer) === -1) {
            this.observers.push(observer);
            this.hadObservers = true;
            this.clearGcTimeout();
            this.cache.notify({
              type: "observerAdded",
              query: this,
              observer
            });
          }
        };
        _proto.removeObserver = function removeObserver(observer) {
          if (this.observers.indexOf(observer) !== -1) {
            this.observers = this.observers.filter(function(x4) {
              return x4 !== observer;
            });
            if (!this.observers.length) {
              if (this.retryer) {
                if (this.retryer.isTransportCancelable || this.abortSignalConsumed) {
                  this.retryer.cancel({
                    revert: true
                  });
                } else {
                  this.retryer.cancelRetry();
                }
              }
              if (this.cacheTime) {
                this.scheduleGc();
              } else {
                this.cache.remove(this);
              }
            }
            this.cache.notify({
              type: "observerRemoved",
              query: this,
              observer
            });
          }
        };
        _proto.getObserversCount = function getObserversCount() {
          return this.observers.length;
        };
        _proto.invalidate = function invalidate() {
          if (!this.state.isInvalidated) {
            this.dispatch({
              type: "invalidate"
            });
          }
        };
        _proto.fetch = function fetch2(options, fetchOptions) {
          var _this2 = this, _this$options$behavio, _context$fetchOptions, _abortController$abor;
          if (this.state.isFetching) {
            if (this.state.dataUpdatedAt && (fetchOptions == null ? void 0 : fetchOptions.cancelRefetch)) {
              this.cancel({
                silent: true
              });
            } else if (this.promise) {
              var _this$retryer4;
              (_this$retryer4 = this.retryer) == null ? void 0 : _this$retryer4.continueRetry();
              return this.promise;
            }
          }
          if (options) {
            this.setOptions(options);
          }
          if (!this.options.queryFn) {
            var observer = this.observers.find(function(x4) {
              return x4.options.queryFn;
            });
            if (observer) {
              this.setOptions(observer.options);
            }
          }
          var queryKey = ensureQueryKeyArray(this.queryKey);
          var abortController = getAbortController();
          var queryFnContext = {
            queryKey,
            pageParam: void 0,
            meta: this.meta
          };
          Object.defineProperty(queryFnContext, "signal", {
            enumerable: true,
            get: function get() {
              if (abortController) {
                _this2.abortSignalConsumed = true;
                return abortController.signal;
              }
              return void 0;
            }
          });
          var fetchFn = function fetchFn2() {
            if (!_this2.options.queryFn) {
              return Promise.reject("Missing queryFn");
            }
            _this2.abortSignalConsumed = false;
            return _this2.options.queryFn(queryFnContext);
          };
          var context = {
            fetchOptions,
            options: this.options,
            queryKey,
            state: this.state,
            fetchFn,
            meta: this.meta
          };
          if ((_this$options$behavio = this.options.behavior) == null ? void 0 : _this$options$behavio.onFetch) {
            var _this$options$behavio2;
            (_this$options$behavio2 = this.options.behavior) == null ? void 0 : _this$options$behavio2.onFetch(context);
          }
          this.revertState = this.state;
          if (!this.state.isFetching || this.state.fetchMeta !== ((_context$fetchOptions = context.fetchOptions) == null ? void 0 : _context$fetchOptions.meta)) {
            var _context$fetchOptions2;
            this.dispatch({
              type: "fetch",
              meta: (_context$fetchOptions2 = context.fetchOptions) == null ? void 0 : _context$fetchOptions2.meta
            });
          }
          this.retryer = new Retryer({
            fn: context.fetchFn,
            abort: abortController == null ? void 0 : (_abortController$abor = abortController.abort) == null ? void 0 : _abortController$abor.bind(abortController),
            onSuccess: function onSuccess(data) {
              _this2.setData(data);
              _this2.cache.config.onSuccess == null ? void 0 : _this2.cache.config.onSuccess(data, _this2);
              if (_this2.cacheTime === 0) {
                _this2.optionalRemove();
              }
            },
            onError: function onError(error) {
              if (!(isCancelledError(error) && error.silent)) {
                _this2.dispatch({
                  type: "error",
                  error
                });
              }
              if (!isCancelledError(error)) {
                _this2.cache.config.onError == null ? void 0 : _this2.cache.config.onError(error, _this2);
                getLogger().error(error);
              }
              if (_this2.cacheTime === 0) {
                _this2.optionalRemove();
              }
            },
            onFail: function onFail() {
              _this2.dispatch({
                type: "failed"
              });
            },
            onPause: function onPause() {
              _this2.dispatch({
                type: "pause"
              });
            },
            onContinue: function onContinue() {
              _this2.dispatch({
                type: "continue"
              });
            },
            retry: context.options.retry,
            retryDelay: context.options.retryDelay
          });
          this.promise = this.retryer.promise;
          return this.promise;
        };
        _proto.dispatch = function dispatch(action) {
          var _this3 = this;
          this.state = this.reducer(this.state, action);
          notifyManager.batch(function() {
            _this3.observers.forEach(function(observer) {
              observer.onQueryUpdate(action);
            });
            _this3.cache.notify({
              query: _this3,
              type: "queryUpdated",
              action
            });
          });
        };
        _proto.getDefaultState = function getDefaultState2(options) {
          var data = typeof options.initialData === "function" ? options.initialData() : options.initialData;
          var hasInitialData = typeof options.initialData !== "undefined";
          var initialDataUpdatedAt = hasInitialData ? typeof options.initialDataUpdatedAt === "function" ? options.initialDataUpdatedAt() : options.initialDataUpdatedAt : 0;
          var hasData = typeof data !== "undefined";
          return {
            data,
            dataUpdateCount: 0,
            dataUpdatedAt: hasData ? initialDataUpdatedAt != null ? initialDataUpdatedAt : Date.now() : 0,
            error: null,
            errorUpdateCount: 0,
            errorUpdatedAt: 0,
            fetchFailureCount: 0,
            fetchMeta: null,
            isFetching: false,
            isInvalidated: false,
            isPaused: false,
            status: hasData ? "success" : "idle"
          };
        };
        _proto.reducer = function reducer2(state, action) {
          var _action$meta, _action$dataUpdatedAt;
          switch (action.type) {
            case "failed":
              return _extends({}, state, {
                fetchFailureCount: state.fetchFailureCount + 1
              });
            case "pause":
              return _extends({}, state, {
                isPaused: true
              });
            case "continue":
              return _extends({}, state, {
                isPaused: false
              });
            case "fetch":
              return _extends({}, state, {
                fetchFailureCount: 0,
                fetchMeta: (_action$meta = action.meta) != null ? _action$meta : null,
                isFetching: true,
                isPaused: false
              }, !state.dataUpdatedAt && {
                error: null,
                status: "loading"
              });
            case "success":
              return _extends({}, state, {
                data: action.data,
                dataUpdateCount: state.dataUpdateCount + 1,
                dataUpdatedAt: (_action$dataUpdatedAt = action.dataUpdatedAt) != null ? _action$dataUpdatedAt : Date.now(),
                error: null,
                fetchFailureCount: 0,
                isFetching: false,
                isInvalidated: false,
                isPaused: false,
                status: "success"
              });
            case "error":
              var error = action.error;
              if (isCancelledError(error) && error.revert && this.revertState) {
                return _extends({}, this.revertState);
              }
              return _extends({}, state, {
                error,
                errorUpdateCount: state.errorUpdateCount + 1,
                errorUpdatedAt: Date.now(),
                fetchFailureCount: state.fetchFailureCount + 1,
                isFetching: false,
                isPaused: false,
                status: "error"
              });
            case "invalidate":
              return _extends({}, state, {
                isInvalidated: true
              });
            case "setState":
              return _extends({}, state, action.state);
            default:
              return state;
          }
        };
        return Query3;
      }();
    }
  });

  // node_modules/react-query/es/core/queryCache.js
  var QueryCache;
  var init_queryCache = __esm({
    "node_modules/react-query/es/core/queryCache.js"() {
      init_inheritsLoose();
      init_utils();
      init_query();
      init_notifyManager();
      init_subscribable();
      QueryCache = /* @__PURE__ */ function(_Subscribable) {
        _inheritsLoose(QueryCache2, _Subscribable);
        function QueryCache2(config) {
          var _this;
          _this = _Subscribable.call(this) || this;
          _this.config = config || {};
          _this.queries = [];
          _this.queriesMap = {};
          return _this;
        }
        var _proto = QueryCache2.prototype;
        _proto.build = function build(client2, options, state) {
          var _options$queryHash;
          var queryKey = options.queryKey;
          var queryHash = (_options$queryHash = options.queryHash) != null ? _options$queryHash : hashQueryKeyByOptions(queryKey, options);
          var query = this.get(queryHash);
          if (!query) {
            query = new Query({
              cache: this,
              queryKey,
              queryHash,
              options: client2.defaultQueryOptions(options),
              state,
              defaultOptions: client2.getQueryDefaults(queryKey),
              meta: options.meta
            });
            this.add(query);
          }
          return query;
        };
        _proto.add = function add(query) {
          if (!this.queriesMap[query.queryHash]) {
            this.queriesMap[query.queryHash] = query;
            this.queries.push(query);
            this.notify({
              type: "queryAdded",
              query
            });
          }
        };
        _proto.remove = function remove(query) {
          var queryInMap = this.queriesMap[query.queryHash];
          if (queryInMap) {
            query.destroy();
            this.queries = this.queries.filter(function(x4) {
              return x4 !== query;
            });
            if (queryInMap === query) {
              delete this.queriesMap[query.queryHash];
            }
            this.notify({
              type: "queryRemoved",
              query
            });
          }
        };
        _proto.clear = function clear() {
          var _this2 = this;
          notifyManager.batch(function() {
            _this2.queries.forEach(function(query) {
              _this2.remove(query);
            });
          });
        };
        _proto.get = function get(queryHash) {
          return this.queriesMap[queryHash];
        };
        _proto.getAll = function getAll() {
          return this.queries;
        };
        _proto.find = function find(arg1, arg2) {
          var _parseFilterArgs = parseFilterArgs(arg1, arg2), filters = _parseFilterArgs[0];
          if (typeof filters.exact === "undefined") {
            filters.exact = true;
          }
          return this.queries.find(function(query) {
            return matchQuery(filters, query);
          });
        };
        _proto.findAll = function findAll(arg1, arg2) {
          var _parseFilterArgs2 = parseFilterArgs(arg1, arg2), filters = _parseFilterArgs2[0];
          return Object.keys(filters).length > 0 ? this.queries.filter(function(query) {
            return matchQuery(filters, query);
          }) : this.queries;
        };
        _proto.notify = function notify(event) {
          var _this3 = this;
          notifyManager.batch(function() {
            _this3.listeners.forEach(function(listener) {
              listener(event);
            });
          });
        };
        _proto.onFocus = function onFocus() {
          var _this4 = this;
          notifyManager.batch(function() {
            _this4.queries.forEach(function(query) {
              query.onFocus();
            });
          });
        };
        _proto.onOnline = function onOnline() {
          var _this5 = this;
          notifyManager.batch(function() {
            _this5.queries.forEach(function(query) {
              query.onOnline();
            });
          });
        };
        return QueryCache2;
      }(Subscribable);
    }
  });

  // node_modules/react-query/es/core/mutation.js
  function getDefaultState() {
    return {
      context: void 0,
      data: void 0,
      error: null,
      failureCount: 0,
      isPaused: false,
      status: "idle",
      variables: void 0
    };
  }
  function reducer(state, action) {
    switch (action.type) {
      case "failed":
        return _extends({}, state, {
          failureCount: state.failureCount + 1
        });
      case "pause":
        return _extends({}, state, {
          isPaused: true
        });
      case "continue":
        return _extends({}, state, {
          isPaused: false
        });
      case "loading":
        return _extends({}, state, {
          context: action.context,
          data: void 0,
          error: null,
          isPaused: false,
          status: "loading",
          variables: action.variables
        });
      case "success":
        return _extends({}, state, {
          data: action.data,
          error: null,
          status: "success",
          isPaused: false
        });
      case "error":
        return _extends({}, state, {
          data: void 0,
          error: action.error,
          failureCount: state.failureCount + 1,
          isPaused: false,
          status: "error"
        });
      case "setState":
        return _extends({}, state, action.state);
      default:
        return state;
    }
  }
  var Mutation;
  var init_mutation = __esm({
    "node_modules/react-query/es/core/mutation.js"() {
      init_extends();
      init_logger();
      init_notifyManager();
      init_retryer();
      init_utils();
      Mutation = /* @__PURE__ */ function() {
        function Mutation2(config) {
          this.options = _extends({}, config.defaultOptions, config.options);
          this.mutationId = config.mutationId;
          this.mutationCache = config.mutationCache;
          this.observers = [];
          this.state = config.state || getDefaultState();
          this.meta = config.meta;
        }
        var _proto = Mutation2.prototype;
        _proto.setState = function setState(state) {
          this.dispatch({
            type: "setState",
            state
          });
        };
        _proto.addObserver = function addObserver(observer) {
          if (this.observers.indexOf(observer) === -1) {
            this.observers.push(observer);
          }
        };
        _proto.removeObserver = function removeObserver(observer) {
          this.observers = this.observers.filter(function(x4) {
            return x4 !== observer;
          });
        };
        _proto.cancel = function cancel() {
          if (this.retryer) {
            this.retryer.cancel();
            return this.retryer.promise.then(noop).catch(noop);
          }
          return Promise.resolve();
        };
        _proto.continue = function _continue() {
          if (this.retryer) {
            this.retryer.continue();
            return this.retryer.promise;
          }
          return this.execute();
        };
        _proto.execute = function execute() {
          var _this = this;
          var data;
          var restored = this.state.status === "loading";
          var promise = Promise.resolve();
          if (!restored) {
            this.dispatch({
              type: "loading",
              variables: this.options.variables
            });
            promise = promise.then(function() {
              _this.mutationCache.config.onMutate == null ? void 0 : _this.mutationCache.config.onMutate(_this.state.variables, _this);
            }).then(function() {
              return _this.options.onMutate == null ? void 0 : _this.options.onMutate(_this.state.variables);
            }).then(function(context) {
              if (context !== _this.state.context) {
                _this.dispatch({
                  type: "loading",
                  context,
                  variables: _this.state.variables
                });
              }
            });
          }
          return promise.then(function() {
            return _this.executeMutation();
          }).then(function(result) {
            data = result;
            _this.mutationCache.config.onSuccess == null ? void 0 : _this.mutationCache.config.onSuccess(data, _this.state.variables, _this.state.context, _this);
          }).then(function() {
            return _this.options.onSuccess == null ? void 0 : _this.options.onSuccess(data, _this.state.variables, _this.state.context);
          }).then(function() {
            return _this.options.onSettled == null ? void 0 : _this.options.onSettled(data, null, _this.state.variables, _this.state.context);
          }).then(function() {
            _this.dispatch({
              type: "success",
              data
            });
            return data;
          }).catch(function(error) {
            _this.mutationCache.config.onError == null ? void 0 : _this.mutationCache.config.onError(error, _this.state.variables, _this.state.context, _this);
            getLogger().error(error);
            return Promise.resolve().then(function() {
              return _this.options.onError == null ? void 0 : _this.options.onError(error, _this.state.variables, _this.state.context);
            }).then(function() {
              return _this.options.onSettled == null ? void 0 : _this.options.onSettled(void 0, error, _this.state.variables, _this.state.context);
            }).then(function() {
              _this.dispatch({
                type: "error",
                error
              });
              throw error;
            });
          });
        };
        _proto.executeMutation = function executeMutation() {
          var _this2 = this, _this$options$retry;
          this.retryer = new Retryer({
            fn: function fn2() {
              if (!_this2.options.mutationFn) {
                return Promise.reject("No mutationFn found");
              }
              return _this2.options.mutationFn(_this2.state.variables);
            },
            onFail: function onFail() {
              _this2.dispatch({
                type: "failed"
              });
            },
            onPause: function onPause() {
              _this2.dispatch({
                type: "pause"
              });
            },
            onContinue: function onContinue() {
              _this2.dispatch({
                type: "continue"
              });
            },
            retry: (_this$options$retry = this.options.retry) != null ? _this$options$retry : 0,
            retryDelay: this.options.retryDelay
          });
          return this.retryer.promise;
        };
        _proto.dispatch = function dispatch(action) {
          var _this3 = this;
          this.state = reducer(this.state, action);
          notifyManager.batch(function() {
            _this3.observers.forEach(function(observer) {
              observer.onMutationUpdate(action);
            });
            _this3.mutationCache.notify(_this3);
          });
        };
        return Mutation2;
      }();
    }
  });

  // node_modules/react-query/es/core/mutationCache.js
  var MutationCache;
  var init_mutationCache = __esm({
    "node_modules/react-query/es/core/mutationCache.js"() {
      init_inheritsLoose();
      init_notifyManager();
      init_mutation();
      init_utils();
      init_subscribable();
      MutationCache = /* @__PURE__ */ function(_Subscribable) {
        _inheritsLoose(MutationCache2, _Subscribable);
        function MutationCache2(config) {
          var _this;
          _this = _Subscribable.call(this) || this;
          _this.config = config || {};
          _this.mutations = [];
          _this.mutationId = 0;
          return _this;
        }
        var _proto = MutationCache2.prototype;
        _proto.build = function build(client2, options, state) {
          var mutation = new Mutation({
            mutationCache: this,
            mutationId: ++this.mutationId,
            options: client2.defaultMutationOptions(options),
            state,
            defaultOptions: options.mutationKey ? client2.getMutationDefaults(options.mutationKey) : void 0,
            meta: options.meta
          });
          this.add(mutation);
          return mutation;
        };
        _proto.add = function add(mutation) {
          this.mutations.push(mutation);
          this.notify(mutation);
        };
        _proto.remove = function remove(mutation) {
          this.mutations = this.mutations.filter(function(x4) {
            return x4 !== mutation;
          });
          mutation.cancel();
          this.notify(mutation);
        };
        _proto.clear = function clear() {
          var _this2 = this;
          notifyManager.batch(function() {
            _this2.mutations.forEach(function(mutation) {
              _this2.remove(mutation);
            });
          });
        };
        _proto.getAll = function getAll() {
          return this.mutations;
        };
        _proto.find = function find(filters) {
          if (typeof filters.exact === "undefined") {
            filters.exact = true;
          }
          return this.mutations.find(function(mutation) {
            return matchMutation(filters, mutation);
          });
        };
        _proto.findAll = function findAll(filters) {
          return this.mutations.filter(function(mutation) {
            return matchMutation(filters, mutation);
          });
        };
        _proto.notify = function notify(mutation) {
          var _this3 = this;
          notifyManager.batch(function() {
            _this3.listeners.forEach(function(listener) {
              listener(mutation);
            });
          });
        };
        _proto.onFocus = function onFocus() {
          this.resumePausedMutations();
        };
        _proto.onOnline = function onOnline() {
          this.resumePausedMutations();
        };
        _proto.resumePausedMutations = function resumePausedMutations() {
          var pausedMutations = this.mutations.filter(function(x4) {
            return x4.state.isPaused;
          });
          return notifyManager.batch(function() {
            return pausedMutations.reduce(function(promise, mutation) {
              return promise.then(function() {
                return mutation.continue().catch(noop);
              });
            }, Promise.resolve());
          });
        };
        return MutationCache2;
      }(Subscribable);
    }
  });

  // node_modules/react-query/es/core/infiniteQueryBehavior.js
  function infiniteQueryBehavior() {
    return {
      onFetch: function onFetch(context) {
        context.fetchFn = function() {
          var _context$fetchOptions, _context$fetchOptions2, _context$fetchOptions3, _context$fetchOptions4, _context$state$data, _context$state$data2;
          var refetchPage = (_context$fetchOptions = context.fetchOptions) == null ? void 0 : (_context$fetchOptions2 = _context$fetchOptions.meta) == null ? void 0 : _context$fetchOptions2.refetchPage;
          var fetchMore = (_context$fetchOptions3 = context.fetchOptions) == null ? void 0 : (_context$fetchOptions4 = _context$fetchOptions3.meta) == null ? void 0 : _context$fetchOptions4.fetchMore;
          var pageParam = fetchMore == null ? void 0 : fetchMore.pageParam;
          var isFetchingNextPage = (fetchMore == null ? void 0 : fetchMore.direction) === "forward";
          var isFetchingPreviousPage = (fetchMore == null ? void 0 : fetchMore.direction) === "backward";
          var oldPages = ((_context$state$data = context.state.data) == null ? void 0 : _context$state$data.pages) || [];
          var oldPageParams = ((_context$state$data2 = context.state.data) == null ? void 0 : _context$state$data2.pageParams) || [];
          var abortController = getAbortController();
          var abortSignal = abortController == null ? void 0 : abortController.signal;
          var newPageParams = oldPageParams;
          var cancelled = false;
          var queryFn = context.options.queryFn || function() {
            return Promise.reject("Missing queryFn");
          };
          var buildNewPages = function buildNewPages2(pages, param2, page, previous) {
            newPageParams = previous ? [param2].concat(newPageParams) : [].concat(newPageParams, [param2]);
            return previous ? [page].concat(pages) : [].concat(pages, [page]);
          };
          var fetchPage = function fetchPage2(pages, manual2, param2, previous) {
            if (cancelled) {
              return Promise.reject("Cancelled");
            }
            if (typeof param2 === "undefined" && !manual2 && pages.length) {
              return Promise.resolve(pages);
            }
            var queryFnContext = {
              queryKey: context.queryKey,
              signal: abortSignal,
              pageParam: param2,
              meta: context.meta
            };
            var queryFnResult = queryFn(queryFnContext);
            var promise2 = Promise.resolve(queryFnResult).then(function(page) {
              return buildNewPages(pages, param2, page, previous);
            });
            if (isCancelable(queryFnResult)) {
              var promiseAsAny = promise2;
              promiseAsAny.cancel = queryFnResult.cancel;
            }
            return promise2;
          };
          var promise;
          if (!oldPages.length) {
            promise = fetchPage([]);
          } else if (isFetchingNextPage) {
            var manual = typeof pageParam !== "undefined";
            var param = manual ? pageParam : getNextPageParam(context.options, oldPages);
            promise = fetchPage(oldPages, manual, param);
          } else if (isFetchingPreviousPage) {
            var _manual = typeof pageParam !== "undefined";
            var _param = _manual ? pageParam : getPreviousPageParam(context.options, oldPages);
            promise = fetchPage(oldPages, _manual, _param, true);
          } else {
            (function() {
              newPageParams = [];
              var manual2 = typeof context.options.getNextPageParam === "undefined";
              var shouldFetchFirstPage = refetchPage && oldPages[0] ? refetchPage(oldPages[0], 0, oldPages) : true;
              promise = shouldFetchFirstPage ? fetchPage([], manual2, oldPageParams[0]) : Promise.resolve(buildNewPages([], oldPageParams[0], oldPages[0]));
              var _loop = function _loop2(i5) {
                promise = promise.then(function(pages) {
                  var shouldFetchNextPage = refetchPage && oldPages[i5] ? refetchPage(oldPages[i5], i5, oldPages) : true;
                  if (shouldFetchNextPage) {
                    var _param2 = manual2 ? oldPageParams[i5] : getNextPageParam(context.options, pages);
                    return fetchPage(pages, manual2, _param2);
                  }
                  return Promise.resolve(buildNewPages(pages, oldPageParams[i5], oldPages[i5]));
                });
              };
              for (var i4 = 1; i4 < oldPages.length; i4++) {
                _loop(i4);
              }
            })();
          }
          var finalPromise = promise.then(function(pages) {
            return {
              pages,
              pageParams: newPageParams
            };
          });
          var finalPromiseAsAny = finalPromise;
          finalPromiseAsAny.cancel = function() {
            cancelled = true;
            abortController == null ? void 0 : abortController.abort();
            if (isCancelable(promise)) {
              promise.cancel();
            }
          };
          return finalPromise;
        };
      }
    };
  }
  function getNextPageParam(options, pages) {
    return options.getNextPageParam == null ? void 0 : options.getNextPageParam(pages[pages.length - 1], pages);
  }
  function getPreviousPageParam(options, pages) {
    return options.getPreviousPageParam == null ? void 0 : options.getPreviousPageParam(pages[0], pages);
  }
  var init_infiniteQueryBehavior = __esm({
    "node_modules/react-query/es/core/infiniteQueryBehavior.js"() {
      init_retryer();
      init_utils();
    }
  });

  // node_modules/react-query/es/core/queryClient.js
  var QueryClient;
  var init_queryClient = __esm({
    "node_modules/react-query/es/core/queryClient.js"() {
      init_extends();
      init_utils();
      init_queryCache();
      init_mutationCache();
      init_focusManager();
      init_onlineManager();
      init_notifyManager();
      init_infiniteQueryBehavior();
      QueryClient = /* @__PURE__ */ function() {
        function QueryClient3(config) {
          if (config === void 0) {
            config = {};
          }
          this.queryCache = config.queryCache || new QueryCache();
          this.mutationCache = config.mutationCache || new MutationCache();
          this.defaultOptions = config.defaultOptions || {};
          this.queryDefaults = [];
          this.mutationDefaults = [];
        }
        var _proto = QueryClient3.prototype;
        _proto.mount = function mount() {
          var _this = this;
          this.unsubscribeFocus = focusManager.subscribe(function() {
            if (focusManager.isFocused() && onlineManager.isOnline()) {
              _this.mutationCache.onFocus();
              _this.queryCache.onFocus();
            }
          });
          this.unsubscribeOnline = onlineManager.subscribe(function() {
            if (focusManager.isFocused() && onlineManager.isOnline()) {
              _this.mutationCache.onOnline();
              _this.queryCache.onOnline();
            }
          });
        };
        _proto.unmount = function unmount() {
          var _this$unsubscribeFocu, _this$unsubscribeOnli;
          (_this$unsubscribeFocu = this.unsubscribeFocus) == null ? void 0 : _this$unsubscribeFocu.call(this);
          (_this$unsubscribeOnli = this.unsubscribeOnline) == null ? void 0 : _this$unsubscribeOnli.call(this);
        };
        _proto.isFetching = function isFetching(arg1, arg2) {
          var _parseFilterArgs = parseFilterArgs(arg1, arg2), filters = _parseFilterArgs[0];
          filters.fetching = true;
          return this.queryCache.findAll(filters).length;
        };
        _proto.isMutating = function isMutating(filters) {
          return this.mutationCache.findAll(_extends({}, filters, {
            fetching: true
          })).length;
        };
        _proto.getQueryData = function getQueryData(queryKey, filters) {
          var _this$queryCache$find;
          return (_this$queryCache$find = this.queryCache.find(queryKey, filters)) == null ? void 0 : _this$queryCache$find.state.data;
        };
        _proto.getQueriesData = function getQueriesData(queryKeyOrFilters) {
          return this.getQueryCache().findAll(queryKeyOrFilters).map(function(_ref) {
            var queryKey = _ref.queryKey, state = _ref.state;
            var data = state.data;
            return [queryKey, data];
          });
        };
        _proto.setQueryData = function setQueryData(queryKey, updater, options) {
          var parsedOptions = parseQueryArgs(queryKey);
          var defaultedOptions = this.defaultQueryOptions(parsedOptions);
          return this.queryCache.build(this, defaultedOptions).setData(updater, options);
        };
        _proto.setQueriesData = function setQueriesData(queryKeyOrFilters, updater, options) {
          var _this2 = this;
          return notifyManager.batch(function() {
            return _this2.getQueryCache().findAll(queryKeyOrFilters).map(function(_ref2) {
              var queryKey = _ref2.queryKey;
              return [queryKey, _this2.setQueryData(queryKey, updater, options)];
            });
          });
        };
        _proto.getQueryState = function getQueryState(queryKey, filters) {
          var _this$queryCache$find2;
          return (_this$queryCache$find2 = this.queryCache.find(queryKey, filters)) == null ? void 0 : _this$queryCache$find2.state;
        };
        _proto.removeQueries = function removeQueries(arg1, arg2) {
          var _parseFilterArgs2 = parseFilterArgs(arg1, arg2), filters = _parseFilterArgs2[0];
          var queryCache = this.queryCache;
          notifyManager.batch(function() {
            queryCache.findAll(filters).forEach(function(query) {
              queryCache.remove(query);
            });
          });
        };
        _proto.resetQueries = function resetQueries(arg1, arg2, arg3) {
          var _this3 = this;
          var _parseFilterArgs3 = parseFilterArgs(arg1, arg2, arg3), filters = _parseFilterArgs3[0], options = _parseFilterArgs3[1];
          var queryCache = this.queryCache;
          var refetchFilters = _extends({}, filters, {
            active: true
          });
          return notifyManager.batch(function() {
            queryCache.findAll(filters).forEach(function(query) {
              query.reset();
            });
            return _this3.refetchQueries(refetchFilters, options);
          });
        };
        _proto.cancelQueries = function cancelQueries(arg1, arg2, arg3) {
          var _this4 = this;
          var _parseFilterArgs4 = parseFilterArgs(arg1, arg2, arg3), filters = _parseFilterArgs4[0], _parseFilterArgs4$ = _parseFilterArgs4[1], cancelOptions = _parseFilterArgs4$ === void 0 ? {} : _parseFilterArgs4$;
          if (typeof cancelOptions.revert === "undefined") {
            cancelOptions.revert = true;
          }
          var promises = notifyManager.batch(function() {
            return _this4.queryCache.findAll(filters).map(function(query) {
              return query.cancel(cancelOptions);
            });
          });
          return Promise.all(promises).then(noop).catch(noop);
        };
        _proto.invalidateQueries = function invalidateQueries(arg1, arg2, arg3) {
          var _ref3, _filters$refetchActiv, _filters$refetchInact, _this5 = this;
          var _parseFilterArgs5 = parseFilterArgs(arg1, arg2, arg3), filters = _parseFilterArgs5[0], options = _parseFilterArgs5[1];
          var refetchFilters = _extends({}, filters, {
            active: (_ref3 = (_filters$refetchActiv = filters.refetchActive) != null ? _filters$refetchActiv : filters.active) != null ? _ref3 : true,
            inactive: (_filters$refetchInact = filters.refetchInactive) != null ? _filters$refetchInact : false
          });
          return notifyManager.batch(function() {
            _this5.queryCache.findAll(filters).forEach(function(query) {
              query.invalidate();
            });
            return _this5.refetchQueries(refetchFilters, options);
          });
        };
        _proto.refetchQueries = function refetchQueries(arg1, arg2, arg3) {
          var _this6 = this;
          var _parseFilterArgs6 = parseFilterArgs(arg1, arg2, arg3), filters = _parseFilterArgs6[0], options = _parseFilterArgs6[1];
          var promises = notifyManager.batch(function() {
            return _this6.queryCache.findAll(filters).map(function(query) {
              return query.fetch(void 0, _extends({}, options, {
                meta: {
                  refetchPage: filters == null ? void 0 : filters.refetchPage
                }
              }));
            });
          });
          var promise = Promise.all(promises).then(noop);
          if (!(options == null ? void 0 : options.throwOnError)) {
            promise = promise.catch(noop);
          }
          return promise;
        };
        _proto.fetchQuery = function fetchQuery(arg1, arg2, arg3) {
          var parsedOptions = parseQueryArgs(arg1, arg2, arg3);
          var defaultedOptions = this.defaultQueryOptions(parsedOptions);
          if (typeof defaultedOptions.retry === "undefined") {
            defaultedOptions.retry = false;
          }
          var query = this.queryCache.build(this, defaultedOptions);
          return query.isStaleByTime(defaultedOptions.staleTime) ? query.fetch(defaultedOptions) : Promise.resolve(query.state.data);
        };
        _proto.prefetchQuery = function prefetchQuery(arg1, arg2, arg3) {
          return this.fetchQuery(arg1, arg2, arg3).then(noop).catch(noop);
        };
        _proto.fetchInfiniteQuery = function fetchInfiniteQuery(arg1, arg2, arg3) {
          var parsedOptions = parseQueryArgs(arg1, arg2, arg3);
          parsedOptions.behavior = infiniteQueryBehavior();
          return this.fetchQuery(parsedOptions);
        };
        _proto.prefetchInfiniteQuery = function prefetchInfiniteQuery(arg1, arg2, arg3) {
          return this.fetchInfiniteQuery(arg1, arg2, arg3).then(noop).catch(noop);
        };
        _proto.cancelMutations = function cancelMutations() {
          var _this7 = this;
          var promises = notifyManager.batch(function() {
            return _this7.mutationCache.getAll().map(function(mutation) {
              return mutation.cancel();
            });
          });
          return Promise.all(promises).then(noop).catch(noop);
        };
        _proto.resumePausedMutations = function resumePausedMutations() {
          return this.getMutationCache().resumePausedMutations();
        };
        _proto.executeMutation = function executeMutation(options) {
          return this.mutationCache.build(this, options).execute();
        };
        _proto.getQueryCache = function getQueryCache() {
          return this.queryCache;
        };
        _proto.getMutationCache = function getMutationCache() {
          return this.mutationCache;
        };
        _proto.getDefaultOptions = function getDefaultOptions() {
          return this.defaultOptions;
        };
        _proto.setDefaultOptions = function setDefaultOptions(options) {
          this.defaultOptions = options;
        };
        _proto.setQueryDefaults = function setQueryDefaults(queryKey, options) {
          var result = this.queryDefaults.find(function(x4) {
            return hashQueryKey(queryKey) === hashQueryKey(x4.queryKey);
          });
          if (result) {
            result.defaultOptions = options;
          } else {
            this.queryDefaults.push({
              queryKey,
              defaultOptions: options
            });
          }
        };
        _proto.getQueryDefaults = function getQueryDefaults(queryKey) {
          var _this$queryDefaults$f;
          return queryKey ? (_this$queryDefaults$f = this.queryDefaults.find(function(x4) {
            return partialMatchKey(queryKey, x4.queryKey);
          })) == null ? void 0 : _this$queryDefaults$f.defaultOptions : void 0;
        };
        _proto.setMutationDefaults = function setMutationDefaults(mutationKey, options) {
          var result = this.mutationDefaults.find(function(x4) {
            return hashQueryKey(mutationKey) === hashQueryKey(x4.mutationKey);
          });
          if (result) {
            result.defaultOptions = options;
          } else {
            this.mutationDefaults.push({
              mutationKey,
              defaultOptions: options
            });
          }
        };
        _proto.getMutationDefaults = function getMutationDefaults(mutationKey) {
          var _this$mutationDefault;
          return mutationKey ? (_this$mutationDefault = this.mutationDefaults.find(function(x4) {
            return partialMatchKey(mutationKey, x4.mutationKey);
          })) == null ? void 0 : _this$mutationDefault.defaultOptions : void 0;
        };
        _proto.defaultQueryOptions = function defaultQueryOptions(options) {
          if (options == null ? void 0 : options._defaulted) {
            return options;
          }
          var defaultedOptions = _extends({}, this.defaultOptions.queries, this.getQueryDefaults(options == null ? void 0 : options.queryKey), options, {
            _defaulted: true
          });
          if (!defaultedOptions.queryHash && defaultedOptions.queryKey) {
            defaultedOptions.queryHash = hashQueryKeyByOptions(defaultedOptions.queryKey, defaultedOptions);
          }
          return defaultedOptions;
        };
        _proto.defaultQueryObserverOptions = function defaultQueryObserverOptions(options) {
          return this.defaultQueryOptions(options);
        };
        _proto.defaultMutationOptions = function defaultMutationOptions(options) {
          if (options == null ? void 0 : options._defaulted) {
            return options;
          }
          return _extends({}, this.defaultOptions.mutations, this.getMutationDefaults(options == null ? void 0 : options.mutationKey), options, {
            _defaulted: true
          });
        };
        _proto.clear = function clear() {
          this.queryCache.clear();
          this.mutationCache.clear();
        };
        return QueryClient3;
      }();
    }
  });

  // node_modules/react-query/es/core/queryObserver.js
  function shouldLoadOnMount(query, options) {
    return options.enabled !== false && !query.state.dataUpdatedAt && !(query.state.status === "error" && options.retryOnMount === false);
  }
  function shouldFetchOnMount(query, options) {
    return shouldLoadOnMount(query, options) || query.state.dataUpdatedAt > 0 && shouldFetchOn(query, options, options.refetchOnMount);
  }
  function shouldFetchOn(query, options, field) {
    if (options.enabled !== false) {
      var value = typeof field === "function" ? field(query) : field;
      return value === "always" || value !== false && isStale(query, options);
    }
    return false;
  }
  function shouldFetchOptionally(query, prevQuery, options, prevOptions) {
    return options.enabled !== false && (query !== prevQuery || prevOptions.enabled === false) && (!options.suspense || query.state.status !== "error") && isStale(query, options);
  }
  function isStale(query, options) {
    return query.isStaleByTime(options.staleTime);
  }
  var QueryObserver;
  var init_queryObserver = __esm({
    "node_modules/react-query/es/core/queryObserver.js"() {
      init_extends();
      init_inheritsLoose();
      init_utils();
      init_notifyManager();
      init_focusManager();
      init_subscribable();
      init_logger();
      init_retryer();
      QueryObserver = /* @__PURE__ */ function(_Subscribable) {
        _inheritsLoose(QueryObserver2, _Subscribable);
        function QueryObserver2(client2, options) {
          var _this;
          _this = _Subscribable.call(this) || this;
          _this.client = client2;
          _this.options = options;
          _this.trackedProps = [];
          _this.selectError = null;
          _this.bindMethods();
          _this.setOptions(options);
          return _this;
        }
        var _proto = QueryObserver2.prototype;
        _proto.bindMethods = function bindMethods() {
          this.remove = this.remove.bind(this);
          this.refetch = this.refetch.bind(this);
        };
        _proto.onSubscribe = function onSubscribe() {
          if (this.listeners.length === 1) {
            this.currentQuery.addObserver(this);
            if (shouldFetchOnMount(this.currentQuery, this.options)) {
              this.executeFetch();
            }
            this.updateTimers();
          }
        };
        _proto.onUnsubscribe = function onUnsubscribe() {
          if (!this.listeners.length) {
            this.destroy();
          }
        };
        _proto.shouldFetchOnReconnect = function shouldFetchOnReconnect() {
          return shouldFetchOn(this.currentQuery, this.options, this.options.refetchOnReconnect);
        };
        _proto.shouldFetchOnWindowFocus = function shouldFetchOnWindowFocus() {
          return shouldFetchOn(this.currentQuery, this.options, this.options.refetchOnWindowFocus);
        };
        _proto.destroy = function destroy() {
          this.listeners = [];
          this.clearTimers();
          this.currentQuery.removeObserver(this);
        };
        _proto.setOptions = function setOptions(options, notifyOptions) {
          var prevOptions = this.options;
          var prevQuery = this.currentQuery;
          this.options = this.client.defaultQueryObserverOptions(options);
          if (typeof this.options.enabled !== "undefined" && typeof this.options.enabled !== "boolean") {
            throw new Error("Expected enabled to be a boolean");
          }
          if (!this.options.queryKey) {
            this.options.queryKey = prevOptions.queryKey;
          }
          this.updateQuery();
          var mounted = this.hasListeners();
          if (mounted && shouldFetchOptionally(this.currentQuery, prevQuery, this.options, prevOptions)) {
            this.executeFetch();
          }
          this.updateResult(notifyOptions);
          if (mounted && (this.currentQuery !== prevQuery || this.options.enabled !== prevOptions.enabled || this.options.staleTime !== prevOptions.staleTime)) {
            this.updateStaleTimeout();
          }
          var nextRefetchInterval = this.computeRefetchInterval();
          if (mounted && (this.currentQuery !== prevQuery || this.options.enabled !== prevOptions.enabled || nextRefetchInterval !== this.currentRefetchInterval)) {
            this.updateRefetchInterval(nextRefetchInterval);
          }
        };
        _proto.getOptimisticResult = function getOptimisticResult(options) {
          var defaultedOptions = this.client.defaultQueryObserverOptions(options);
          var query = this.client.getQueryCache().build(this.client, defaultedOptions);
          return this.createResult(query, defaultedOptions);
        };
        _proto.getCurrentResult = function getCurrentResult() {
          return this.currentResult;
        };
        _proto.trackResult = function trackResult(result, defaultedOptions) {
          var _this2 = this;
          var trackedResult = {};
          var trackProp = function trackProp2(key) {
            if (!_this2.trackedProps.includes(key)) {
              _this2.trackedProps.push(key);
            }
          };
          Object.keys(result).forEach(function(key) {
            Object.defineProperty(trackedResult, key, {
              configurable: false,
              enumerable: true,
              get: function get() {
                trackProp(key);
                return result[key];
              }
            });
          });
          if (defaultedOptions.useErrorBoundary || defaultedOptions.suspense) {
            trackProp("error");
          }
          return trackedResult;
        };
        _proto.getNextResult = function getNextResult(options) {
          var _this3 = this;
          return new Promise(function(resolve, reject) {
            var unsubscribe = _this3.subscribe(function(result) {
              if (!result.isFetching) {
                unsubscribe();
                if (result.isError && (options == null ? void 0 : options.throwOnError)) {
                  reject(result.error);
                } else {
                  resolve(result);
                }
              }
            });
          });
        };
        _proto.getCurrentQuery = function getCurrentQuery() {
          return this.currentQuery;
        };
        _proto.remove = function remove() {
          this.client.getQueryCache().remove(this.currentQuery);
        };
        _proto.refetch = function refetch(options) {
          return this.fetch(_extends({}, options, {
            meta: {
              refetchPage: options == null ? void 0 : options.refetchPage
            }
          }));
        };
        _proto.fetchOptimistic = function fetchOptimistic(options) {
          var _this4 = this;
          var defaultedOptions = this.client.defaultQueryObserverOptions(options);
          var query = this.client.getQueryCache().build(this.client, defaultedOptions);
          return query.fetch().then(function() {
            return _this4.createResult(query, defaultedOptions);
          });
        };
        _proto.fetch = function fetch2(fetchOptions) {
          var _this5 = this;
          return this.executeFetch(fetchOptions).then(function() {
            _this5.updateResult();
            return _this5.currentResult;
          });
        };
        _proto.executeFetch = function executeFetch(fetchOptions) {
          this.updateQuery();
          var promise = this.currentQuery.fetch(this.options, fetchOptions);
          if (!(fetchOptions == null ? void 0 : fetchOptions.throwOnError)) {
            promise = promise.catch(noop);
          }
          return promise;
        };
        _proto.updateStaleTimeout = function updateStaleTimeout() {
          var _this6 = this;
          this.clearStaleTimeout();
          if (isServer || this.currentResult.isStale || !isValidTimeout(this.options.staleTime)) {
            return;
          }
          var time = timeUntilStale(this.currentResult.dataUpdatedAt, this.options.staleTime);
          var timeout = time + 1;
          this.staleTimeoutId = setTimeout(function() {
            if (!_this6.currentResult.isStale) {
              _this6.updateResult();
            }
          }, timeout);
        };
        _proto.computeRefetchInterval = function computeRefetchInterval() {
          var _this$options$refetch;
          return typeof this.options.refetchInterval === "function" ? this.options.refetchInterval(this.currentResult.data, this.currentQuery) : (_this$options$refetch = this.options.refetchInterval) != null ? _this$options$refetch : false;
        };
        _proto.updateRefetchInterval = function updateRefetchInterval(nextInterval) {
          var _this7 = this;
          this.clearRefetchInterval();
          this.currentRefetchInterval = nextInterval;
          if (isServer || this.options.enabled === false || !isValidTimeout(this.currentRefetchInterval) || this.currentRefetchInterval === 0) {
            return;
          }
          this.refetchIntervalId = setInterval(function() {
            if (_this7.options.refetchIntervalInBackground || focusManager.isFocused()) {
              _this7.executeFetch();
            }
          }, this.currentRefetchInterval);
        };
        _proto.updateTimers = function updateTimers() {
          this.updateStaleTimeout();
          this.updateRefetchInterval(this.computeRefetchInterval());
        };
        _proto.clearTimers = function clearTimers() {
          this.clearStaleTimeout();
          this.clearRefetchInterval();
        };
        _proto.clearStaleTimeout = function clearStaleTimeout() {
          if (this.staleTimeoutId) {
            clearTimeout(this.staleTimeoutId);
            this.staleTimeoutId = void 0;
          }
        };
        _proto.clearRefetchInterval = function clearRefetchInterval() {
          if (this.refetchIntervalId) {
            clearInterval(this.refetchIntervalId);
            this.refetchIntervalId = void 0;
          }
        };
        _proto.createResult = function createResult(query, options) {
          var prevQuery = this.currentQuery;
          var prevOptions = this.options;
          var prevResult = this.currentResult;
          var prevResultState = this.currentResultState;
          var prevResultOptions = this.currentResultOptions;
          var queryChange = query !== prevQuery;
          var queryInitialState = queryChange ? query.state : this.currentQueryInitialState;
          var prevQueryResult = queryChange ? this.currentResult : this.previousQueryResult;
          var state = query.state;
          var dataUpdatedAt = state.dataUpdatedAt, error = state.error, errorUpdatedAt = state.errorUpdatedAt, isFetching = state.isFetching, status = state.status;
          var isPreviousData = false;
          var isPlaceholderData = false;
          var data;
          if (options.optimisticResults) {
            var mounted = this.hasListeners();
            var fetchOnMount = !mounted && shouldFetchOnMount(query, options);
            var fetchOptionally = mounted && shouldFetchOptionally(query, prevQuery, options, prevOptions);
            if (fetchOnMount || fetchOptionally) {
              isFetching = true;
              if (!dataUpdatedAt) {
                status = "loading";
              }
            }
          }
          if (options.keepPreviousData && !state.dataUpdateCount && (prevQueryResult == null ? void 0 : prevQueryResult.isSuccess) && status !== "error") {
            data = prevQueryResult.data;
            dataUpdatedAt = prevQueryResult.dataUpdatedAt;
            status = prevQueryResult.status;
            isPreviousData = true;
          } else if (options.select && typeof state.data !== "undefined") {
            if (prevResult && state.data === (prevResultState == null ? void 0 : prevResultState.data) && options.select === this.selectFn) {
              data = this.selectResult;
            } else {
              try {
                this.selectFn = options.select;
                data = options.select(state.data);
                if (options.structuralSharing !== false) {
                  data = replaceEqualDeep(prevResult == null ? void 0 : prevResult.data, data);
                }
                this.selectResult = data;
                this.selectError = null;
              } catch (selectError) {
                getLogger().error(selectError);
                this.selectError = selectError;
              }
            }
          } else {
            data = state.data;
          }
          if (typeof options.placeholderData !== "undefined" && typeof data === "undefined" && (status === "loading" || status === "idle")) {
            var placeholderData;
            if ((prevResult == null ? void 0 : prevResult.isPlaceholderData) && options.placeholderData === (prevResultOptions == null ? void 0 : prevResultOptions.placeholderData)) {
              placeholderData = prevResult.data;
            } else {
              placeholderData = typeof options.placeholderData === "function" ? options.placeholderData() : options.placeholderData;
              if (options.select && typeof placeholderData !== "undefined") {
                try {
                  placeholderData = options.select(placeholderData);
                  if (options.structuralSharing !== false) {
                    placeholderData = replaceEqualDeep(prevResult == null ? void 0 : prevResult.data, placeholderData);
                  }
                  this.selectError = null;
                } catch (selectError) {
                  getLogger().error(selectError);
                  this.selectError = selectError;
                }
              }
            }
            if (typeof placeholderData !== "undefined") {
              status = "success";
              data = placeholderData;
              isPlaceholderData = true;
            }
          }
          if (this.selectError) {
            error = this.selectError;
            data = this.selectResult;
            errorUpdatedAt = Date.now();
            status = "error";
          }
          var result = {
            status,
            isLoading: status === "loading",
            isSuccess: status === "success",
            isError: status === "error",
            isIdle: status === "idle",
            data,
            dataUpdatedAt,
            error,
            errorUpdatedAt,
            failureCount: state.fetchFailureCount,
            errorUpdateCount: state.errorUpdateCount,
            isFetched: state.dataUpdateCount > 0 || state.errorUpdateCount > 0,
            isFetchedAfterMount: state.dataUpdateCount > queryInitialState.dataUpdateCount || state.errorUpdateCount > queryInitialState.errorUpdateCount,
            isFetching,
            isRefetching: isFetching && status !== "loading",
            isLoadingError: status === "error" && state.dataUpdatedAt === 0,
            isPlaceholderData,
            isPreviousData,
            isRefetchError: status === "error" && state.dataUpdatedAt !== 0,
            isStale: isStale(query, options),
            refetch: this.refetch,
            remove: this.remove
          };
          return result;
        };
        _proto.shouldNotifyListeners = function shouldNotifyListeners(result, prevResult) {
          if (!prevResult) {
            return true;
          }
          var _this$options = this.options, notifyOnChangeProps = _this$options.notifyOnChangeProps, notifyOnChangePropsExclusions = _this$options.notifyOnChangePropsExclusions;
          if (!notifyOnChangeProps && !notifyOnChangePropsExclusions) {
            return true;
          }
          if (notifyOnChangeProps === "tracked" && !this.trackedProps.length) {
            return true;
          }
          var includedProps = notifyOnChangeProps === "tracked" ? this.trackedProps : notifyOnChangeProps;
          return Object.keys(result).some(function(key) {
            var typedKey = key;
            var changed = result[typedKey] !== prevResult[typedKey];
            var isIncluded = includedProps == null ? void 0 : includedProps.some(function(x4) {
              return x4 === key;
            });
            var isExcluded = notifyOnChangePropsExclusions == null ? void 0 : notifyOnChangePropsExclusions.some(function(x4) {
              return x4 === key;
            });
            return changed && !isExcluded && (!includedProps || isIncluded);
          });
        };
        _proto.updateResult = function updateResult(notifyOptions) {
          var prevResult = this.currentResult;
          this.currentResult = this.createResult(this.currentQuery, this.options);
          this.currentResultState = this.currentQuery.state;
          this.currentResultOptions = this.options;
          if (shallowEqualObjects(this.currentResult, prevResult)) {
            return;
          }
          var defaultNotifyOptions = {
            cache: true
          };
          if ((notifyOptions == null ? void 0 : notifyOptions.listeners) !== false && this.shouldNotifyListeners(this.currentResult, prevResult)) {
            defaultNotifyOptions.listeners = true;
          }
          this.notify(_extends({}, defaultNotifyOptions, notifyOptions));
        };
        _proto.updateQuery = function updateQuery() {
          var query = this.client.getQueryCache().build(this.client, this.options);
          if (query === this.currentQuery) {
            return;
          }
          var prevQuery = this.currentQuery;
          this.currentQuery = query;
          this.currentQueryInitialState = query.state;
          this.previousQueryResult = this.currentResult;
          if (this.hasListeners()) {
            prevQuery == null ? void 0 : prevQuery.removeObserver(this);
            query.addObserver(this);
          }
        };
        _proto.onQueryUpdate = function onQueryUpdate(action) {
          var notifyOptions = {};
          if (action.type === "success") {
            notifyOptions.onSuccess = true;
          } else if (action.type === "error" && !isCancelledError(action.error)) {
            notifyOptions.onError = true;
          }
          this.updateResult(notifyOptions);
          if (this.hasListeners()) {
            this.updateTimers();
          }
        };
        _proto.notify = function notify(notifyOptions) {
          var _this8 = this;
          notifyManager.batch(function() {
            if (notifyOptions.onSuccess) {
              _this8.options.onSuccess == null ? void 0 : _this8.options.onSuccess(_this8.currentResult.data);
              _this8.options.onSettled == null ? void 0 : _this8.options.onSettled(_this8.currentResult.data, null);
            } else if (notifyOptions.onError) {
              _this8.options.onError == null ? void 0 : _this8.options.onError(_this8.currentResult.error);
              _this8.options.onSettled == null ? void 0 : _this8.options.onSettled(void 0, _this8.currentResult.error);
            }
            if (notifyOptions.listeners) {
              _this8.listeners.forEach(function(listener) {
                listener(_this8.currentResult);
              });
            }
            if (notifyOptions.cache) {
              _this8.client.getQueryCache().notify({
                query: _this8.currentQuery,
                type: "observerResultsUpdated"
              });
            }
          });
        };
        return QueryObserver2;
      }(Subscribable);
    }
  });

  // node_modules/react-query/es/core/mutationObserver.js
  var MutationObserver;
  var init_mutationObserver = __esm({
    "node_modules/react-query/es/core/mutationObserver.js"() {
      init_extends();
      init_inheritsLoose();
      init_mutation();
      init_notifyManager();
      init_subscribable();
      MutationObserver = /* @__PURE__ */ function(_Subscribable) {
        _inheritsLoose(MutationObserver2, _Subscribable);
        function MutationObserver2(client2, options) {
          var _this;
          _this = _Subscribable.call(this) || this;
          _this.client = client2;
          _this.setOptions(options);
          _this.bindMethods();
          _this.updateResult();
          return _this;
        }
        var _proto = MutationObserver2.prototype;
        _proto.bindMethods = function bindMethods() {
          this.mutate = this.mutate.bind(this);
          this.reset = this.reset.bind(this);
        };
        _proto.setOptions = function setOptions(options) {
          this.options = this.client.defaultMutationOptions(options);
        };
        _proto.onUnsubscribe = function onUnsubscribe() {
          if (!this.listeners.length) {
            var _this$currentMutation;
            (_this$currentMutation = this.currentMutation) == null ? void 0 : _this$currentMutation.removeObserver(this);
          }
        };
        _proto.onMutationUpdate = function onMutationUpdate(action) {
          this.updateResult();
          var notifyOptions = {
            listeners: true
          };
          if (action.type === "success") {
            notifyOptions.onSuccess = true;
          } else if (action.type === "error") {
            notifyOptions.onError = true;
          }
          this.notify(notifyOptions);
        };
        _proto.getCurrentResult = function getCurrentResult() {
          return this.currentResult;
        };
        _proto.reset = function reset() {
          this.currentMutation = void 0;
          this.updateResult();
          this.notify({
            listeners: true
          });
        };
        _proto.mutate = function mutate(variables, options) {
          this.mutateOptions = options;
          if (this.currentMutation) {
            this.currentMutation.removeObserver(this);
          }
          this.currentMutation = this.client.getMutationCache().build(this.client, _extends({}, this.options, {
            variables: typeof variables !== "undefined" ? variables : this.options.variables
          }));
          this.currentMutation.addObserver(this);
          return this.currentMutation.execute();
        };
        _proto.updateResult = function updateResult() {
          var state = this.currentMutation ? this.currentMutation.state : getDefaultState();
          var result = _extends({}, state, {
            isLoading: state.status === "loading",
            isSuccess: state.status === "success",
            isError: state.status === "error",
            isIdle: state.status === "idle",
            mutate: this.mutate,
            reset: this.reset
          });
          this.currentResult = result;
        };
        _proto.notify = function notify(options) {
          var _this2 = this;
          notifyManager.batch(function() {
            if (_this2.mutateOptions) {
              if (options.onSuccess) {
                _this2.mutateOptions.onSuccess == null ? void 0 : _this2.mutateOptions.onSuccess(_this2.currentResult.data, _this2.currentResult.variables, _this2.currentResult.context);
                _this2.mutateOptions.onSettled == null ? void 0 : _this2.mutateOptions.onSettled(_this2.currentResult.data, null, _this2.currentResult.variables, _this2.currentResult.context);
              } else if (options.onError) {
                _this2.mutateOptions.onError == null ? void 0 : _this2.mutateOptions.onError(_this2.currentResult.error, _this2.currentResult.variables, _this2.currentResult.context);
                _this2.mutateOptions.onSettled == null ? void 0 : _this2.mutateOptions.onSettled(void 0, _this2.currentResult.error, _this2.currentResult.variables, _this2.currentResult.context);
              }
            }
            if (options.listeners) {
              _this2.listeners.forEach(function(listener) {
                listener(_this2.currentResult);
              });
            }
          });
        };
        return MutationObserver2;
      }(Subscribable);
    }
  });

  // node_modules/react-query/es/core/types.js
  var init_types = __esm({
    "node_modules/react-query/es/core/types.js"() {
    }
  });

  // node_modules/react-query/es/core/index.js
  var init_core = __esm({
    "node_modules/react-query/es/core/index.js"() {
      init_queryClient();
      init_queryObserver();
      init_logger();
      init_notifyManager();
      init_types();
    }
  });

  // node_modules/preact/compat/dist/compat.module.js
  function g3(n2, t3) {
    for (var e3 in t3)
      n2[e3] = t3[e3];
    return n2;
  }
  function C2(n2, t3) {
    for (var e3 in n2)
      if ("__source" !== e3 && !(e3 in t3))
        return true;
    for (var r4 in t3)
      if ("__source" !== r4 && n2[r4] !== t3[r4])
        return true;
    return false;
  }
  function E(n2, t3) {
    return n2 === t3 && (0 !== n2 || 1 / n2 == 1 / t3) || n2 != n2 && t3 != t3;
  }
  function w3(n2) {
    this.props = n2;
  }
  function R(n2, e3) {
    function r4(n3) {
      var t3 = this.props.ref, r5 = t3 == n3.ref;
      return !r5 && t3 && (t3.call ? t3(null) : t3.current = null), e3 ? !e3(this.props, n3) || !r5 : C2(this.props, n3);
    }
    function u3(e4) {
      return this.shouldComponentUpdate = r4, h(n2, e4);
    }
    return u3.displayName = "Memo(" + (n2.displayName || n2.name) + ")", u3.prototype.isReactComponent = true, u3.__f = true, u3;
  }
  function k3(n2) {
    function t3(t4) {
      var e3 = g3({}, t4);
      return delete e3.ref, n2(e3, t4.ref || null);
    }
    return t3.$$typeof = N2, t3.render = t3, t3.prototype.isReactComponent = t3.__f = true, t3.displayName = "ForwardRef(" + (n2.displayName || n2.name) + ")", t3;
  }
  function L2(n2, t3, e3) {
    return n2 && (n2.__c && n2.__c.__H && (n2.__c.__H.__.forEach(function(n3) {
      "function" == typeof n3.__c && n3.__c();
    }), n2.__c.__H = null), null != (n2 = g3({}, n2)).__c && (n2.__c.__P === e3 && (n2.__c.__P = t3), n2.__c = null), n2.__k = n2.__k && n2.__k.map(function(n3) {
      return L2(n3, t3, e3);
    })), n2;
  }
  function U(n2, t3, e3) {
    return n2 && (n2.__v = null, n2.__k = n2.__k && n2.__k.map(function(n3) {
      return U(n3, t3, e3);
    }), n2.__c && n2.__c.__P === t3 && (n2.__e && e3.insertBefore(n2.__e, n2.__d), n2.__c.__e = true, n2.__c.__P = e3)), n2;
  }
  function D() {
    this.__u = 0, this.t = null, this.__b = null;
  }
  function F2(n2) {
    var t3 = n2.__.__c;
    return t3 && t3.__a && t3.__a(n2);
  }
  function M2(n2) {
    var e3, r4, u3;
    function o3(o4) {
      if (e3 || (e3 = n2()).then(function(n3) {
        r4 = n3.default || n3;
      }, function(n3) {
        u3 = n3;
      }), u3)
        throw u3;
      if (!r4)
        throw e3;
      return h(r4, o4);
    }
    return o3.displayName = "Lazy", o3.__f = true, o3;
  }
  function V2() {
    this.u = null, this.o = null;
  }
  function P2(n2) {
    return this.getChildContext = function() {
      return n2.context;
    }, n2.children;
  }
  function $2(n2) {
    var e3 = this, r4 = n2.i;
    e3.componentWillUnmount = function() {
      P(null, e3.l), e3.l = null, e3.i = null;
    }, e3.i && e3.i !== r4 && e3.componentWillUnmount(), n2.__v ? (e3.l || (e3.i = r4, e3.l = { nodeType: 1, parentNode: r4, childNodes: [], appendChild: function(n3) {
      this.childNodes.push(n3), e3.i.appendChild(n3);
    }, insertBefore: function(n3, t3) {
      this.childNodes.push(n3), e3.i.appendChild(n3);
    }, removeChild: function(n3) {
      this.childNodes.splice(this.childNodes.indexOf(n3) >>> 1, 1), e3.i.removeChild(n3);
    } }), P(h(P2, { context: e3.context }, n2.__v), e3.l)) : e3.l && e3.componentWillUnmount();
  }
  function j3(n2, e3) {
    var r4 = h($2, { __v: n2, i: e3 });
    return r4.containerInfo = e3, r4;
  }
  function Y(n2, t3, e3) {
    return null == t3.__k && (t3.textContent = ""), P(n2, t3), "function" == typeof e3 && e3(), n2 ? n2.__c : null;
  }
  function q3(n2, t3, e3) {
    return S(n2, t3), "function" == typeof e3 && e3(), n2 ? n2.__c : null;
  }
  function J() {
  }
  function K() {
    return this.cancelBubble;
  }
  function Q() {
    return this.defaultPrevented;
  }
  function on2(n2) {
    return h.bind(null, n2);
  }
  function ln(n2) {
    return !!n2 && n2.$$typeof === z3;
  }
  function cn(n2) {
    return ln(n2) ? q.apply(null, arguments) : n2;
  }
  function fn(n2) {
    return !!n2.__k && (P(null, n2), true);
  }
  function an(n2) {
    return n2 && (n2.base || 1 === n2.nodeType && n2) || null;
  }
  function dn(n2) {
    n2();
  }
  function pn(n2) {
    return n2;
  }
  function mn() {
    return [false, dn];
  }
  function _n(n2, t3) {
    var e3 = t3(), r4 = p2({ h: { __: e3, v: t3 } }), u3 = r4[0].h, o3 = r4[1];
    return s2(function() {
      u3.__ = e3, u3.v = t3, E(u3.__, t3()) || o3({ h: u3 });
    }, [n2, e3, t3]), h2(function() {
      return E(u3.__, u3.v()) || o3({ h: u3 }), n2(function() {
        E(u3.__, u3.v()) || o3({ h: u3 });
      });
    }, [n2]), e3;
  }
  var x3, N2, A3, O2, T3, I2, W, z3, B3, H2, Z, G, X, nn, tn, en, rn, sn, hn, vn, yn, bn;
  var init_compat_module = __esm({
    "node_modules/preact/compat/dist/compat.module.js"() {
      init_preact_module();
      init_preact_module();
      init_hooks_module();
      init_hooks_module();
      (w3.prototype = new d()).isPureReactComponent = true, w3.prototype.shouldComponentUpdate = function(n2, t3) {
        return C2(this.props, n2) || C2(this.state, t3);
      };
      x3 = l.__b;
      l.__b = function(n2) {
        n2.type && n2.type.__f && n2.ref && (n2.props.ref = n2.ref, n2.ref = null), x3 && x3(n2);
      };
      N2 = "undefined" != typeof Symbol && Symbol.for && Symbol.for("react.forward_ref") || 3911;
      A3 = function(n2, t3) {
        return null == n2 ? null : x(x(n2).map(t3));
      };
      O2 = { map: A3, forEach: A3, count: function(n2) {
        return n2 ? x(n2).length : 0;
      }, only: function(n2) {
        var t3 = x(n2);
        if (1 !== t3.length)
          throw "Children.only";
        return t3[0];
      }, toArray: x };
      T3 = l.__e;
      l.__e = function(n2, t3, e3, r4) {
        if (n2.then) {
          for (var u3, o3 = t3; o3 = o3.__; )
            if ((u3 = o3.__c) && u3.__c)
              return null == t3.__e && (t3.__e = e3.__e, t3.__k = e3.__k), u3.__c(n2, t3);
        }
        T3(n2, t3, e3, r4);
      };
      I2 = l.unmount;
      l.unmount = function(n2) {
        var t3 = n2.__c;
        t3 && t3.__R && t3.__R(), t3 && true === n2.__h && (n2.type = null), I2 && I2(n2);
      }, (D.prototype = new d()).__c = function(n2, t3) {
        var e3 = t3.__c, r4 = this;
        null == r4.t && (r4.t = []), r4.t.push(e3);
        var u3 = F2(r4.__v), o3 = false, i4 = function() {
          o3 || (o3 = true, e3.__R = null, u3 ? u3(l3) : l3());
        };
        e3.__R = i4;
        var l3 = function() {
          if (!--r4.__u) {
            if (r4.state.__a) {
              var n3 = r4.state.__a;
              r4.__v.__k[0] = U(n3, n3.__c.__P, n3.__c.__O);
            }
            var t4;
            for (r4.setState({ __a: r4.__b = null }); t4 = r4.t.pop(); )
              t4.forceUpdate();
          }
        }, c3 = true === t3.__h;
        r4.__u++ || c3 || r4.setState({ __a: r4.__b = r4.__v.__k[0] }), n2.then(i4, i4);
      }, D.prototype.componentWillUnmount = function() {
        this.t = [];
      }, D.prototype.render = function(n2, e3) {
        if (this.__b) {
          if (this.__v.__k) {
            var r4 = document.createElement("div"), o3 = this.__v.__k[0].__c;
            this.__v.__k[0] = L2(this.__b, r4, o3.__O = o3.__P);
          }
          this.__b = null;
        }
        var i4 = e3.__a && h(p, null, n2.fallback);
        return i4 && (i4.__h = null), [h(p, null, e3.__a ? null : n2.children), i4];
      };
      W = function(n2, t3, e3) {
        if (++e3[1] === e3[0] && n2.o.delete(t3), n2.props.revealOrder && ("t" !== n2.props.revealOrder[0] || !n2.o.size))
          for (e3 = n2.u; e3; ) {
            for (; e3.length > 3; )
              e3.pop()();
            if (e3[1] < e3[0])
              break;
            n2.u = e3 = e3[2];
          }
      };
      (V2.prototype = new d()).__a = function(n2) {
        var t3 = this, e3 = F2(t3.__v), r4 = t3.o.get(n2);
        return r4[0]++, function(u3) {
          var o3 = function() {
            t3.props.revealOrder ? (r4.push(u3), W(t3, n2, r4)) : u3();
          };
          e3 ? e3(o3) : o3();
        };
      }, V2.prototype.render = function(n2) {
        this.u = null, this.o = /* @__PURE__ */ new Map();
        var t3 = x(n2.children);
        n2.revealOrder && "b" === n2.revealOrder[0] && t3.reverse();
        for (var e3 = t3.length; e3--; )
          this.o.set(t3[e3], this.u = [1, 0, this.u]);
        return n2.children;
      }, V2.prototype.componentDidUpdate = V2.prototype.componentDidMount = function() {
        var n2 = this;
        this.o.forEach(function(t3, e3) {
          W(n2, e3, t3);
        });
      };
      z3 = "undefined" != typeof Symbol && Symbol.for && Symbol.for("react.element") || 60103;
      B3 = /^(?:accent|alignment|arabic|baseline|cap|clip(?!PathU)|color|dominant|fill|flood|font|glyph(?!R)|horiz|image|letter|lighting|marker(?!H|W|U)|overline|paint|pointer|shape|stop|strikethrough|stroke|text(?!L)|transform|underline|unicode|units|v|vector|vert|word|writing|x(?!C))[A-Z]/;
      H2 = "undefined" != typeof document;
      Z = function(n2) {
        return ("undefined" != typeof Symbol && "symbol" == typeof Symbol() ? /fil|che|rad/i : /fil|che|ra/i).test(n2);
      };
      d.prototype.isReactComponent = {}, ["componentWillMount", "componentWillReceiveProps", "componentWillUpdate"].forEach(function(t3) {
        Object.defineProperty(d.prototype, t3, { configurable: true, get: function() {
          return this["UNSAFE_" + t3];
        }, set: function(n2) {
          Object.defineProperty(this, t3, { configurable: true, writable: true, value: n2 });
        } });
      });
      G = l.event;
      l.event = function(n2) {
        return G && (n2 = G(n2)), n2.persist = J, n2.isPropagationStopped = K, n2.isDefaultPrevented = Q, n2.nativeEvent = n2;
      };
      nn = { configurable: true, get: function() {
        return this.class;
      } };
      tn = l.vnode;
      l.vnode = function(n2) {
        var t3 = n2.type, e3 = n2.props, u3 = e3;
        if ("string" == typeof t3) {
          var o3 = -1 === t3.indexOf("-");
          for (var i4 in u3 = {}, e3) {
            var l3 = e3[i4];
            H2 && "children" === i4 && "noscript" === t3 || "value" === i4 && "defaultValue" in e3 && null == l3 || ("defaultValue" === i4 && "value" in e3 && null == e3.value ? i4 = "value" : "download" === i4 && true === l3 ? l3 = "" : /ondoubleclick/i.test(i4) ? i4 = "ondblclick" : /^onchange(textarea|input)/i.test(i4 + t3) && !Z(e3.type) ? i4 = "oninput" : /^onfocus$/i.test(i4) ? i4 = "onfocusin" : /^onblur$/i.test(i4) ? i4 = "onfocusout" : /^on(Ani|Tra|Tou|BeforeInp|Compo)/.test(i4) ? i4 = i4.toLowerCase() : o3 && B3.test(i4) ? i4 = i4.replace(/[A-Z0-9]/g, "-$&").toLowerCase() : null === l3 && (l3 = void 0), /^oninput$/i.test(i4) && (i4 = i4.toLowerCase(), u3[i4] && (i4 = "oninputCapture")), u3[i4] = l3);
          }
          "select" == t3 && u3.multiple && Array.isArray(u3.value) && (u3.value = x(e3.children).forEach(function(n3) {
            n3.props.selected = -1 != u3.value.indexOf(n3.props.value);
          })), "select" == t3 && null != u3.defaultValue && (u3.value = x(e3.children).forEach(function(n3) {
            n3.props.selected = u3.multiple ? -1 != u3.defaultValue.indexOf(n3.props.value) : u3.defaultValue == n3.props.value;
          })), n2.props = u3, e3.class != e3.className && (nn.enumerable = "className" in e3, null != e3.className && (u3.class = e3.className), Object.defineProperty(u3, "className", nn));
        }
        n2.$$typeof = z3, tn && tn(n2);
      };
      en = l.__r;
      l.__r = function(n2) {
        en && en(n2), X = n2.__c;
      };
      rn = { ReactCurrentDispatcher: { current: { readContext: function(n2) {
        return X.__n[n2.__c].props.value;
      } } } };
      sn = function(n2, t3) {
        return n2(t3);
      };
      hn = function(n2, t3) {
        return n2(t3);
      };
      vn = p;
      yn = s2;
      bn = { useState: p2, useId: V, useReducer: y2, useEffect: h2, useLayoutEffect: s2, useInsertionEffect: yn, useTransition: mn, useDeferredValue: pn, useSyncExternalStore: _n, startTransition: dn, useRef: _2, useImperativeHandle: A2, useMemo: F, useCallback: T2, useContext: q2, useDebugValue: x2, version: "17.0.2", Children: O2, render: Y, hydrate: q3, unmountComponentAtNode: fn, createPortal: j3, createElement: h, createContext: B, createFactory: on2, cloneElement: cn, createRef: y, Fragment: p, isValidElement: ln, findDOMNode: an, Component: d, PureComponent: w3, memo: R, forwardRef: k3, flushSync: hn, unstable_batchedUpdates: sn, StrictMode: vn, Suspense: D, SuspenseList: V2, lazy: M2, __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: rn };
    }
  });

  // node_modules/react-query/es/react/reactBatchedUpdates.js
  var unstable_batchedUpdates;
  var init_reactBatchedUpdates = __esm({
    "node_modules/react-query/es/react/reactBatchedUpdates.js"() {
      init_compat_module();
      unstable_batchedUpdates = bn.unstable_batchedUpdates;
    }
  });

  // node_modules/react-query/es/react/setBatchUpdatesFn.js
  var init_setBatchUpdatesFn = __esm({
    "node_modules/react-query/es/react/setBatchUpdatesFn.js"() {
      init_core();
      init_reactBatchedUpdates();
      notifyManager.setBatchNotifyFunction(unstable_batchedUpdates);
    }
  });

  // node_modules/react-query/es/react/logger.js
  var logger2;
  var init_logger2 = __esm({
    "node_modules/react-query/es/react/logger.js"() {
      logger2 = console;
    }
  });

  // node_modules/react-query/es/react/setLogger.js
  var init_setLogger = __esm({
    "node_modules/react-query/es/react/setLogger.js"() {
      init_core();
      init_logger2();
      setLogger(logger2);
    }
  });

  // node_modules/react-query/es/react/QueryClientProvider.js
  function getQueryClientContext(contextSharing) {
    if (contextSharing && typeof window !== "undefined") {
      if (!window.ReactQueryClientContext) {
        window.ReactQueryClientContext = defaultContext;
      }
      return window.ReactQueryClientContext;
    }
    return defaultContext;
  }
  var defaultContext, QueryClientSharingContext, useQueryClient, QueryClientProvider;
  var init_QueryClientProvider = __esm({
    "node_modules/react-query/es/react/QueryClientProvider.js"() {
      init_compat_module();
      defaultContext = /* @__PURE__ */ bn.createContext(void 0);
      QueryClientSharingContext = /* @__PURE__ */ bn.createContext(false);
      useQueryClient = function useQueryClient2() {
        var queryClient2 = bn.useContext(getQueryClientContext(bn.useContext(QueryClientSharingContext)));
        if (!queryClient2) {
          throw new Error("No QueryClient set, use QueryClientProvider to set one");
        }
        return queryClient2;
      };
      QueryClientProvider = function QueryClientProvider2(_ref) {
        var client2 = _ref.client, _ref$contextSharing = _ref.contextSharing, contextSharing = _ref$contextSharing === void 0 ? false : _ref$contextSharing, children = _ref.children;
        bn.useEffect(function() {
          client2.mount();
          return function() {
            client2.unmount();
          };
        }, [client2]);
        var Context = getQueryClientContext(contextSharing);
        return /* @__PURE__ */ bn.createElement(QueryClientSharingContext.Provider, {
          value: contextSharing
        }, /* @__PURE__ */ bn.createElement(Context.Provider, {
          value: client2
        }, children));
      };
    }
  });

  // node_modules/react-query/es/react/QueryErrorResetBoundary.js
  function createValue() {
    var _isReset = false;
    return {
      clearReset: function clearReset() {
        _isReset = false;
      },
      reset: function reset() {
        _isReset = true;
      },
      isReset: function isReset() {
        return _isReset;
      }
    };
  }
  var QueryErrorResetBoundaryContext, useQueryErrorResetBoundary;
  var init_QueryErrorResetBoundary = __esm({
    "node_modules/react-query/es/react/QueryErrorResetBoundary.js"() {
      init_compat_module();
      QueryErrorResetBoundaryContext = /* @__PURE__ */ bn.createContext(createValue());
      useQueryErrorResetBoundary = function useQueryErrorResetBoundary2() {
        return bn.useContext(QueryErrorResetBoundaryContext);
      };
    }
  });

  // node_modules/react-query/es/react/utils.js
  function shouldThrowError(suspense, _useErrorBoundary, params) {
    if (typeof _useErrorBoundary === "function") {
      return _useErrorBoundary.apply(void 0, params);
    }
    if (typeof _useErrorBoundary === "boolean")
      return _useErrorBoundary;
    return !!suspense;
  }
  var init_utils2 = __esm({
    "node_modules/react-query/es/react/utils.js"() {
    }
  });

  // node_modules/react-query/es/react/useMutation.js
  function useMutation(arg1, arg2, arg3) {
    var mountedRef = bn.useRef(false);
    var _React$useState = bn.useState(0), forceUpdate = _React$useState[1];
    var options = parseMutationArgs(arg1, arg2, arg3);
    var queryClient2 = useQueryClient();
    var obsRef = bn.useRef();
    if (!obsRef.current) {
      obsRef.current = new MutationObserver(queryClient2, options);
    } else {
      obsRef.current.setOptions(options);
    }
    var currentResult = obsRef.current.getCurrentResult();
    bn.useEffect(function() {
      mountedRef.current = true;
      var unsubscribe = obsRef.current.subscribe(notifyManager.batchCalls(function() {
        if (mountedRef.current) {
          forceUpdate(function(x4) {
            return x4 + 1;
          });
        }
      }));
      return function() {
        mountedRef.current = false;
        unsubscribe();
      };
    }, []);
    var mutate = bn.useCallback(function(variables, mutateOptions) {
      obsRef.current.mutate(variables, mutateOptions).catch(noop);
    }, []);
    if (currentResult.error && shouldThrowError(void 0, obsRef.current.options.useErrorBoundary, [currentResult.error])) {
      throw currentResult.error;
    }
    return _extends({}, currentResult, {
      mutate,
      mutateAsync: currentResult.mutate
    });
  }
  var init_useMutation = __esm({
    "node_modules/react-query/es/react/useMutation.js"() {
      init_extends();
      init_compat_module();
      init_notifyManager();
      init_utils();
      init_mutationObserver();
      init_QueryClientProvider();
      init_utils2();
    }
  });

  // node_modules/react-query/es/react/useBaseQuery.js
  function useBaseQuery(options, Observer) {
    var mountedRef = bn.useRef(false);
    var _React$useState = bn.useState(0), forceUpdate = _React$useState[1];
    var queryClient2 = useQueryClient();
    var errorResetBoundary = useQueryErrorResetBoundary();
    var defaultedOptions = queryClient2.defaultQueryObserverOptions(options);
    defaultedOptions.optimisticResults = true;
    if (defaultedOptions.onError) {
      defaultedOptions.onError = notifyManager.batchCalls(defaultedOptions.onError);
    }
    if (defaultedOptions.onSuccess) {
      defaultedOptions.onSuccess = notifyManager.batchCalls(defaultedOptions.onSuccess);
    }
    if (defaultedOptions.onSettled) {
      defaultedOptions.onSettled = notifyManager.batchCalls(defaultedOptions.onSettled);
    }
    if (defaultedOptions.suspense) {
      if (typeof defaultedOptions.staleTime !== "number") {
        defaultedOptions.staleTime = 1e3;
      }
      if (defaultedOptions.cacheTime === 0) {
        defaultedOptions.cacheTime = 1;
      }
    }
    if (defaultedOptions.suspense || defaultedOptions.useErrorBoundary) {
      if (!errorResetBoundary.isReset()) {
        defaultedOptions.retryOnMount = false;
      }
    }
    var _React$useState2 = bn.useState(function() {
      return new Observer(queryClient2, defaultedOptions);
    }), observer = _React$useState2[0];
    var result = observer.getOptimisticResult(defaultedOptions);
    bn.useEffect(function() {
      mountedRef.current = true;
      errorResetBoundary.clearReset();
      var unsubscribe = observer.subscribe(notifyManager.batchCalls(function() {
        if (mountedRef.current) {
          forceUpdate(function(x4) {
            return x4 + 1;
          });
        }
      }));
      observer.updateResult();
      return function() {
        mountedRef.current = false;
        unsubscribe();
      };
    }, [errorResetBoundary, observer]);
    bn.useEffect(function() {
      observer.setOptions(defaultedOptions, {
        listeners: false
      });
    }, [defaultedOptions, observer]);
    if (defaultedOptions.suspense && result.isLoading) {
      throw observer.fetchOptimistic(defaultedOptions).then(function(_ref) {
        var data = _ref.data;
        defaultedOptions.onSuccess == null ? void 0 : defaultedOptions.onSuccess(data);
        defaultedOptions.onSettled == null ? void 0 : defaultedOptions.onSettled(data, null);
      }).catch(function(error) {
        errorResetBoundary.clearReset();
        defaultedOptions.onError == null ? void 0 : defaultedOptions.onError(error);
        defaultedOptions.onSettled == null ? void 0 : defaultedOptions.onSettled(void 0, error);
      });
    }
    if (result.isError && !errorResetBoundary.isReset() && !result.isFetching && shouldThrowError(defaultedOptions.suspense, defaultedOptions.useErrorBoundary, [result.error, observer.getCurrentQuery()])) {
      throw result.error;
    }
    if (defaultedOptions.notifyOnChangeProps === "tracked") {
      result = observer.trackResult(result, defaultedOptions);
    }
    return result;
  }
  var init_useBaseQuery = __esm({
    "node_modules/react-query/es/react/useBaseQuery.js"() {
      init_compat_module();
      init_notifyManager();
      init_QueryErrorResetBoundary();
      init_QueryClientProvider();
      init_utils2();
    }
  });

  // node_modules/react-query/es/react/useQuery.js
  function useQuery(arg1, arg2, arg3) {
    var parsedOptions = parseQueryArgs(arg1, arg2, arg3);
    return useBaseQuery(parsedOptions, QueryObserver);
  }
  var init_useQuery = __esm({
    "node_modules/react-query/es/react/useQuery.js"() {
      init_core();
      init_utils();
      init_useBaseQuery();
    }
  });

  // node_modules/react-query/es/react/types.js
  var init_types2 = __esm({
    "node_modules/react-query/es/react/types.js"() {
    }
  });

  // node_modules/react-query/es/react/index.js
  var init_react = __esm({
    "node_modules/react-query/es/react/index.js"() {
      init_setBatchUpdatesFn();
      init_setLogger();
      init_QueryClientProvider();
      init_useMutation();
      init_useQuery();
      init_types2();
    }
  });

  // node_modules/react-query/es/index.js
  var init_es = __esm({
    "node_modules/react-query/es/index.js"() {
      init_core();
      init_react();
    }
  });

  // src/views/routes.ts
  var DEFAULT_SIZE, SIZES, getWindowSize;
  var init_routes = __esm({
    "src/views/routes.ts"() {
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

  // node_modules/scheduler/cjs/scheduler.development.js
  var require_scheduler_development = __commonJS({
    "node_modules/scheduler/cjs/scheduler.development.js"(exports) {
      "use strict";
      if (true) {
        (function() {
          "use strict";
          if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ !== "undefined" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart === "function") {
            __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(new Error());
          }
          var enableSchedulerDebugging = false;
          var enableProfiling = false;
          var frameYieldMs = 5;
          function push(heap, node) {
            var index = heap.length;
            heap.push(node);
            siftUp(heap, node, index);
          }
          function peek(heap) {
            return heap.length === 0 ? null : heap[0];
          }
          function pop(heap) {
            if (heap.length === 0) {
              return null;
            }
            var first = heap[0];
            var last = heap.pop();
            if (last !== first) {
              heap[0] = last;
              siftDown(heap, last, 0);
            }
            return first;
          }
          function siftUp(heap, node, i4) {
            var index = i4;
            while (index > 0) {
              var parentIndex = index - 1 >>> 1;
              var parent = heap[parentIndex];
              if (compare(parent, node) > 0) {
                heap[parentIndex] = node;
                heap[index] = parent;
                index = parentIndex;
              } else {
                return;
              }
            }
          }
          function siftDown(heap, node, i4) {
            var index = i4;
            var length = heap.length;
            var halfLength = length >>> 1;
            while (index < halfLength) {
              var leftIndex = (index + 1) * 2 - 1;
              var left = heap[leftIndex];
              var rightIndex = leftIndex + 1;
              var right = heap[rightIndex];
              if (compare(left, node) < 0) {
                if (rightIndex < length && compare(right, left) < 0) {
                  heap[index] = right;
                  heap[rightIndex] = node;
                  index = rightIndex;
                } else {
                  heap[index] = left;
                  heap[leftIndex] = node;
                  index = leftIndex;
                }
              } else if (rightIndex < length && compare(right, node) < 0) {
                heap[index] = right;
                heap[rightIndex] = node;
                index = rightIndex;
              } else {
                return;
              }
            }
          }
          function compare(a4, b3) {
            var diff = a4.sortIndex - b3.sortIndex;
            return diff !== 0 ? diff : a4.id - b3.id;
          }
          var ImmediatePriority = 1;
          var UserBlockingPriority = 2;
          var NormalPriority = 3;
          var LowPriority = 4;
          var IdlePriority = 5;
          function markTaskErrored(task, ms) {
          }
          var hasPerformanceNow = typeof performance === "object" && typeof performance.now === "function";
          if (hasPerformanceNow) {
            var localPerformance = performance;
            exports.unstable_now = function() {
              return localPerformance.now();
            };
          } else {
            var localDate = Date;
            var initialTime = localDate.now();
            exports.unstable_now = function() {
              return localDate.now() - initialTime;
            };
          }
          var maxSigned31BitInt = 1073741823;
          var IMMEDIATE_PRIORITY_TIMEOUT = -1;
          var USER_BLOCKING_PRIORITY_TIMEOUT = 250;
          var NORMAL_PRIORITY_TIMEOUT = 5e3;
          var LOW_PRIORITY_TIMEOUT = 1e4;
          var IDLE_PRIORITY_TIMEOUT = maxSigned31BitInt;
          var taskQueue = [];
          var timerQueue = [];
          var taskIdCounter = 1;
          var currentTask = null;
          var currentPriorityLevel = NormalPriority;
          var isPerformingWork = false;
          var isHostCallbackScheduled = false;
          var isHostTimeoutScheduled = false;
          var localSetTimeout = typeof setTimeout === "function" ? setTimeout : null;
          var localClearTimeout = typeof clearTimeout === "function" ? clearTimeout : null;
          var localSetImmediate = typeof setImmediate !== "undefined" ? setImmediate : null;
          var isInputPending = typeof navigator !== "undefined" && navigator.scheduling !== void 0 && navigator.scheduling.isInputPending !== void 0 ? navigator.scheduling.isInputPending.bind(navigator.scheduling) : null;
          function advanceTimers(currentTime) {
            var timer = peek(timerQueue);
            while (timer !== null) {
              if (timer.callback === null) {
                pop(timerQueue);
              } else if (timer.startTime <= currentTime) {
                pop(timerQueue);
                timer.sortIndex = timer.expirationTime;
                push(taskQueue, timer);
              } else {
                return;
              }
              timer = peek(timerQueue);
            }
          }
          function handleTimeout(currentTime) {
            isHostTimeoutScheduled = false;
            advanceTimers(currentTime);
            if (!isHostCallbackScheduled) {
              if (peek(taskQueue) !== null) {
                isHostCallbackScheduled = true;
                requestHostCallback(flushWork);
              } else {
                var firstTimer = peek(timerQueue);
                if (firstTimer !== null) {
                  requestHostTimeout(handleTimeout, firstTimer.startTime - currentTime);
                }
              }
            }
          }
          function flushWork(hasTimeRemaining, initialTime2) {
            isHostCallbackScheduled = false;
            if (isHostTimeoutScheduled) {
              isHostTimeoutScheduled = false;
              cancelHostTimeout();
            }
            isPerformingWork = true;
            var previousPriorityLevel = currentPriorityLevel;
            try {
              if (enableProfiling) {
                try {
                  return workLoop(hasTimeRemaining, initialTime2);
                } catch (error) {
                  if (currentTask !== null) {
                    var currentTime = exports.unstable_now();
                    markTaskErrored(currentTask, currentTime);
                    currentTask.isQueued = false;
                  }
                  throw error;
                }
              } else {
                return workLoop(hasTimeRemaining, initialTime2);
              }
            } finally {
              currentTask = null;
              currentPriorityLevel = previousPriorityLevel;
              isPerformingWork = false;
            }
          }
          function workLoop(hasTimeRemaining, initialTime2) {
            var currentTime = initialTime2;
            advanceTimers(currentTime);
            currentTask = peek(taskQueue);
            while (currentTask !== null && !enableSchedulerDebugging) {
              if (currentTask.expirationTime > currentTime && (!hasTimeRemaining || shouldYieldToHost())) {
                break;
              }
              var callback = currentTask.callback;
              if (typeof callback === "function") {
                currentTask.callback = null;
                currentPriorityLevel = currentTask.priorityLevel;
                var didUserCallbackTimeout = currentTask.expirationTime <= currentTime;
                var continuationCallback = callback(didUserCallbackTimeout);
                currentTime = exports.unstable_now();
                if (typeof continuationCallback === "function") {
                  currentTask.callback = continuationCallback;
                } else {
                  if (currentTask === peek(taskQueue)) {
                    pop(taskQueue);
                  }
                }
                advanceTimers(currentTime);
              } else {
                pop(taskQueue);
              }
              currentTask = peek(taskQueue);
            }
            if (currentTask !== null) {
              return true;
            } else {
              var firstTimer = peek(timerQueue);
              if (firstTimer !== null) {
                requestHostTimeout(handleTimeout, firstTimer.startTime - currentTime);
              }
              return false;
            }
          }
          function unstable_runWithPriority(priorityLevel, eventHandler) {
            switch (priorityLevel) {
              case ImmediatePriority:
              case UserBlockingPriority:
              case NormalPriority:
              case LowPriority:
              case IdlePriority:
                break;
              default:
                priorityLevel = NormalPriority;
            }
            var previousPriorityLevel = currentPriorityLevel;
            currentPriorityLevel = priorityLevel;
            try {
              return eventHandler();
            } finally {
              currentPriorityLevel = previousPriorityLevel;
            }
          }
          function unstable_next(eventHandler) {
            var priorityLevel;
            switch (currentPriorityLevel) {
              case ImmediatePriority:
              case UserBlockingPriority:
              case NormalPriority:
                priorityLevel = NormalPriority;
                break;
              default:
                priorityLevel = currentPriorityLevel;
                break;
            }
            var previousPriorityLevel = currentPriorityLevel;
            currentPriorityLevel = priorityLevel;
            try {
              return eventHandler();
            } finally {
              currentPriorityLevel = previousPriorityLevel;
            }
          }
          function unstable_wrapCallback(callback) {
            var parentPriorityLevel = currentPriorityLevel;
            return function() {
              var previousPriorityLevel = currentPriorityLevel;
              currentPriorityLevel = parentPriorityLevel;
              try {
                return callback.apply(this, arguments);
              } finally {
                currentPriorityLevel = previousPriorityLevel;
              }
            };
          }
          function unstable_scheduleCallback(priorityLevel, callback, options) {
            var currentTime = exports.unstable_now();
            var startTime2;
            if (typeof options === "object" && options !== null) {
              var delay = options.delay;
              if (typeof delay === "number" && delay > 0) {
                startTime2 = currentTime + delay;
              } else {
                startTime2 = currentTime;
              }
            } else {
              startTime2 = currentTime;
            }
            var timeout;
            switch (priorityLevel) {
              case ImmediatePriority:
                timeout = IMMEDIATE_PRIORITY_TIMEOUT;
                break;
              case UserBlockingPriority:
                timeout = USER_BLOCKING_PRIORITY_TIMEOUT;
                break;
              case IdlePriority:
                timeout = IDLE_PRIORITY_TIMEOUT;
                break;
              case LowPriority:
                timeout = LOW_PRIORITY_TIMEOUT;
                break;
              case NormalPriority:
              default:
                timeout = NORMAL_PRIORITY_TIMEOUT;
                break;
            }
            var expirationTime = startTime2 + timeout;
            var newTask = {
              id: taskIdCounter++,
              callback,
              priorityLevel,
              startTime: startTime2,
              expirationTime,
              sortIndex: -1
            };
            if (startTime2 > currentTime) {
              newTask.sortIndex = startTime2;
              push(timerQueue, newTask);
              if (peek(taskQueue) === null && newTask === peek(timerQueue)) {
                if (isHostTimeoutScheduled) {
                  cancelHostTimeout();
                } else {
                  isHostTimeoutScheduled = true;
                }
                requestHostTimeout(handleTimeout, startTime2 - currentTime);
              }
            } else {
              newTask.sortIndex = expirationTime;
              push(taskQueue, newTask);
              if (!isHostCallbackScheduled && !isPerformingWork) {
                isHostCallbackScheduled = true;
                requestHostCallback(flushWork);
              }
            }
            return newTask;
          }
          function unstable_pauseExecution() {
          }
          function unstable_continueExecution() {
            if (!isHostCallbackScheduled && !isPerformingWork) {
              isHostCallbackScheduled = true;
              requestHostCallback(flushWork);
            }
          }
          function unstable_getFirstCallbackNode() {
            return peek(taskQueue);
          }
          function unstable_cancelCallback(task) {
            task.callback = null;
          }
          function unstable_getCurrentPriorityLevel() {
            return currentPriorityLevel;
          }
          var isMessageLoopRunning = false;
          var scheduledHostCallback = null;
          var taskTimeoutID = -1;
          var frameInterval = frameYieldMs;
          var startTime = -1;
          function shouldYieldToHost() {
            var timeElapsed = exports.unstable_now() - startTime;
            if (timeElapsed < frameInterval) {
              return false;
            }
            return true;
          }
          function requestPaint() {
          }
          function forceFrameRate(fps) {
            if (fps < 0 || fps > 125) {
              console["error"]("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported");
              return;
            }
            if (fps > 0) {
              frameInterval = Math.floor(1e3 / fps);
            } else {
              frameInterval = frameYieldMs;
            }
          }
          var performWorkUntilDeadline = function() {
            if (scheduledHostCallback !== null) {
              var currentTime = exports.unstable_now();
              startTime = currentTime;
              var hasTimeRemaining = true;
              var hasMoreWork = true;
              try {
                hasMoreWork = scheduledHostCallback(hasTimeRemaining, currentTime);
              } finally {
                if (hasMoreWork) {
                  schedulePerformWorkUntilDeadline();
                } else {
                  isMessageLoopRunning = false;
                  scheduledHostCallback = null;
                }
              }
            } else {
              isMessageLoopRunning = false;
            }
          };
          var schedulePerformWorkUntilDeadline;
          if (typeof localSetImmediate === "function") {
            schedulePerformWorkUntilDeadline = function() {
              localSetImmediate(performWorkUntilDeadline);
            };
          } else if (typeof MessageChannel !== "undefined") {
            var channel = new MessageChannel();
            var port = channel.port2;
            channel.port1.onmessage = performWorkUntilDeadline;
            schedulePerformWorkUntilDeadline = function() {
              port.postMessage(null);
            };
          } else {
            schedulePerformWorkUntilDeadline = function() {
              localSetTimeout(performWorkUntilDeadline, 0);
            };
          }
          function requestHostCallback(callback) {
            scheduledHostCallback = callback;
            if (!isMessageLoopRunning) {
              isMessageLoopRunning = true;
              schedulePerformWorkUntilDeadline();
            }
          }
          function requestHostTimeout(callback, ms) {
            taskTimeoutID = localSetTimeout(function() {
              callback(exports.unstable_now());
            }, ms);
          }
          function cancelHostTimeout() {
            localClearTimeout(taskTimeoutID);
            taskTimeoutID = -1;
          }
          var unstable_requestPaint = requestPaint;
          var unstable_Profiling = null;
          exports.unstable_IdlePriority = IdlePriority;
          exports.unstable_ImmediatePriority = ImmediatePriority;
          exports.unstable_LowPriority = LowPriority;
          exports.unstable_NormalPriority = NormalPriority;
          exports.unstable_Profiling = unstable_Profiling;
          exports.unstable_UserBlockingPriority = UserBlockingPriority;
          exports.unstable_cancelCallback = unstable_cancelCallback;
          exports.unstable_continueExecution = unstable_continueExecution;
          exports.unstable_forceFrameRate = forceFrameRate;
          exports.unstable_getCurrentPriorityLevel = unstable_getCurrentPriorityLevel;
          exports.unstable_getFirstCallbackNode = unstable_getFirstCallbackNode;
          exports.unstable_next = unstable_next;
          exports.unstable_pauseExecution = unstable_pauseExecution;
          exports.unstable_requestPaint = unstable_requestPaint;
          exports.unstable_runWithPriority = unstable_runWithPriority;
          exports.unstable_scheduleCallback = unstable_scheduleCallback;
          exports.unstable_shouldYield = shouldYieldToHost;
          exports.unstable_wrapCallback = unstable_wrapCallback;
          if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ !== "undefined" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop === "function") {
            __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(new Error());
          }
        })();
      }
    }
  });

  // node_modules/scheduler/index.js
  var require_scheduler = __commonJS({
    "node_modules/scheduler/index.js"(exports, module) {
      "use strict";
      if (false) {
        module.exports = null;
      } else {
        module.exports = require_scheduler_development();
      }
    }
  });

  // node_modules/use-context-selector/dist/index.modern.mjs
  function E2(r4) {
    const t3 = B({ [d3]: { v: { current: r4 }, n: { current: -1 }, l: /* @__PURE__ */ new Set(), u: (e3) => e3() } });
    var o3;
    return t3[f3] = t3.Provider, t3.Provider = (o3 = t3.Provider, ({ value: e3, children: r5 }) => {
      const t4 = _2(e3), c3 = _2(0), [i4, p4] = p2(null);
      i4 && (i4(e3), p4(null));
      const f4 = _2();
      if (!f4.current) {
        const e4 = /* @__PURE__ */ new Set(), r6 = (r7, t5) => {
          sn(() => {
            c3.current += 1;
            const n2 = { n: c3.current };
            null != t5 && t5.suspense && (n2.n *= -1, n2.p = new Promise((e5) => {
              p4(() => (r8) => {
                n2.v = r8, delete n2.p, e5(r8);
              });
            })), e4.forEach((e5) => e5(n2)), r7();
          });
        };
        f4.current = { [d3]: { v: t4, n: c3, l: e4, u: r6 } };
      }
      return v3(() => {
        t4.current = e3, c3.current += 1, a3(() => {
          f4.current[d3].l.forEach((r6) => {
            r6({ n: c3.current, v: e3 });
          });
        });
      }, [e3]), h(o3, { value: f4.current }, r5);
    }), delete t3.Consumer, t3;
  }
  function h3(e3, n2) {
    const o3 = q2(e3)[d3];
    if ("object" == typeof process && true && !o3)
      throw new Error("useContextSelector requires special context");
    const { v: { current: c3 }, n: { current: u3 }, l: s3 } = o3, i4 = n2(c3), [p4, l3] = y2((e4, r4) => {
      if (!r4)
        return [c3, i4];
      if ("p" in r4)
        throw r4.p;
      if (r4.n === u3)
        return Object.is(e4[1], i4) ? e4 : [c3, i4];
      try {
        if ("v" in r4) {
          if (Object.is(e4[0], r4.v))
            return e4;
          const t3 = n2(r4.v);
          return Object.is(e4[1], t3) ? e4 : [r4.v, t3];
        }
      } catch (e5) {
      }
      return [...e4];
    }, [c3, i4]);
    return Object.is(p4[1], i4) || l3(), v3(() => (s3.add(l3), () => {
      s3.delete(l3);
    }), [s3]), p4[1];
  }
  var import_scheduler, d3, f3, v3, a3;
  var init_index_modern = __esm({
    "node_modules/use-context-selector/dist/index.modern.mjs"() {
      init_compat_module();
      import_scheduler = __toESM(require_scheduler(), 1);
      init_compat_module();
      d3 = Symbol();
      f3 = Symbol();
      v3 = "undefined" == typeof window || /ServerSideRendering/.test(window.navigator && window.navigator.userAgent) ? h2 : s2;
      a3 = import_scheduler.unstable_runWithPriority ? (e3) => (0, import_scheduler.unstable_runWithPriority)(import_scheduler.unstable_NormalPriority, e3) : (e3) => e3();
    }
  });

  // src/tools/createProvider.tsx
  var createProvider;
  var init_createProvider = __esm({
    "src/tools/createProvider.tsx"() {
      "use strict";
      init_preact_module();
      init_hooks_module();
      init_index_modern();
      createProvider = (controller) => {
        const StateContext = E2(null);
        const DispatchContext = B(null);
        const Provider = (_a) => {
          var _b = _a, {
            children
          } = _b, props = __objRest(_b, [
            "children"
          ]);
          const [state, _actions] = controller(props);
          const actionsRef = _2(_actions);
          actionsRef.current = _actions;
          const actions = F(() => {
            const result = {};
            Object.keys(actionsRef.current).map((key) => {
              result[key] = (...args) => {
                var _a2, _b2;
                return (_b2 = (_a2 = actionsRef.current)[key]) == null ? void 0 : _b2.call(_a2, ...args);
              };
            });
            return result;
          }, [actionsRef]);
          return /* @__PURE__ */ h(StateContext.Provider, {
            value: state
          }, /* @__PURE__ */ h(DispatchContext.Provider, {
            value: actions
          }, children));
        };
        const useActions = () => q2(DispatchContext);
        const useStateContext = function(selector) {
          return h3(StateContext, selector);
        };
        return [Provider, useActions, useStateContext];
      };
    }
  });

  // src/state/GlobalState.ts
  var globalState, GlobalState, useGlobalActions, useGlobalState;
  var init_GlobalState = __esm({
    "src/state/GlobalState.ts"() {
      "use strict";
      init_lib();
      init_hooks_module();
      init_routes();
      init_createProvider();
      globalState = {
        actions: void 0
      };
      [GlobalState, useGlobalActions, useGlobalState] = createProvider(
        ({ initialSelection, initialConfig, initialNodes }) => {
          const [allNodes, setAllNodes] = p2(initialNodes);
          const [selection, setSelection] = p2(initialSelection);
          const [route, _setRoute] = p2(["index"]);
          const routeKey = route[0];
          const [config, _setConfig] = p2(initialConfig);
          const [globalError, setGlobalError] = p2(
            void 0
          );
          const [editedKeys, setEditedKeys] = p2({});
          const setEditedKey = (id, key) => {
            setEditedKeys((keys) => __spreadProps(__spreadValues({}, keys), { [id]: key }));
          };
          h2(() => {
            return on("SELECTION_CHANGE", (data2) => {
              setSelection(data2);
            });
          }, []);
          h2(() => {
            return on("DOCUMENT_CHANGE", (data2) => {
              setAllNodes(data2);
            });
          }, []);
          h2(() => {
            return on("CONFIG_CHANGE", (data2) => {
              _setConfig(data2);
            });
          }, []);
          F(() => {
            emit("RESIZE", getWindowSize(routeKey));
          }, [routeKey]);
          function setConfig(config2) {
            _setConfig(config2);
            emit("SETUP", config2);
          }
          function setLanguage(language) {
            _setConfig(__spreadProps(__spreadValues({}, config), { lang: language }));
            emit("SET_LANGUAGE", language);
          }
          function setRoute(...route2) {
            setGlobalError(void 0);
            _setRoute(route2);
          }
          const data = {
            route,
            routeKey,
            allNodes,
            selection,
            config,
            globalError,
            editedKeys
          };
          const actions = {
            setRoute,
            setConfig,
            setLanguage,
            setGlobalError,
            setEditedKey
          };
          globalState.actions = actions;
          return [data, actions];
        }
      );
    }
  });

  // ../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/a19191f2-2277-4736-b4af-b7db317f9b8c/HeadingTab.js
  var HeadingTab_default;
  var init_HeadingTab = __esm({
    "../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/a19191f2-2277-4736-b4af-b7db317f9b8c/HeadingTab.js"() {
      if (document.getElementById("9f88a3c519") === null) {
        const element = document.createElement("style");
        element.id = "9f88a3c519";
        element.textContent = `._container_i57p0_1 {
  cursor: pointer;
  padding: 10px;
}

._container_i57p0_1:hover {
  color: var(--figma-color-text) !important;
}

/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9jb21wb25lbnRzL0hlYWRpbmdUYWIvSGVhZGluZ1RhYi5jc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFDRSxlQUFlO0VBQ2YsYUFBYTtBQUNmOztBQUVBO0VBQ0UseUNBQXlDO0FBQzNDIiwiZmlsZSI6InNyYy9jb21wb25lbnRzL0hlYWRpbmdUYWIvSGVhZGluZ1RhYi5jc3MiLCJzb3VyY2VzQ29udGVudCI6WyIuY29udGFpbmVyIHtcbiAgY3Vyc29yOiBwb2ludGVyO1xuICBwYWRkaW5nOiAxMHB4O1xufVxuXG4uY29udGFpbmVyOmhvdmVyIHtcbiAgY29sb3I6IHZhcigtLWZpZ21hLWNvbG9yLXRleHQpICFpbXBvcnRhbnQ7XG59XG4iXX0= */`;
        document.head.append(element);
      }
      HeadingTab_default = { "container": "_container_i57p0_1" };
    }
  });

  // src/components/HeadingTab/HeadingTab.tsx
  var HeadingTab;
  var init_HeadingTab2 = __esm({
    "src/components/HeadingTab/HeadingTab.tsx"() {
      "use strict";
      init_preact_module();
      init_HeadingTab();
      HeadingTab = ({
        children,
        route,
        currentRoute,
        onChange
      }) => {
        return /* @__PURE__ */ h("div", {
          className: HeadingTab_default.container,
          style: {
            color: route === currentRoute ? "var(--figma-color-text)" : "var(--figma-color-text-secondary)"
          },
          onClick: () => onChange(route)
        }, children);
      };
    }
  });

  // src/icons/SvgIcons.tsx
  var Settings, InsertLink;
  var init_SvgIcons = __esm({
    "src/icons/SvgIcons.tsx"() {
      "use strict";
      init_preact_module();
      Settings = (props) => {
        return /* @__PURE__ */ h("svg", __spreadProps(__spreadValues({}, props), {
          xmlns: "http://www.w3.org/2000/svg",
          viewBox: "0 0 39.150001525878906 40.000003814697266"
        }), /* @__PURE__ */ h("path", {
          fill: "currentColor",
          d: "M34.43 21.95c.08-.64.14-1.29.14-1.95s-.06-1.31-.14-1.95l4.23-3.31c.38-.3.49-.84.24-1.28l-4-6.93c-.25-.43-.77-.61-1.22-.43L28.7 8.11c-1.03-.79-2.16-1.46-3.38-1.97l-.75-5.3c-.09-.47-.5-.84-1-.84h-8c-.5 0-.91.37-.99.84l-.75 5.3a14.8 14.8 0 0 0-3.38 1.97L5.47 6.1a1 1 0 0 0-1.22.43l-4 6.93c-.25.43-.14.97.24 1.28l4.22 3.31c-.08.64-.14 1.29-.14 1.95s.06 1.31.14 1.95L.49 25.26c-.38.3-.49.84-.24 1.28l4 6.93c.25.43.77.61 1.22.43l4.98-2.01c1.03.79 2.16 1.46 3.38 1.97l.75 5.3c.08.47.49.84.99.84h8c.5 0 .91-.37.99-.84l.75-5.3a14.8 14.8 0 0 0 3.38-1.97l4.98 2.01a1 1 0 0 0 1.22-.43l4-6.93c.25-.43.14-.97-.24-1.28l-4.22-3.31zM19.57 27c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"
        }));
      };
      InsertLink = (props) => {
        return /* @__PURE__ */ h("svg", __spreadProps(__spreadValues({}, props), {
          xmlns: "http://www.w3.org/2000/svg",
          viewBox: "0 0 48 48"
        }), /* @__PURE__ */ h("path", {
          fill: "currentColor",
          d: "M7.8 24c0-3.42 2.78-6.2 6.2-6.2h8V14h-8C8.48 14 4 18.48 4 24s4.48 10 10 10h8v-3.8h-8c-3.42 0-6.2-2.78-6.2-6.2zm8.2 2h16v-4H16v4zm18-12h-8v3.8h8c3.42 0 6.2 2.78 6.2 6.2s-2.78 6.2-6.2 6.2h-8V34h8c5.52 0 10-4.48 10-10s-4.48-10-10-10z"
        }));
      };
    }
  });

  // src/client/decodeApiKey.ts
  function readChar(char) {
    const idx = alphabet.indexOf(char);
    if (idx === -1) {
      throw new Error(`Invalid character found: ${char}`);
    }
    return idx;
  }
  function arrayBufferToString(buffer) {
    const bufView = new Uint8Array(buffer);
    const length = bufView.length;
    let result = "";
    let addition = Math.pow(2, 16) - 1;
    for (let i4 = 0; i4 < length; i4 += addition) {
      if (i4 + addition > length) {
        addition = length - i4;
      }
      result += String.fromCharCode.apply(
        null,
        bufView.subarray(i4, i4 + addition)
      );
    }
    return result;
  }
  function base32Decode(input) {
    input = input.toUpperCase();
    const length = input.length;
    let bits = 0;
    let value = 0;
    let index = 0;
    const output = new Uint8Array(length * 5 / 8 | 0);
    for (let i4 = 0; i4 < length; i4++) {
      value = value << 5 | readChar(input[i4]);
      bits += 5;
      if (bits >= 8) {
        output[index++] = value >>> bits - 8 & 255;
        bits -= 8;
      }
    }
    return arrayBufferToString(output.buffer);
  }
  function getProjectIdFromApiKey(key) {
    if (!key) {
      return void 0;
    }
    try {
      const [prefix, rest] = key.split("_");
      if (prefix === "tgpak") {
        const [projectId] = base32Decode(rest).split("_");
        return Number(projectId);
      }
    } catch (e3) {
      console.warn("Tolgee: Api key can't be parsed");
    }
    return void 0;
  }
  var alphabet;
  var init_decodeApiKey = __esm({
    "src/client/decodeApiKey.ts"() {
      "use strict";
      alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    }
  });

  // src/client/client.ts
  async function getResObject(r4) {
    const textBody = await r4.text();
    try {
      return JSON.parse(textBody);
    } catch (e3) {
      return textBody;
    }
  }
  function buildQuery(object) {
    return Object.keys(object).filter((k4) => !!object[k4]).map((k4) => {
      if (Array.isArray(object[k4])) {
        return object[k4].map((v4) => `${encodeURIComponent(k4)}=${encodeURIComponent(v4)}`).join("&");
      }
      return `${encodeURIComponent(k4)}=${encodeURIComponent(object[k4])}`;
    }).join("&");
  }
  async function customFetch(input, options, init) {
    if (!options.apiUrl) {
      throw "Api url not specified";
    }
    if (!options.apiKey) {
      throw "Api key not specified";
    }
    init = init || {};
    init.headers = init.headers || {};
    init.headers = __spreadValues({
      "X-API-Key": options.apiKey
    }, init.headers);
    return fetch(options.apiUrl + input, init).then(async (r4) => {
      if (!r4.ok) {
        const data = await getResObject(r4);
        const message = (data == null ? void 0 : data.message) || (data == null ? void 0 : data.error) || "Error status code from server";
        if (r4.status === 403 && message === "Forbidden") {
          globalState.actions.setGlobalError("Invalid API key");
        }
        throw new Error(message);
      }
      return await getResObject(r4);
    }).catch((e3) => {
      if (!e3.message || e3.message === "Failed to fetch") {
        const message = "Could not connect to server";
        globalState.actions.setGlobalError(message);
        throw message;
      } else {
        throw e3.message;
      }
    });
  }
  async function client(url, method, request, clientOptions, options) {
    var _a, _b;
    const pathParams = (request == null ? void 0 : request.path) || {};
    let urlResult = url;
    const projectId = getProjectIdFromApiKey(options.apiKey);
    if (projectId !== void 0) {
      pathParams.projectId = projectId;
      urlResult = addProjectIdToUrl(urlResult);
    }
    if (pathParams) {
      Object.entries(pathParams).forEach(([key, value]) => {
        urlResult = urlResult.replace(`{${key}}`, value);
      });
    }
    const formData = (_a = request == null ? void 0 : request.content) == null ? void 0 : _a["multipart/form-data"];
    let body;
    if (formData) {
      body = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          let fileName;
          if (Object.prototype.toString.call(value) === "[object File]") {
            fileName = value.name;
          }
          value.forEach((item) => body == null ? void 0 : body.append(key, item, fileName));
          return;
        }
        body == null ? void 0 : body.append(key, value);
      });
    }
    const jsonBody = JSON.stringify((_b = request == null ? void 0 : request.content) == null ? void 0 : _b["application/json"]);
    const queryParams = request == null ? void 0 : request.query;
    let queryString = "";
    const params = flattenParams(queryParams);
    const query = buildQuery(params);
    if (query) {
      queryString = `?${query}`;
    }
    const defaultHeaders = jsonBody ? {
      "Content-Type": "application/json"
    } : {};
    return customFetch(
      urlResult + queryString,
      __spreadValues(__spreadValues({}, options), clientOptions == null ? void 0 : clientOptions.config),
      {
        method,
        body: body || jsonBody,
        headers: defaultHeaders
      }
    );
  }
  var flattenParams, addProjectIdToUrl;
  var init_client = __esm({
    "src/client/client.ts"() {
      "use strict";
      init_decodeApiKey();
      init_GlobalState();
      flattenParams = (params) => {
        if (params) {
          return Object.entries(params).reduce(
            (acc, [key, value]) => Array.isArray(value) || typeof value !== "object" ? __spreadProps(__spreadValues({}, acc), { [key]: value }) : __spreadValues(__spreadValues({}, acc), flattenParams(value)),
            {}
          );
        }
        return {};
      };
      addProjectIdToUrl = (url) => {
        return url.replace("/projects/", "/projects/{projectId}/");
      };
    }
  });

  // src/client/useQueryApi.ts
  var useApiQuery, useApiMutation, matchUrlPrefix, invalidateUrlPrefix;
  var init_useQueryApi = __esm({
    "src/client/useQueryApi.ts"() {
      "use strict";
      init_hooks_module();
      init_es();
      init_GlobalState();
      init_client();
      useApiQuery = (props) => {
        const _a = props, { url, method, options, clientOptions } = _a, request = __objRest(_a, ["url", "method", "options", "clientOptions"]);
        const config = useGlobalState((c3) => c3.config) || {};
        return useQuery(
          [url, request == null ? void 0 : request.path, request == null ? void 0 : request.query],
          () => client(url, method, request, clientOptions, {
            apiKey: config.apiKey,
            apiUrl: config.apiUrl
          }),
          options
        );
      };
      useApiMutation = (props) => {
        const queryClient2 = useQueryClient();
        const { url, method, options, invalidatePrefix, clientOptions } = props;
        const config = useGlobalState((c3) => c3.config) || {};
        const mutation = useMutation(
          (request) => client(url, method, request, clientOptions, config),
          options
        );
        const customOptions = (options2) => __spreadProps(__spreadValues({}, options2), {
          onSuccess: (...args) => {
            var _a;
            if (invalidatePrefix !== void 0) {
              invalidateUrlPrefix(queryClient2, invalidatePrefix);
            }
            (_a = options2 == null ? void 0 : options2.onSuccess) == null ? void 0 : _a.call(options2, ...args);
          }
        });
        const mutate = T2(
          (variables, options2) => {
            return mutation.mutate(variables, customOptions(options2));
          },
          [mutation.mutate]
        );
        const mutateAsync = T2(
          (variables, options2) => {
            return mutation.mutateAsync(variables, customOptions(options2));
          },
          [mutation.mutateAsync]
        );
        return __spreadProps(__spreadValues({}, mutation), { mutate, mutateAsync });
      };
      matchUrlPrefix = (prefix) => {
        return {
          predicate: (query) => {
            var _a;
            return (_a = query.queryKey[0]) == null ? void 0 : _a.startsWith(prefix);
          }
        };
      };
      invalidateUrlPrefix = (queryClient2, prefix) => queryClient2.invalidateQueries(matchUrlPrefix(prefix));
    }
  });

  // src/tools/getConflictingNodes.ts
  var getConflictingNodes;
  var init_getConflictingNodes = __esm({
    "src/tools/getConflictingNodes.ts"() {
      "use strict";
      getConflictingNodes = (nodes) => {
        const conflictingNodes = [];
        nodes.forEach((node) => {
          const conflictingNode = nodes.find((n2) => {
            return n2.key && n2.key === node.key && n2.characters !== node.characters;
          });
          if (conflictingNode) {
            conflictingNodes.push(node);
          }
        });
        return conflictingNodes;
      };
    }
  });

  // ../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/23d0f02b-3889-4bc6-9a91-4672c4ea0e1f/FullPageLoading.js
  var FullPageLoading_default;
  var init_FullPageLoading = __esm({
    "../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/23d0f02b-3889-4bc6-9a91-4672c4ea0e1f/FullPageLoading.js"() {
      if (document.getElementById("7243390d4f") === null) {
        const element = document.createElement("style");
        element.id = "7243390d4f";
        element.textContent = `._container_1kyns_1 {
  display: flex;
  position: fixed;
  align-items: center;
  justify-content: center;
  top: 0px;
  left: 0px;
  right: 0px;
  bottom: 0px;
  z-index: 100;
}

/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9jb21wb25lbnRzL0Z1bGxQYWdlTG9hZGluZy9GdWxsUGFnZUxvYWRpbmcuY3NzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQ0UsYUFBYTtFQUNiLGVBQWU7RUFDZixtQkFBbUI7RUFDbkIsdUJBQXVCO0VBQ3ZCLFFBQVE7RUFDUixTQUFTO0VBQ1QsVUFBVTtFQUNWLFdBQVc7RUFDWCxZQUFZO0FBQ2QiLCJmaWxlIjoic3JjL2NvbXBvbmVudHMvRnVsbFBhZ2VMb2FkaW5nL0Z1bGxQYWdlTG9hZGluZy5jc3MiLCJzb3VyY2VzQ29udGVudCI6WyIuY29udGFpbmVyIHtcbiAgZGlzcGxheTogZmxleDtcbiAgcG9zaXRpb246IGZpeGVkO1xuICBhbGlnbi1pdGVtczogY2VudGVyO1xuICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbiAgdG9wOiAwcHg7XG4gIGxlZnQ6IDBweDtcbiAgcmlnaHQ6IDBweDtcbiAgYm90dG9tOiAwcHg7XG4gIHotaW5kZXg6IDEwMDtcbn1cbiJdfQ== */`;
        document.head.append(element);
      }
      FullPageLoading_default = { "container": "_container_1kyns_1" };
    }
  });

  // src/components/FullPageLoading/FullPageLoading.tsx
  var FullPageLoading;
  var init_FullPageLoading2 = __esm({
    "src/components/FullPageLoading/FullPageLoading.tsx"() {
      "use strict";
      init_lib2();
      init_preact_module();
      init_FullPageLoading();
      FullPageLoading = () => {
        return /* @__PURE__ */ h("div", {
          className: FullPageLoading_default.container
        }, /* @__PURE__ */ h(LoadingIndicator, null));
      };
    }
  });

  // src/tools/getConnectedNodes.ts
  var getConnectedNodes;
  var init_getConnectedNodes = __esm({
    "src/tools/getConnectedNodes.ts"() {
      "use strict";
      getConnectedNodes = (nodes) => {
        return nodes.filter((n2) => n2.key);
      };
    }
  });

  // ../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/8921b98a-a3d0-43d9-be2d-437348e265f1/NodeList.js
  var NodeList_default;
  var init_NodeList = __esm({
    "../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/8921b98a-a3d0-43d9-be2d-437348e265f1/NodeList.js"() {
      if (document.getElementById("2db7c6e287") === null) {
        const element = document.createElement("style");
        element.id = "2db7c6e287";
        element.textContent = `._container_asxc4_1 {
  display: grid;
  gap: 15px 10px;
  grid-template-columns: 2fr 1fr auto;
  align-items: center;
}

._row_text_asxc4_8 {
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

._row_key_asxc4_14 {
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  min-height: 30px;
  display: flex;
  align-items: center;
}

._row_connect_asxc4_23 {
  justify-self: end;
}

._key_present_asxc4_27 {
  color: var(--figma-color-text);
}

._key_missing_asxc4_31 {
  color: var(--figma-color-text-secondary);
}

/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy92aWV3cy9JbmRleC9Ob2RlTGlzdC9Ob2RlTGlzdC5jc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFDRSxhQUFhO0VBQ2IsY0FBYztFQUNkLG1DQUFtQztFQUNuQyxtQkFBbUI7QUFDckI7O0FBRUE7RUFDRSx1QkFBdUI7RUFDdkIsZ0JBQWdCO0VBQ2hCLG1CQUFtQjtBQUNyQjs7QUFFQTtFQUNFLHVCQUF1QjtFQUN2QixnQkFBZ0I7RUFDaEIsbUJBQW1CO0VBQ25CLGdCQUFnQjtFQUNoQixhQUFhO0VBQ2IsbUJBQW1CO0FBQ3JCOztBQUVBO0VBQ0UsaUJBQWlCO0FBQ25COztBQUVBO0VBQ0UsOEJBQThCO0FBQ2hDOztBQUVBO0VBQ0Usd0NBQXdDO0FBQzFDIiwiZmlsZSI6InNyYy92aWV3cy9JbmRleC9Ob2RlTGlzdC9Ob2RlTGlzdC5jc3MiLCJzb3VyY2VzQ29udGVudCI6WyIuY29udGFpbmVyIHtcbiAgZGlzcGxheTogZ3JpZDtcbiAgZ2FwOiAxNXB4IDEwcHg7XG4gIGdyaWQtdGVtcGxhdGUtY29sdW1uczogMmZyIDFmciBhdXRvO1xuICBhbGlnbi1pdGVtczogY2VudGVyO1xufVxuXG4ucm93X3RleHQge1xuICB0ZXh0LW92ZXJmbG93OiBlbGxpcHNpcztcbiAgb3ZlcmZsb3c6IGhpZGRlbjtcbiAgd2hpdGUtc3BhY2U6IG5vd3JhcDtcbn1cblxuLnJvd19rZXkge1xuICB0ZXh0LW92ZXJmbG93OiBlbGxpcHNpcztcbiAgb3ZlcmZsb3c6IGhpZGRlbjtcbiAgd2hpdGUtc3BhY2U6IG5vd3JhcDtcbiAgbWluLWhlaWdodDogMzBweDtcbiAgZGlzcGxheTogZmxleDtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbn1cblxuLnJvd19jb25uZWN0IHtcbiAganVzdGlmeS1zZWxmOiBlbmQ7XG59XG5cbi5rZXlfcHJlc2VudCB7XG4gIGNvbG9yOiB2YXIoLS1maWdtYS1jb2xvci10ZXh0KTtcbn1cblxuLmtleV9taXNzaW5nIHtcbiAgY29sb3I6IHZhcigtLWZpZ21hLWNvbG9yLXRleHQtc2Vjb25kYXJ5KTtcbn1cbiJdfQ== */`;
        document.head.append(element);
      }
      NodeList_default = { "container": "_container_asxc4_1", "row_text": "_row_text_asxc4_8", "row_key": "_row_key_asxc4_14", "row_connect": "_row_connect_asxc4_23", "key_present": "_key_present_asxc4_27", "key_missing": "_key_missing_asxc4_31" };
    }
  });

  // ../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/2b82adfa-ec8b-4f4e-a7fc-0ade63d06746/NodeList.js
  var NodeList_default2;
  var init_NodeList2 = __esm({
    "../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/2b82adfa-ec8b-4f4e-a7fc-0ade63d06746/NodeList.js"() {
      if (document.getElementById("2db7c6e287") === null) {
        const element = document.createElement("style");
        element.id = "2db7c6e287";
        element.textContent = `._container_asxc4_1 {
  display: grid;
  gap: 15px 10px;
  grid-template-columns: 2fr 1fr auto;
  align-items: center;
}

._row_text_asxc4_8 {
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

._row_key_asxc4_14 {
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  min-height: 30px;
  display: flex;
  align-items: center;
}

._row_connect_asxc4_23 {
  justify-self: end;
}

._key_present_asxc4_27 {
  color: var(--figma-color-text);
}

._key_missing_asxc4_31 {
  color: var(--figma-color-text-secondary);
}

/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy92aWV3cy9JbmRleC9Ob2RlTGlzdC9Ob2RlTGlzdC5jc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFDRSxhQUFhO0VBQ2IsY0FBYztFQUNkLG1DQUFtQztFQUNuQyxtQkFBbUI7QUFDckI7O0FBRUE7RUFDRSx1QkFBdUI7RUFDdkIsZ0JBQWdCO0VBQ2hCLG1CQUFtQjtBQUNyQjs7QUFFQTtFQUNFLHVCQUF1QjtFQUN2QixnQkFBZ0I7RUFDaEIsbUJBQW1CO0VBQ25CLGdCQUFnQjtFQUNoQixhQUFhO0VBQ2IsbUJBQW1CO0FBQ3JCOztBQUVBO0VBQ0UsaUJBQWlCO0FBQ25COztBQUVBO0VBQ0UsOEJBQThCO0FBQ2hDOztBQUVBO0VBQ0Usd0NBQXdDO0FBQzFDIiwiZmlsZSI6InNyYy92aWV3cy9JbmRleC9Ob2RlTGlzdC9Ob2RlTGlzdC5jc3MiLCJzb3VyY2VzQ29udGVudCI6WyIuY29udGFpbmVyIHtcbiAgZGlzcGxheTogZ3JpZDtcbiAgZ2FwOiAxNXB4IDEwcHg7XG4gIGdyaWQtdGVtcGxhdGUtY29sdW1uczogMmZyIDFmciBhdXRvO1xuICBhbGlnbi1pdGVtczogY2VudGVyO1xufVxuXG4ucm93X3RleHQge1xuICB0ZXh0LW92ZXJmbG93OiBlbGxpcHNpcztcbiAgb3ZlcmZsb3c6IGhpZGRlbjtcbiAgd2hpdGUtc3BhY2U6IG5vd3JhcDtcbn1cblxuLnJvd19rZXkge1xuICB0ZXh0LW92ZXJmbG93OiBlbGxpcHNpcztcbiAgb3ZlcmZsb3c6IGhpZGRlbjtcbiAgd2hpdGUtc3BhY2U6IG5vd3JhcDtcbiAgbWluLWhlaWdodDogMzBweDtcbiAgZGlzcGxheTogZmxleDtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbn1cblxuLnJvd19jb25uZWN0IHtcbiAganVzdGlmeS1zZWxmOiBlbmQ7XG59XG5cbi5rZXlfcHJlc2VudCB7XG4gIGNvbG9yOiB2YXIoLS1maWdtYS1jb2xvci10ZXh0KTtcbn1cblxuLmtleV9taXNzaW5nIHtcbiAgY29sb3I6IHZhcigtLWZpZ21hLWNvbG9yLXRleHQtc2Vjb25kYXJ5KTtcbn1cbiJdfQ== */`;
        document.head.append(element);
      }
      NodeList_default2 = { "container": "_container_asxc4_1", "row_text": "_row_text_asxc4_8", "row_key": "_row_key_asxc4_14", "row_connect": "_row_connect_asxc4_23", "key_present": "_key_present_asxc4_27", "key_missing": "_key_missing_asxc4_31" };
    }
  });

  // src/views/Index/NodeList/NodeRow.tsx
  var NodeRow;
  var init_NodeRow = __esm({
    "src/views/Index/NodeList/NodeRow.tsx"() {
      "use strict";
      init_preact_module();
      init_lib2();
      init_lib();
      init_GlobalState();
      init_SvgIcons();
      init_NodeList2();
      NodeRow = ({ node }) => {
        const { setEditedKey } = useGlobalActions();
        const editedKeyText = useGlobalState((c3) => c3.editedKeys[node.id] || "");
        const handleConnect = () => {
          emit(
            "SET_NODE_CONNECTION",
            node.id,
            editedKeyText
          );
        };
        const handleNodeDisconnect = () => {
          setEditedKey(node.id, "");
          emit("SET_NODE_CONNECTION", node.id, "");
        };
        return /* @__PURE__ */ h(p, {
          key: node.id
        }, /* @__PURE__ */ h("div", {
          className: NodeList_default2.row_text
        }, node.characters), /* @__PURE__ */ h("div", {
          className: NodeList_default2.row_key
        }, node.key ? node.key : /* @__PURE__ */ h(Textbox, {
          variant: "border",
          placeholder: "No key connected",
          value: editedKeyText,
          onChange: (e3) => setEditedKey(node.id, e3.target.value)
        })), node.key ? /* @__PURE__ */ h("div", {
          className: NodeList_default2.row_connect,
          title: "Disconnect"
        }, /* @__PURE__ */ h(Button, {
          secondary: true,
          onClick: handleNodeDisconnect,
          className: NodeList_default2.key_present
        }, /* @__PURE__ */ h(InsertLink, {
          width: 16,
          height: 16
        }))) : /* @__PURE__ */ h("div", {
          className: NodeList_default2.row_connect,
          title: "Connect to a key"
        }, /* @__PURE__ */ h(Button, {
          secondary: true,
          onClick: handleConnect,
          className: NodeList_default2.key_missing,
          disabled: !editedKeyText
        }, /* @__PURE__ */ h(InsertLink, {
          width: 16,
          height: 16
        }))));
      };
    }
  });

  // src/views/Index/NodeList/NodeList.tsx
  var NodeList;
  var init_NodeList3 = __esm({
    "src/views/Index/NodeList/NodeList.tsx"() {
      "use strict";
      init_preact_module();
      init_NodeList();
      init_NodeRow();
      NodeList = ({ nodes }) => {
        return /* @__PURE__ */ h("div", {
          className: NodeList_default.container
        }, nodes == null ? void 0 : nodes.map((node) => /* @__PURE__ */ h(NodeRow, {
          key: node.id,
          node
        })));
      };
    }
  });

  // ../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/1dba6097-75b6-4c1a-a190-75c82ca0a9da/TopBar.js
  var TopBar_default;
  var init_TopBar = __esm({
    "../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/1dba6097-75b6-4c1a-a190-75c82ca0a9da/TopBar.js"() {
      if (document.getElementById("95c796cc53") === null) {
        const element = document.createElement("style");
        element.id = "95c796cc53";
        element.textContent = `._container_nex47_1 {
  display: flex;
  justify-content: space-between;
  margin: 0px -10px;
}

._tabsContainerLeft_nex47_7 {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 16px;
}

._tabsContainerRight_nex47_14 {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 16px;
}

._tabsBackButton_nex47_21 {
  padding: 0px 10px;
  padding-right: 0px;
  cursor: pointer;
  margin-right: -16px;
}

/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy92aWV3cy9JbmRleC9Ub3BCYXIvVG9wQmFyLmNzcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUNFLGFBQWE7RUFDYiw4QkFBOEI7RUFDOUIsaUJBQWlCO0FBQ25COztBQUVBO0VBQ0UsYUFBYTtFQUNiLDJCQUEyQjtFQUMzQixtQkFBbUI7RUFDbkIsU0FBUztBQUNYOztBQUVBO0VBQ0UsYUFBYTtFQUNiLHlCQUF5QjtFQUN6QixtQkFBbUI7RUFDbkIsU0FBUztBQUNYOztBQUVBO0VBQ0UsaUJBQWlCO0VBQ2pCLGtCQUFrQjtFQUNsQixlQUFlO0VBQ2YsbUJBQW1CO0FBQ3JCIiwiZmlsZSI6InNyYy92aWV3cy9JbmRleC9Ub3BCYXIvVG9wQmFyLmNzcyIsInNvdXJjZXNDb250ZW50IjpbIi5jb250YWluZXIge1xuICBkaXNwbGF5OiBmbGV4O1xuICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XG4gIG1hcmdpbjogMHB4IC0xMHB4O1xufVxuXG4udGFic0NvbnRhaW5lckxlZnQge1xuICBkaXNwbGF5OiBmbGV4O1xuICBqdXN0aWZ5LWNvbnRlbnQ6IGZsZXgtc3RhcnQ7XG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gIGdhcDogMTZweDtcbn1cblxuLnRhYnNDb250YWluZXJSaWdodCB7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGp1c3RpZnktY29udGVudDogZmxleC1lbmQ7XG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gIGdhcDogMTZweDtcbn1cblxuLnRhYnNCYWNrQnV0dG9uIHtcbiAgcGFkZGluZzogMHB4IDEwcHg7XG4gIHBhZGRpbmctcmlnaHQ6IDBweDtcbiAgY3Vyc29yOiBwb2ludGVyO1xuICBtYXJnaW4tcmlnaHQ6IC0xNnB4O1xufVxuIl19 */`;
        document.head.append(element);
      }
      TopBar_default = { "container": "_container_nex47_1", "tabsContainerLeft": "_tabsContainerLeft_nex47_7", "tabsContainerRight": "_tabsContainerRight_nex47_14", "tabsBackButton": "_tabsBackButton_nex47_21" };
    }
  });

  // src/views/Index/TopBar/TopBar.tsx
  var TopBar;
  var init_TopBar2 = __esm({
    "src/views/Index/TopBar/TopBar.tsx"() {
      "use strict";
      init_lib2();
      init_preact_module();
      init_TopBar();
      TopBar = ({ leftPart, rightPart, onBack }) => {
        return /* @__PURE__ */ h("div", {
          className: TopBar_default.container
        }, /* @__PURE__ */ h("div", {
          className: TopBar_default.tabsContainerLeft
        }, onBack && /* @__PURE__ */ h("div", {
          className: TopBar_default.tabsBackButton,
          onClick: onBack
        }, /* @__PURE__ */ h(IconChevronLeft32, null)), leftPart), /* @__PURE__ */ h("div", {
          className: TopBar_default.tabsContainerRight
        }, rightPart));
      };
    }
  });

  // ../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/5a88cbcf-8ffa-419e-bbb5-4bc3b00813ee/Index.js
  var Index_default;
  var init_Index = __esm({
    "../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/5a88cbcf-8ffa-419e-bbb5-4bc3b00813ee/Index.js"() {
      if (document.getElementById("669bb52146") === null) {
        const element = document.createElement("style");
        element.id = "669bb52146";
        element.textContent = `._languageContainer_1iknn_1 {
  display: flex;
  margin: 5px 0px;
}

/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy92aWV3cy9JbmRleC9JbmRleC5jc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFDRSxhQUFhO0VBQ2IsZUFBZTtBQUNqQiIsImZpbGUiOiJzcmMvdmlld3MvSW5kZXgvSW5kZXguY3NzIiwic291cmNlc0NvbnRlbnQiOlsiLmxhbmd1YWdlQ29udGFpbmVyIHtcbiAgZGlzcGxheTogZmxleDtcbiAgbWFyZ2luOiA1cHggMHB4O1xufVxuIl19 */`;
        document.head.append(element);
      }
      Index_default = { "languageContainer": "_languageContainer_1iknn_1" };
    }
  });

  // src/views/Index/Index.tsx
  var Index;
  var init_Index2 = __esm({
    "src/views/Index/Index.tsx"() {
      "use strict";
      init_preact_module();
      init_hooks_module();
      init_lib2();
      init_HeadingTab2();
      init_SvgIcons();
      init_useQueryApi();
      init_getConflictingNodes();
      init_FullPageLoading2();
      init_getConnectedNodes();
      init_GlobalState();
      init_NodeList3();
      init_TopBar2();
      init_Index();
      Index = () => {
        var _a, _b;
        const selection = useGlobalState((c3) => c3.selection);
        const allNodes = useGlobalState((c3) => c3.allNodes);
        const [error, setError] = p2();
        const { data: languageData, isLoading } = useApiQuery({
          url: "/v2/projects/languages",
          method: "get"
        });
        const languages = (_a = languageData == null ? void 0 : languageData._embedded) == null ? void 0 : _a.languages;
        const language = useGlobalState((c3) => {
          var _a2;
          return (_a2 = c3.config) == null ? void 0 : _a2.lang;
        }) || ((_b = languages == null ? void 0 : languages[0]) == null ? void 0 : _b.tag) || "";
        const { setRoute } = useGlobalActions();
        const routeKey = useGlobalState((c3) => c3.routeKey);
        const nothingSelected = selection.length === 0;
        const handleLanguageChange = (lang) => {
          if (lang !== language) {
            setRoute("pull", { lang });
          }
        };
        const handlePush = () => {
          const conflicts = getConflictingNodes(selection);
          if (conflicts.length > 0) {
            setError("There are conflicting nodes");
          } else {
            setRoute("push", {
              nodes: getConnectedNodes(nothingSelected ? allNodes : selection)
            });
          }
        };
        const handlePull = () => {
          setRoute("pull", {
            nodes: nothingSelected ? void 0 : getConnectedNodes(selection),
            lang: language
          });
        };
        h2(() => {
          setError(void 0);
        }, [selection]);
        if (isLoading) {
          return /* @__PURE__ */ h(FullPageLoading, null);
        }
        return /* @__PURE__ */ h(p, null, /* @__PURE__ */ h(Container, {
          space: "medium"
        }, /* @__PURE__ */ h(TopBar, {
          leftPart: /* @__PURE__ */ h(p, null, /* @__PURE__ */ h("div", {
            className: Index_default.languageContainer
          }, languages && /* @__PURE__ */ h("select", {
            value: language,
            placeholder: "Language",
            onChange: (e3) => {
              handleLanguageChange(
                e3.target.value
              );
            }
          }, languages.map((l3) => /* @__PURE__ */ h("option", {
            key: l3.tag,
            value: l3.tag
          }, l3.name)))), /* @__PURE__ */ h(Button, {
            onClick: handlePush
          }, nothingSelected ? "Push all" : "Push"), /* @__PURE__ */ h(Button, {
            onClick: handlePull,
            secondary: true
          }, nothingSelected ? "Pull all" : "Pull")),
          rightPart: /* @__PURE__ */ h(HeadingTab, {
            route: "settings",
            currentRoute: routeKey,
            onChange: () => setRoute("settings")
          }, /* @__PURE__ */ h(Settings, {
            width: 15,
            height: 15
          }))
        })), /* @__PURE__ */ h(Divider, null), /* @__PURE__ */ h(VerticalSpace, {
          space: "large"
        }), /* @__PURE__ */ h(Container, {
          space: "medium"
        }, error && /* @__PURE__ */ h(p, null, /* @__PURE__ */ h(Banner, {
          icon: /* @__PURE__ */ h(IconWarning32, null),
          style: { cursor: "pointer" },
          onClick: () => setError(void 0)
        }, error), /* @__PURE__ */ h(VerticalSpace, {
          space: "large"
        })), nothingSelected ? /* @__PURE__ */ h(Text, null, "No nodes selected") : /* @__PURE__ */ h(NodeList, {
          nodes: selection
        })));
      };
    }
  });

  // ../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/d4cceb20-0c74-485b-9ed3-400b4bb73429/ActionsBottom.js
  var ActionsBottom_default;
  var init_ActionsBottom = __esm({
    "../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/d4cceb20-0c74-485b-9ed3-400b4bb73429/ActionsBottom.js"() {
      if (document.getElementById("478d96ba2f") === null) {
        const element = document.createElement("style");
        element.id = "478d96ba2f";
        element.textContent = `._container_ixco1_1 {
  position: fixed;
  bottom: 0px;
  right: 0px;
  left: 0px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  background-color: var(--figma-color-bg);
}

._actions_ixco1_12 {
  display: flex;
  gap: 8px;
  padding: 8px 12px;
}

._placeHolder_ixco1_18 {
  height: 70px;
}

/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9jb21wb25lbnRzL0FjdGlvbnNCb3R0b20vQWN0aW9uc0JvdHRvbS5jc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFDRSxlQUFlO0VBQ2YsV0FBVztFQUNYLFVBQVU7RUFDVixTQUFTO0VBQ1QsYUFBYTtFQUNiLHNCQUFzQjtFQUN0QixxQkFBcUI7RUFDckIsdUNBQXVDO0FBQ3pDOztBQUVBO0VBQ0UsYUFBYTtFQUNiLFFBQVE7RUFDUixpQkFBaUI7QUFDbkI7O0FBRUE7RUFDRSxZQUFZO0FBQ2QiLCJmaWxlIjoic3JjL2NvbXBvbmVudHMvQWN0aW9uc0JvdHRvbS9BY3Rpb25zQm90dG9tLmNzcyIsInNvdXJjZXNDb250ZW50IjpbIi5jb250YWluZXIge1xuICBwb3NpdGlvbjogZml4ZWQ7XG4gIGJvdHRvbTogMHB4O1xuICByaWdodDogMHB4O1xuICBsZWZ0OiAwcHg7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG4gIGFsaWduLWl0ZW1zOiBmbGV4LWVuZDtcbiAgYmFja2dyb3VuZC1jb2xvcjogdmFyKC0tZmlnbWEtY29sb3ItYmcpO1xufVxuXG4uYWN0aW9ucyB7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGdhcDogOHB4O1xuICBwYWRkaW5nOiA4cHggMTJweDtcbn1cblxuLnBsYWNlSG9sZGVyIHtcbiAgaGVpZ2h0OiA3MHB4O1xufVxuIl19 */`;
        document.head.append(element);
      }
      ActionsBottom_default = { "container": "_container_ixco1_1", "actions": "_actions_ixco1_12", "placeHolder": "_placeHolder_ixco1_18" };
    }
  });

  // src/components/ActionsBottom/ActionsBottom.tsx
  var ActionsBottom;
  var init_ActionsBottom2 = __esm({
    "src/components/ActionsBottom/ActionsBottom.tsx"() {
      "use strict";
      init_lib2();
      init_preact_module();
      init_ActionsBottom();
      ActionsBottom = ({ children }) => {
        return /* @__PURE__ */ h(p, null, /* @__PURE__ */ h("div", {
          className: ActionsBottom_default.placeHolder
        }), /* @__PURE__ */ h("div", {
          className: ActionsBottom_default.container
        }, /* @__PURE__ */ h(Divider, null), /* @__PURE__ */ h("div", {
          className: ActionsBottom_default.actions
        }, children)));
      };
    }
  });

  // src/views/Settings/Settings.tsx
  var DEFAULT_TOLGEE_URL, Settings2;
  var init_Settings = __esm({
    "src/views/Settings/Settings.tsx"() {
      "use strict";
      init_preact_module();
      init_hooks_module();
      init_lib2();
      init_GlobalState();
      init_useQueryApi();
      init_ActionsBottom2();
      DEFAULT_TOLGEE_URL = "https://app.tolgee.io";
      Settings2 = () => {
        var _a;
        const config = useGlobalState((c3) => c3.config) || {};
        const [tolgeeConfig, setTolgeeConfig] = p2(config != null ? config : {});
        const { mutateAsync, isLoading } = useApiMutation({
          url: "/v2/api-keys/current",
          method: "get",
          clientOptions: {
            config: {
              apiKey: tolgeeConfig.apiKey,
              apiUrl: tolgeeConfig.apiUrl
            }
          }
        });
        const { setRoute, setConfig } = useGlobalActions();
        const [error, setError] = p2();
        h2(() => {
          setError(void 0);
        }, [tolgeeConfig]);
        const validateTolgeeCredentials = async () => {
          var _a2;
          try {
            const res = await mutateAsync("/v2/api-keys/current");
            if (res && ((_a2 = res.scopes) == null ? void 0 : _a2.includes("translations.view"))) {
              return true;
            }
            throw new Error(
              "Missing token scopes. The token should have translations.view and translations.edit scopes."
            );
          } catch (e3) {
            if (e3 === "Forbidden") {
              throw new Error("Invalid API key");
            }
            throw e3;
          }
        };
        const handleSubmit = async () => {
          try {
            await validateTolgeeCredentials();
            setConfig(tolgeeConfig);
            setRoute("index");
          } catch (e3) {
            setError(e3.message || e3);
          }
        };
        const handleClose = T2(() => {
          setRoute("index");
        }, []);
        return /* @__PURE__ */ h(Container, {
          space: "medium"
        }, /* @__PURE__ */ h(VerticalSpace, {
          space: "large"
        }), /* @__PURE__ */ h(Text, null, /* @__PURE__ */ h(Muted, null, "Tolgee URL")), /* @__PURE__ */ h(VerticalSpace, {
          space: "small"
        }), /* @__PURE__ */ h(Textbox, {
          onValueInput: (apiUrl) => setTolgeeConfig(__spreadProps(__spreadValues({}, tolgeeConfig), { apiUrl })),
          value: tolgeeConfig.apiUrl || DEFAULT_TOLGEE_URL,
          variant: "border"
        }), /* @__PURE__ */ h(VerticalSpace, {
          space: "medium"
        }), /* @__PURE__ */ h(Text, null, /* @__PURE__ */ h(Muted, null, "Tolgee API key")), /* @__PURE__ */ h(VerticalSpace, {
          space: "small"
        }), /* @__PURE__ */ h(Textbox, {
          onValueInput: (apiKey) => setTolgeeConfig(__spreadProps(__spreadValues({}, tolgeeConfig), { apiKey })),
          value: (_a = tolgeeConfig.apiKey) != null ? _a : "",
          variant: "border"
        }), /* @__PURE__ */ h(VerticalSpace, {
          space: "medium"
        }), isLoading ? /* @__PURE__ */ h(LoadingIndicator, null) : error ? /* @__PURE__ */ h(Banner, {
          icon: /* @__PURE__ */ h(IconWarning32, null)
        }, error) : null, /* @__PURE__ */ h(VerticalSpace, {
          space: "extraLarge"
        }), !isLoading && /* @__PURE__ */ h(ActionsBottom, null, /* @__PURE__ */ h(Button, {
          onClick: handleClose,
          secondary: true
        }, "Close"), /* @__PURE__ */ h(Button, {
          onClick: handleSubmit
        }, "Save")), /* @__PURE__ */ h(VerticalSpace, {
          space: "small"
        }));
      };
    }
  });

  // src/tools/getChanges.ts
  var getChanges;
  var init_getChanges = __esm({
    "src/tools/getChanges.ts"() {
      "use strict";
      getChanges = (nodes, translations, language) => {
        const newKeys = [];
        const changedKeys = [];
        nodes.forEach((node) => {
          var _a;
          const translation = translations.find((t3) => t3.keyName === node.key);
          const change = {
            key: node.key,
            oldValue: (_a = translation == null ? void 0 : translation.translations[language]) == null ? void 0 : _a.text,
            newValue: node.characters
          };
          if (!change.oldValue) {
            newKeys.push(change);
          } else if (change.oldValue !== change.newValue) {
            changedKeys.push(change);
          }
        });
        return { newKeys, changedKeys };
      };
    }
  });

  // node_modules/clsx/dist/clsx.m.js
  function r3(e3) {
    var t3, f4, n2 = "";
    if ("string" == typeof e3 || "number" == typeof e3)
      n2 += e3;
    else if ("object" == typeof e3)
      if (Array.isArray(e3))
        for (t3 = 0; t3 < e3.length; t3++)
          e3[t3] && (f4 = r3(e3[t3])) && (n2 && (n2 += " "), n2 += f4);
      else
        for (t3 in e3)
          e3[t3] && (n2 && (n2 += " "), n2 += t3);
    return n2;
  }
  function clsx() {
    for (var e3, t3, f4 = 0, n2 = ""; f4 < arguments.length; )
      (e3 = arguments[f4++]) && (t3 = r3(e3)) && (n2 && (n2 += " "), n2 += t3);
    return n2;
  }
  var clsx_m_default;
  var init_clsx_m = __esm({
    "node_modules/clsx/dist/clsx.m.js"() {
      clsx_m_default = clsx;
    }
  });

  // ../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/a7fb9c0b-34f8-44b8-af9a-d8be373c1cc6/Changes.js
  var Changes_default;
  var init_Changes = __esm({
    "../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/a7fb9c0b-34f8-44b8-af9a-d8be373c1cc6/Changes.js"() {
      if (document.getElementById("e98714786e") === null) {
        const element = document.createElement("style");
        element.id = "e98714786e";
        element.textContent = `._sectionTitle_yvuyu_1 {
  margin-bottom: -3px;
  margin-top: 10px;
  font-size: 12px;
}

._new_yvuyu_7 {
  color: var(--figma-color-text-success);
}

._change_yvuyu_11 {
  color: var(--figma-color-text-warning);
}

._container_yvuyu_15 {
  margin-top: -10px;
  display: grid;
  gap: 10px 10px;
  grid-template-columns: auto 1fr;
  align-items: center;
}

._rowText_yvuyu_23 {
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

._rowKey_yvuyu_29 {
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  display: flex;
  align-items: center;
}

._spanAll_yvuyu_37 {
  grid-column: 1 / -1;
}

/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy92aWV3cy9QdXNoL0NoYW5nZXMuY3NzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQ0UsbUJBQW1CO0VBQ25CLGdCQUFnQjtFQUNoQixlQUFlO0FBQ2pCOztBQUVBO0VBQ0Usc0NBQXNDO0FBQ3hDOztBQUVBO0VBQ0Usc0NBQXNDO0FBQ3hDOztBQUVBO0VBQ0UsaUJBQWlCO0VBQ2pCLGFBQWE7RUFDYixjQUFjO0VBQ2QsK0JBQStCO0VBQy9CLG1CQUFtQjtBQUNyQjs7QUFFQTtFQUNFLHVCQUF1QjtFQUN2QixnQkFBZ0I7RUFDaEIsbUJBQW1CO0FBQ3JCOztBQUVBO0VBQ0UsdUJBQXVCO0VBQ3ZCLGdCQUFnQjtFQUNoQixtQkFBbUI7RUFDbkIsYUFBYTtFQUNiLG1CQUFtQjtBQUNyQjs7QUFFQTtFQUNFLG1CQUFtQjtBQUNyQiIsImZpbGUiOiJzcmMvdmlld3MvUHVzaC9DaGFuZ2VzLmNzcyIsInNvdXJjZXNDb250ZW50IjpbIi5zZWN0aW9uVGl0bGUge1xuICBtYXJnaW4tYm90dG9tOiAtM3B4O1xuICBtYXJnaW4tdG9wOiAxMHB4O1xuICBmb250LXNpemU6IDEycHg7XG59XG5cbi5uZXcge1xuICBjb2xvcjogdmFyKC0tZmlnbWEtY29sb3ItdGV4dC1zdWNjZXNzKTtcbn1cblxuLmNoYW5nZSB7XG4gIGNvbG9yOiB2YXIoLS1maWdtYS1jb2xvci10ZXh0LXdhcm5pbmcpO1xufVxuXG4uY29udGFpbmVyIHtcbiAgbWFyZ2luLXRvcDogLTEwcHg7XG4gIGRpc3BsYXk6IGdyaWQ7XG4gIGdhcDogMTBweCAxMHB4O1xuICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IGF1dG8gMWZyO1xuICBhbGlnbi1pdGVtczogY2VudGVyO1xufVxuXG4ucm93VGV4dCB7XG4gIHRleHQtb3ZlcmZsb3c6IGVsbGlwc2lzO1xuICBvdmVyZmxvdzogaGlkZGVuO1xuICB3aGl0ZS1zcGFjZTogbm93cmFwO1xufVxuXG4ucm93S2V5IHtcbiAgdGV4dC1vdmVyZmxvdzogZWxsaXBzaXM7XG4gIG92ZXJmbG93OiBoaWRkZW47XG4gIHdoaXRlLXNwYWNlOiBub3dyYXA7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG59XG5cbi5zcGFuQWxsIHtcbiAgZ3JpZC1jb2x1bW46IDEgLyAtMTtcbn1cbiJdfQ== */`;
        document.head.append(element);
      }
      Changes_default = { "sectionTitle": "_sectionTitle_yvuyu_1", "new": "_new_yvuyu_7", "change": "_change_yvuyu_11", "container": "_container_yvuyu_15", "rowText": "_rowText_yvuyu_23", "rowKey": "_rowKey_yvuyu_29", "spanAll": "_spanAll_yvuyu_37" };
    }
  });

  // src/views/Push/Changes.tsx
  var Changes;
  var init_Changes2 = __esm({
    "src/views/Push/Changes.tsx"() {
      "use strict";
      init_preact_module();
      init_clsx_m();
      init_Changes();
      Changes = ({ changes }) => {
        return /* @__PURE__ */ h("div", {
          className: Changes_default.container
        }, changes.newKeys.length > 0 && /* @__PURE__ */ h(p, null, /* @__PURE__ */ h("div", {
          className: clsx_m_default(Changes_default.sectionTitle, Changes_default.spanAll)
        }, "New keys"), changes.newKeys.map(({ key, newValue }) => /* @__PURE__ */ h(p, {
          key
        }, /* @__PURE__ */ h("div", {
          className: clsx_m_default(Changes_default.new, Changes_default.rowKey)
        }, key), /* @__PURE__ */ h("div", {
          className: clsx_m_default(Changes_default.new, Changes_default.rowText)
        }, newValue)))), changes.changedKeys.length > 0 && /* @__PURE__ */ h(p, null, /* @__PURE__ */ h("div", {
          className: clsx_m_default(Changes_default.sectionTitle, Changes_default.spanAll)
        }, "Changed keys"), changes.changedKeys.map(({ key, newValue }) => /* @__PURE__ */ h(p, {
          key
        }, /* @__PURE__ */ h("div", {
          className: clsx_m_default(Changes_default.change, Changes_default.rowKey)
        }, key), /* @__PURE__ */ h("div", {
          className: clsx_m_default(Changes_default.change, Changes_default.rowText)
        }, newValue)))));
      };
    }
  });

  // src/views/Push/Push.tsx
  var Push;
  var init_Push = __esm({
    "src/views/Push/Push.tsx"() {
      "use strict";
      init_preact_module();
      init_hooks_module();
      init_lib2();
      init_useQueryApi();
      init_ActionsBottom2();
      init_FullPageLoading2();
      init_GlobalState();
      init_getChanges();
      init_TopBar2();
      init_Changes2();
      Push = ({ nodes }) => {
        const language = useGlobalState((c3) => c3.config.lang);
        const { setRoute } = useGlobalActions();
        const keys = F(() => [...new Set(nodes.map((n2) => n2.key))], [nodes]);
        const [success, setSuccess] = p2(false);
        const [error, setError] = p2(false);
        const translationsLoadable = useApiQuery({
          url: "/v2/projects/translations",
          method: "get",
          query: {
            structureDelimiter: null,
            languages: [language],
            size: 1e4,
            filterKeyName: keys
          },
          options: {
            cacheTime: 0,
            staleTime: 0
          }
        });
        const updateTranslations = useApiMutation({
          url: "/v2/projects/translations",
          method: "post"
        });
        const handleGoBack = () => {
          setRoute("index");
        };
        const changes = F(() => {
          var _a, _b;
          return getChanges(
            nodes,
            ((_b = (_a = translationsLoadable.data) == null ? void 0 : _a._embedded) == null ? void 0 : _b.keys) || [],
            language
          );
        }, [translationsLoadable.data, nodes]);
        const handleSubmit = async () => {
          const promises = [...changes.changedKeys, ...changes.newKeys].map(
            (key) => updateTranslations.mutateAsync({
              content: {
                "application/json": {
                  key: key.key,
                  translations: { [language]: key.newValue }
                }
              }
            })
          );
          try {
            await Promise.all(promises);
            setSuccess(true);
          } catch (e3) {
            setError(true);
          }
        };
        const handleRepeat = () => {
          setError(false);
          setSuccess(false);
          translationsLoadable.refetch();
        };
        const isLoading = translationsLoadable.isFetching || updateTranslations.isLoading;
        const changesSize = changes.changedKeys.length + changes.newKeys.length;
        return /* @__PURE__ */ h(p, null, /* @__PURE__ */ h(TopBar, {
          onBack: handleGoBack,
          leftPart: /* @__PURE__ */ h("div", null, "Push translations to Tolgee platform")
        }), /* @__PURE__ */ h(Divider, null), /* @__PURE__ */ h(VerticalSpace, {
          space: "large"
        }), /* @__PURE__ */ h(Container, {
          space: "medium"
        }, isLoading ? /* @__PURE__ */ h(FullPageLoading, null) : error ? /* @__PURE__ */ h(p, null, /* @__PURE__ */ h("div", null, updateTranslations.error || "An error has occured during push."), /* @__PURE__ */ h(ActionsBottom, null, /* @__PURE__ */ h(Button, {
          onClick: handleRepeat
        }, "Try again"))) : success ? /* @__PURE__ */ h(p, null, /* @__PURE__ */ h("div", null, changesSize, " key(s) updated!"), /* @__PURE__ */ h(ActionsBottom, null, /* @__PURE__ */ h(Button, {
          onClick: handleGoBack
        }, "Ok"))) : changesSize === 0 ? /* @__PURE__ */ h(p, null, /* @__PURE__ */ h("div", null, "Everything up to date"), /* @__PURE__ */ h(ActionsBottom, null, /* @__PURE__ */ h(Button, {
          onClick: handleGoBack
        }, "Ok"))) : /* @__PURE__ */ h(p, null, /* @__PURE__ */ h(Changes, {
          changes
        }), /* @__PURE__ */ h(ActionsBottom, null, /* @__PURE__ */ h(Button, {
          onClick: handleGoBack,
          secondary: true
        }, "Cancel"), /* @__PURE__ */ h(Button, {
          onClick: handleSubmit
        }, "Submit")))));
      };
    }
  });

  // ../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/2fb2bfaa-68ff-495f-9f06-90c50626baff/MissingKeys.js
  var MissingKeys_default;
  var init_MissingKeys = __esm({
    "../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/2fb2bfaa-68ff-495f-9f06-90c50626baff/MissingKeys.js"() {
      if (document.getElementById("934214142c") === null) {
        const element = document.createElement("style");
        element.id = "934214142c";
        element.textContent = `._sectionTitle_1jaui_1 {
  margin-bottom: -3px;
  margin-top: 10px;
  font-size: 12px;
}

._missing_1jaui_7 {
  color: var(--figma-color-icon-danger);
}

._container_1jaui_11 {
  margin-top: 10px;
  display: grid;
  gap: 10px 10px;
  grid-template-columns: 1fr;
  align-items: center;
}

._rowKey_1jaui_19 {
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  display: flex;
  align-items: center;
}

._spanAll_1jaui_27 {
  grid-column: 1 / -1;
}

/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy92aWV3cy9QdWxsL01pc3NpbmdLZXlzLmNzcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUNFLG1CQUFtQjtFQUNuQixnQkFBZ0I7RUFDaEIsZUFBZTtBQUNqQjs7QUFFQTtFQUNFLHFDQUFxQztBQUN2Qzs7QUFFQTtFQUNFLGdCQUFnQjtFQUNoQixhQUFhO0VBQ2IsY0FBYztFQUNkLDBCQUEwQjtFQUMxQixtQkFBbUI7QUFDckI7O0FBRUE7RUFDRSx1QkFBdUI7RUFDdkIsZ0JBQWdCO0VBQ2hCLG1CQUFtQjtFQUNuQixhQUFhO0VBQ2IsbUJBQW1CO0FBQ3JCOztBQUVBO0VBQ0UsbUJBQW1CO0FBQ3JCIiwiZmlsZSI6InNyYy92aWV3cy9QdWxsL01pc3NpbmdLZXlzLmNzcyIsInNvdXJjZXNDb250ZW50IjpbIi5zZWN0aW9uVGl0bGUge1xuICBtYXJnaW4tYm90dG9tOiAtM3B4O1xuICBtYXJnaW4tdG9wOiAxMHB4O1xuICBmb250LXNpemU6IDEycHg7XG59XG5cbi5taXNzaW5nIHtcbiAgY29sb3I6IHZhcigtLWZpZ21hLWNvbG9yLWljb24tZGFuZ2VyKTtcbn1cblxuLmNvbnRhaW5lciB7XG4gIG1hcmdpbi10b3A6IDEwcHg7XG4gIGRpc3BsYXk6IGdyaWQ7XG4gIGdhcDogMTBweCAxMHB4O1xuICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IDFmcjtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbn1cblxuLnJvd0tleSB7XG4gIHRleHQtb3ZlcmZsb3c6IGVsbGlwc2lzO1xuICBvdmVyZmxvdzogaGlkZGVuO1xuICB3aGl0ZS1zcGFjZTogbm93cmFwO1xuICBkaXNwbGF5OiBmbGV4O1xuICBhbGlnbi1pdGVtczogY2VudGVyO1xufVxuXG4uc3BhbkFsbCB7XG4gIGdyaWQtY29sdW1uOiAxIC8gLTE7XG59XG4iXX0= */`;
        document.head.append(element);
      }
      MissingKeys_default = { "sectionTitle": "_sectionTitle_1jaui_1", "missing": "_missing_1jaui_7", "container": "_container_1jaui_11", "rowKey": "_rowKey_1jaui_19", "spanAll": "_spanAll_1jaui_27" };
    }
  });

  // src/views/Pull/MissingKeys.tsx
  var MissingKeys;
  var init_MissingKeys2 = __esm({
    "src/views/Pull/MissingKeys.tsx"() {
      "use strict";
      init_preact_module();
      init_MissingKeys();
      init_clsx_m();
      MissingKeys = ({ missingKeys }) => {
        return /* @__PURE__ */ h("div", {
          className: MissingKeys_default.container
        }, missingKeys.length > 0 && /* @__PURE__ */ h(p, null, /* @__PURE__ */ h("div", {
          className: clsx_m_default(MissingKeys_default.sectionTitle, MissingKeys_default.spanAll)
        }, "Missing translations for keys:"), missingKeys.map((key) => /* @__PURE__ */ h(p, {
          key
        }, /* @__PURE__ */ h("div", {
          className: clsx_m_default(MissingKeys_default.missing, MissingKeys_default.rowKey)
        }, key)))));
      };
    }
  });

  // src/views/Pull/Pull.tsx
  var Pull;
  var init_Pull = __esm({
    "src/views/Pull/Pull.tsx"() {
      "use strict";
      init_preact_module();
      init_hooks_module();
      init_lib2();
      init_lib();
      init_useQueryApi();
      init_ActionsBottom2();
      init_FullPageLoading2();
      init_GlobalState();
      init_getConnectedNodes();
      init_TopBar2();
      init_MissingKeys2();
      Pull = ({ lang, nodes }) => {
        const allNodes = useGlobalState((c3) => c3.allNodes);
        const selectedNodes = nodes || getConnectedNodes(allNodes);
        const { setRoute, setLanguage } = useGlobalActions();
        const [success, setSuccess] = p2(false);
        const selectedKeys = F(
          () => [...new Set(selectedNodes.map((n2) => n2.key))],
          [selectedNodes]
        );
        const translationsLoadable = useApiQuery({
          url: "/v2/projects/translations",
          method: "get",
          query: {
            structureDelimiter: null,
            languages: [lang],
            size: 1e4,
            filterKeyName: selectedKeys
          },
          options: {
            cacheTime: 0,
            staleTime: 0
          }
        });
        const { changedNodes, missingKeys } = F(() => {
          const changedNodes2 = [];
          const missingKeys2 = [];
          selectedNodes.forEach((node) => {
            var _a, _b, _c, _d;
            const key = (_c = (_b = (_a = translationsLoadable.data) == null ? void 0 : _a._embedded) == null ? void 0 : _b.keys) == null ? void 0 : _c.find(
              (t3) => t3.keyName === node.key
            );
            const value = (_d = key == null ? void 0 : key.translations[lang]) == null ? void 0 : _d.text;
            if (value) {
              if (value !== node.characters) {
                changedNodes2.push(__spreadProps(__spreadValues({}, node), { characters: value }));
              }
            } else {
              missingKeys2.push(node.key);
            }
          });
          return { changedNodes: changedNodes2, missingKeys: missingKeys2 };
        }, [translationsLoadable.data, selectedNodes, lang]);
        const handleProcess = async () => {
          emit("UPDATE_NODES", changedNodes);
          setLanguage(lang);
          setRoute("index");
        };
        const handleGoBack = () => {
          setRoute("index");
        };
        const handleRepeat = () => {
          setSuccess(false);
          handleProcess();
        };
        const isLoading = translationsLoadable.isLoading;
        return /* @__PURE__ */ h(p, null, /* @__PURE__ */ h(TopBar, {
          onBack: handleGoBack,
          leftPart: /* @__PURE__ */ h("div", null, "Pull translations (", lang, ")")
        }), /* @__PURE__ */ h(Divider, null), /* @__PURE__ */ h(VerticalSpace, {
          space: "large"
        }), /* @__PURE__ */ h(Container, {
          space: "medium"
        }, isLoading ? /* @__PURE__ */ h(FullPageLoading, null) : translationsLoadable.error ? /* @__PURE__ */ h(p, null, /* @__PURE__ */ h("div", null, translationsLoadable.error || "Cannot get translation data"), /* @__PURE__ */ h(ActionsBottom, null, /* @__PURE__ */ h(Button, {
          onClick: handleRepeat
        }, "Try again"))) : success ? /* @__PURE__ */ h(p, null, /* @__PURE__ */ h("div", null, "Success!"), /* @__PURE__ */ h(ActionsBottom, null, /* @__PURE__ */ h(Button, {
          onClick: handleGoBack
        }, "Continue to home page"))) : /* @__PURE__ */ h(p, null, /* @__PURE__ */ h("div", null, changedNodes.length === 0 ? "Everything up to date" : `This action will replace translations in ${changedNodes.length} nodes.`), /* @__PURE__ */ h("div", null, missingKeys.length > 0 && /* @__PURE__ */ h(MissingKeys, {
          missingKeys
        })), /* @__PURE__ */ h(ActionsBottom, null, changedNodes.length === 0 ? /* @__PURE__ */ h(Button, {
          onClick: handleProcess
        }, "Ok") : /* @__PURE__ */ h(p, null, /* @__PURE__ */ h(Button, {
          onClick: handleGoBack,
          secondary: true
        }, "Cancel"), /* @__PURE__ */ h(Button, {
          onClick: handleProcess
        }, "Submit"))))));
      };
    }
  });

  // src/views/Router.tsx
  var getPage, Router;
  var init_Router = __esm({
    "src/views/Router.tsx"() {
      "use strict";
      init_preact_module();
      init_lib2();
      init_hooks_module();
      init_Index2();
      init_Settings();
      init_GlobalState();
      init_Push();
      init_Pull();
      getPage = ([routeKey, routeData]) => {
        switch (routeKey) {
          case "index":
            return /* @__PURE__ */ h(Index, null);
          case "settings":
            return /* @__PURE__ */ h(Settings2, null);
          case "push":
            return /* @__PURE__ */ h(Push, __spreadValues({}, routeData));
          case "pull":
            return /* @__PURE__ */ h(Pull, __spreadValues({}, routeData));
        }
      };
      Router = () => {
        const route = useGlobalState((c3) => c3.route);
        const routeKey = useGlobalState((c3) => c3.routeKey);
        const globalError = useGlobalState((c3) => c3.globalError);
        const config = useGlobalState((c3) => c3.config);
        const { setRoute } = useGlobalActions();
        h2(() => {
          if (!(config == null ? void 0 : config.apiKey) || !(config == null ? void 0 : config.apiUrl)) {
            setRoute("settings");
          }
        }, [config]);
        const handleResolveError = () => {
          setRoute("settings");
        };
        return /* @__PURE__ */ h(p, null, globalError && routeKey !== "settings" && /* @__PURE__ */ h(Banner, {
          style: { cursor: "pointer" },
          onClick: handleResolveError,
          icon: /* @__PURE__ */ h(IconWarning32, null)
        }, globalError), getPage(route));
      };
    }
  });

  // src/ui.tsx
  var ui_exports = {};
  __export(ui_exports, {
    default: () => ui_default
  });
  function Plugin({ config, allNodes, selectedNodes }) {
    return /* @__PURE__ */ h(GlobalState, {
      initialNodes: allNodes,
      initialSelection: selectedNodes,
      initialConfig: config
    }, /* @__PURE__ */ h(QueryClientProvider, {
      client: queryClient
    }, /* @__PURE__ */ h(Router, null)));
  }
  var queryClient, ui_default;
  var init_ui = __esm({
    "src/ui.tsx"() {
      "use strict";
      init_lib2();
      init_preact_module();
      init_styles();
      init_es();
      init_GlobalState();
      init_Router();
      queryClient = new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
            retry: false
          }
        }
      });
      ui_default = render(Plugin);
    }
  });

  // <stdin>
  var rootNode = document.getElementById("create-figma-plugin");
  var modules = { "src/main.ts--default": (init_ui(), __toCommonJS(ui_exports))["default"] };
  var commandId = __FIGMA_COMMAND__ === "" ? "src/main.ts--default" : __FIGMA_COMMAND__;
  if (typeof modules[commandId] === "undefined") {
    throw new Error(
      "No UI defined for command `" + commandId + "`"
    );
  }
  modules[commandId](rootNode, __SHOW_UI_DATA__);
})();
/**
 * @license React
 * scheduler.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
