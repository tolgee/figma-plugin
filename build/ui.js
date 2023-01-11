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
    var t3, o3, r3, f4 = {};
    for (r3 in u3)
      "key" == r3 ? t3 = u3[r3] : "ref" == r3 ? o3 = u3[r3] : f4[r3] = u3[r3];
    if (arguments.length > 2 && (f4.children = arguments.length > 3 ? n.call(arguments, 2) : i4), "function" == typeof l3 && null != l3.defaultProps)
      for (r3 in l3.defaultProps)
        void 0 === f4[r3] && (f4[r3] = l3.defaultProps[r3]);
    return v(l3, f4, t3, o3, null);
  }
  function v(n2, i4, t3, o3, r3) {
    var f4 = { type: n2, props: i4, key: t3, ref: o3, __k: null, __: null, __b: 0, __e: null, __d: void 0, __c: null, __h: null, constructor: void 0, __v: null == r3 ? ++u : r3 };
    return null == r3 && null != l.vnode && l.vnode(f4), f4;
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
        var l3, u3, i4, t3, o3, r3;
        n3.__d && (o3 = (t3 = (l3 = n3).__v).__e, (r3 = l3.__P) && (u3 = [], (i4 = s({}, t3)).__v = t3.__v + 1, j(r3, t3, i4, l3.__n, void 0 !== r3.ownerSVGElement, null != t3.__h ? [o3] : null, u3, null == o3 ? _(t3) : o3, t3.__h), z(u3, t3), t3.__e != o3 && k(t3)));
      });
  }
  function w(n2, l3, u3, i4, t3, o3, r3, c3, s3, a4) {
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
        j(n2, k4, d4 = d4 || f, t3, o3, r3, c3, s3, a4), b3 = k4.__e, (y3 = k4.ref) && d4.ref != y3 && (w4 || (w4 = []), d4.ref && w4.push(d4.ref, null, k4), w4.push(y3, k4.__c || b3, k4)), null != b3 ? (null == g4 && (g4 = b3), "function" == typeof k4.type && k4.__k === d4.__k ? k4.__d = s3 = m(k4, s3, n2) : s3 = A(n2, k4, d4, x4, b3, s3), "function" == typeof u3.type && (u3.__d = s3)) : s3 && d4.__e == s3 && s3.parentNode != n2 && (s3 = _(d4));
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
    var r3, f4, e3;
    if (void 0 !== l3.__d)
      r3 = l3.__d, l3.__d = void 0;
    else if (null == u3 || t3 != o3 || null == t3.parentNode)
      n:
        if (null == o3 || o3.parentNode !== n2)
          n2.appendChild(t3), r3 = null;
        else {
          for (f4 = o3, e3 = 0; (f4 = f4.nextSibling) && e3 < i4.length; e3 += 1)
            if (f4 == t3)
              break n;
          n2.insertBefore(t3, o3), r3 = o3;
        }
    return void 0 !== r3 ? r3 : t3.nextSibling;
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
  function j(n2, u3, i4, t3, o3, r3, f4, e3, c3) {
    var a4, h4, v4, y3, _3, k4, b3, g4, m3, x4, A4, C3, $3, H3, I3, T4 = u3.type;
    if (void 0 !== u3.constructor)
      return null;
    null != i4.__h && (c3 = i4.__h, e3 = u3.__e = i4.__e, u3.__h = null, r3 = [e3]), (a4 = l.__b) && a4(u3);
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
          h4.state = h4.__s, null != h4.getChildContext && (t3 = s(s({}, t3), h4.getChildContext())), v4 || null == h4.getSnapshotBeforeUpdate || (k4 = h4.getSnapshotBeforeUpdate(y3, _3)), I3 = null != a4 && a4.type === p && null == a4.key ? a4.props.children : a4, w(n2, Array.isArray(I3) ? I3 : [I3], u3, i4, t3, o3, r3, f4, e3, c3), h4.base = u3.__e, u3.__h = null, h4.__h.length && f4.push(h4), b3 && (h4.__E = h4.__ = null), h4.__e = false;
        } else
          null == r3 && u3.__v === i4.__v ? (u3.__k = i4.__k, u3.__e = i4.__e) : u3.__e = L(i4.__e, u3, i4, t3, o3, r3, f4, c3);
      (a4 = l.diffed) && a4(u3);
    } catch (n3) {
      u3.__v = null, (c3 || null != r3) && (u3.__e = e3, u3.__h = !!c3, r3[r3.indexOf(e3)] = null), l.__e(n3, u3, i4);
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
  function L(l3, u3, i4, t3, o3, r3, e3, c3) {
    var s3, h4, v4, y3 = i4.props, p4 = u3.props, d4 = u3.type, k4 = 0;
    if ("svg" === d4 && (o3 = true), null != r3) {
      for (; k4 < r3.length; k4++)
        if ((s3 = r3[k4]) && "setAttribute" in s3 == !!d4 && (d4 ? s3.localName === d4 : 3 === s3.nodeType)) {
          l3 = s3, r3[k4] = null;
          break;
        }
    }
    if (null == l3) {
      if (null === d4)
        return document.createTextNode(p4);
      l3 = o3 ? document.createElementNS("http://www.w3.org/2000/svg", d4) : document.createElement(d4, p4.is && p4), r3 = null, c3 = false;
    }
    if (null === d4)
      y3 === p4 || c3 && l3.data === p4 || (l3.data = p4);
    else {
      if (r3 = r3 && n.call(l3.childNodes), h4 = (y3 = i4.props || f).dangerouslySetInnerHTML, v4 = p4.dangerouslySetInnerHTML, !c3) {
        if (null != r3)
          for (y3 = {}, k4 = 0; k4 < l3.attributes.length; k4++)
            y3[l3.attributes[k4].name] = l3.attributes[k4].value;
        (v4 || h4) && (v4 && (h4 && v4.__html == h4.__html || v4.__html === l3.innerHTML) || (l3.innerHTML = v4 && v4.__html || ""));
      }
      if (C(l3, p4, y3, o3, c3), v4)
        u3.__k = [];
      else if (k4 = u3.props.children, w(l3, Array.isArray(k4) ? k4 : [k4], u3, i4, t3, o3 && "foreignObject" !== d4, r3, e3, r3 ? r3[0] : i4.__k && _(i4, 0), c3), null != r3)
        for (k4 = r3.length; k4--; )
          null != r3[k4] && a(r3[k4]);
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
    var o3, r3, e3;
    l.__ && l.__(u3, i4), r3 = (o3 = "function" == typeof t3) ? null : t3 && t3.__k || i4.__k, e3 = [], j(i4, u3 = (!o3 && t3 || i4).__k = h(p, null, [u3]), r3 || f, f, void 0 !== i4.ownerSVGElement, !o3 && t3 ? [t3] : r3 ? null : i4.firstChild ? n.call(i4.childNodes) : null, e3, !o3 && t3 ? t3 : r3 ? r3.__e : i4.firstChild, o3), z(e3, u3);
  }
  function S(n2, l3) {
    P(n2, l3, S);
  }
  function q(l3, u3, i4) {
    var t3, o3, r3, f4 = s({}, l3.props);
    for (r3 in u3)
      "key" == r3 ? t3 = u3[r3] : "ref" == r3 ? o3 = u3[r3] : f4[r3] = u3[r3];
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
        for (var t3, o3, r3; l3 = l3.__; )
          if ((t3 = l3.__c) && !t3.__)
            try {
              if ((o3 = t3.constructor) && null != o3.getDerivedStateFromError && (t3.setState(o3.getDerivedStateFromError(n2)), r3 = t3.__d), null != t3.componentDidCatch && (t3.componentDidCatch(n2, i4 || {}), r3 = t3.__d), r3)
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

  // ../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/f79bedb9-41a9-4262-9627-47bd97276ff2/banner.js
  var banner_default;
  var init_banner = __esm({
    "../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/f79bedb9-41a9-4262-9627-47bd97276ff2/banner.js"() {
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
      var t3 = o3.__N ? o3.__N[0] : o3.__[0], r3 = o3.t(t3, n3);
      t3 !== r3 && (o3.__N = [r3, o3.__[1]], o3.__c.setState({}));
    }], o3.__c = r2, !r2.u)) {
      r2.u = true;
      var f4 = r2.shouldComponentUpdate;
      r2.shouldComponentUpdate = function(n3, t3, r3) {
        if (!o3.__c.__H)
          return true;
        var u4 = o3.__c.__H.__.filter(function(n4) {
          return n4.__c;
        });
        if (u4.every(function(n4) {
          return !n4.__N;
        }))
          return !f4 || f4.call(this, n3, t3, r3);
        var i5 = false;
        return u4.forEach(function(n4) {
          if (n4.__N) {
            var t4 = n4.__[0];
            n4.__ = n4.__N, n4.__N = void 0, t4 !== n4.__[0] && (i5 = true);
          }
        }), !(!i5 && o3.__c.props === n3) && (!f4 || f4.call(this, n3, t3, r3));
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
  function A2(n2, t3, r3) {
    o2 = 6, s2(function() {
      return "function" == typeof n2 ? (n2(t3()), function() {
        return n2(null);
      }) : n2 ? (n2.current = t3(), function() {
        return n2.current = null;
      }) : void 0;
    }, null == r3 ? r3 : r3.concat(n2));
  }
  function F(n2, r3) {
    var u3 = d2(t2++, 7);
    return z2(u3.__H, r3) ? (u3.__V = n2(), u3.i = r3, u3.__h = n2, u3.__V) : u3.__;
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
  function x2(t3, r3) {
    l.useDebugValue && l.useDebugValue(r3 ? r3(t3) : t3);
  }
  function P2(n2) {
    var u3 = d2(t2++, 10), i4 = p2();
    return u3.__ = n2, r2.componentDidCatch || (r2.componentDidCatch = function(n3, t3) {
      u3.__ && u3.__(n3, t3), i4[1](n3);
    }), [i4[0], function() {
      i4[1](void 0);
    }];
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
        } catch (r3) {
          t3.__H.__h = [], l.__e(r3, t3.__v);
        }
  }
  function j2(n2) {
    var t3, r3 = function() {
      clearTimeout(u3), g2 && cancelAnimationFrame(t3), setTimeout(n2);
    }, u3 = setTimeout(r3, 100);
    g2 && (t3 = requestAnimationFrame(r3));
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
    return !n2 || n2.length !== t3.length || t3.some(function(t4, r3) {
      return t4 !== n2[r3];
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
      }, l.__c = function(t3, r3) {
        r3.some(function(t4) {
          try {
            t4.__h.forEach(k2), t4.__h = t4.__h.filter(function(n2) {
              return !n2.__ || w2(n2);
            });
          } catch (u3) {
            r3.some(function(n2) {
              n2.__h && (n2.__h = []);
            }), r3 = [], l.__e(u3, t4.__v);
          }
        }), l2 && l2(t3, r3);
      }, l.unmount = function(t3) {
        m2 && m2(t3);
        var r3, u3 = t3.__c;
        u3 && u3.__H && (u3.__H.__.forEach(function(n2) {
          try {
            k2(n2);
          } catch (n3) {
            r3 = n3;
          }
        }), u3.__H = void 0, r3 && l.__e(r3, u3.__v));
      };
      g2 = "function" == typeof requestAnimationFrame;
    }
  });

  // ../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/6644b61f-45ce-4deb-99fe-625b14c8e0e0/loading-indicator.js
  var loading_indicator_default;
  var init_loading_indicator = __esm({
    "../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/6644b61f-45ce-4deb-99fe-625b14c8e0e0/loading-indicator.js"() {
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

  // ../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/44e119c5-aecc-4548-bbdb-2caf2188c20e/button.js
  var button_default;
  var init_button = __esm({
    "../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/44e119c5-aecc-4548-bbdb-2caf2188c20e/button.js"() {
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

  // ../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/da78cd1b-1ea5-4996-8cfa-3cab4d0682a5/icon.js
  var icon_default;
  var init_icon = __esm({
    "../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/da78cd1b-1ea5-4996-8cfa-3cab4d0682a5/icon.js"() {
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

  // ../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/81225f74-0375-450d-af90-ce10a1e325d6/text.js
  var text_default;
  var init_text = __esm({
    "../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/81225f74-0375-450d-af90-ce10a1e325d6/text.js"() {
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

  // ../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/23e86d48-2762-4351-b4be-faa2bb561bbf/textbox.js
  var textbox_default;
  var init_textbox = __esm({
    "../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/23e86d48-2762-4351-b4be-faa2bb561bbf/textbox.js"() {
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

  // node_modules/@create-figma-plugin/ui/lib/icons/icon-32/icon-warning-32.js
  var IconWarning32;
  var init_icon_warning_32 = __esm({
    "node_modules/@create-figma-plugin/ui/lib/icons/icon-32/icon-warning-32.js"() {
      init_create_icon();
      IconWarning32 = createIcon("M23.2901 22 16 9.03973 8.70983 22H23.2901ZM16.8716 8.54947c-.3823-.67965-1.3609-.67965-1.7432 0L7.83825 21.5097C7.46329 22.1763 7.945 23 8.70983 23H23.2901c.7649 0 1.2466-.8237.8716-1.4903L16.8716 8.54947Zm-.8717 4.42383c.4142 0 .75.3358.75.75v2.5294c0 .4142-.3358.75-.75.75s-.75-.3358-.75-.75v-2.5294c0-.4142.3358-.75.75-.75Zm1 6.5269c0-.5523-.4477-1-1-1s-1 .4477-1 1v.0685c0 .5523.4477 1 1 1s1-.4477 1-1v-.0685Z", { height: 32, width: 32 });
    }
  });

  // ../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/4ffaf53d-1320-4edc-82c4-aa41e8cdc94a/muted.js
  var muted_default;
  var init_muted = __esm({
    "../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/4ffaf53d-1320-4edc-82c4-aa41e8cdc94a/muted.js"() {
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

  // ../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/1e7ecfa5-bf46-4d11-8d46-093c65c13db1/columns.js
  var columns_default;
  var init_columns = __esm({
    "../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/1e7ecfa5-bf46-4d11-8d46-093c65c13db1/columns.js"() {
      if (document.getElementById("aa124f3cd7") === null) {
        const element = document.createElement("style");
        element.id = "aa124f3cd7";
        element.textContent = `._columns_ybv3x_1 {
  display: flex;
}
._extraSmall_ybv3x_4 {
  margin-left: calc(-1 * var(--space-extra-small));
}
._small_ybv3x_7 {
  margin-left: calc(-1 * var(--space-small));
}
._medium_ybv3x_10 {
  margin-left: calc(-1 * var(--space-medium));
}
._large_ybv3x_13 {
  margin-left: calc(-1 * var(--space-large));
}
._extraLarge_ybv3x_16 {
  margin-left: calc(-1 * var(--space-extra-large));
}

._child_ybv3x_20 {
  flex-grow: 1;
}
._extraSmall_ybv3x_4 > ._child_ybv3x_20 {
  padding-left: var(--space-extra-small);
}
._small_ybv3x_7 > ._child_ybv3x_20 {
  padding-left: var(--space-small);
}
._medium_ybv3x_10 > ._child_ybv3x_20 {
  padding-left: var(--space-medium);
}
._large_ybv3x_13 > ._child_ybv3x_20 {
  padding-left: var(--space-large);
}
._extraLarge_ybv3x_16 > ._child_ybv3x_20 {
  padding-left: var(--space-extra-large);
}

/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9AY3JlYXRlLWZpZ21hLXBsdWdpbi91aS9saWIvbGF5b3V0L2NvbHVtbnMvY29sdW1ucy5jc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFDRSxhQUFhO0FBQ2Y7QUFDQTtFQUNFLGdEQUFnRDtBQUNsRDtBQUNBO0VBQ0UsMENBQTBDO0FBQzVDO0FBQ0E7RUFDRSwyQ0FBMkM7QUFDN0M7QUFDQTtFQUNFLDBDQUEwQztBQUM1QztBQUNBO0VBQ0UsZ0RBQWdEO0FBQ2xEOztBQUVBO0VBQ0UsWUFBWTtBQUNkO0FBQ0E7RUFDRSxzQ0FBc0M7QUFDeEM7QUFDQTtFQUNFLGdDQUFnQztBQUNsQztBQUNBO0VBQ0UsaUNBQWlDO0FBQ25DO0FBQ0E7RUFDRSxnQ0FBZ0M7QUFDbEM7QUFDQTtFQUNFLHNDQUFzQztBQUN4QyIsImZpbGUiOiJub2RlX21vZHVsZXMvQGNyZWF0ZS1maWdtYS1wbHVnaW4vdWkvbGliL2xheW91dC9jb2x1bW5zL2NvbHVtbnMuY3NzIiwic291cmNlc0NvbnRlbnQiOlsiLmNvbHVtbnMge1xuICBkaXNwbGF5OiBmbGV4O1xufVxuLmV4dHJhU21hbGwge1xuICBtYXJnaW4tbGVmdDogY2FsYygtMSAqIHZhcigtLXNwYWNlLWV4dHJhLXNtYWxsKSk7XG59XG4uc21hbGwge1xuICBtYXJnaW4tbGVmdDogY2FsYygtMSAqIHZhcigtLXNwYWNlLXNtYWxsKSk7XG59XG4ubWVkaXVtIHtcbiAgbWFyZ2luLWxlZnQ6IGNhbGMoLTEgKiB2YXIoLS1zcGFjZS1tZWRpdW0pKTtcbn1cbi5sYXJnZSB7XG4gIG1hcmdpbi1sZWZ0OiBjYWxjKC0xICogdmFyKC0tc3BhY2UtbGFyZ2UpKTtcbn1cbi5leHRyYUxhcmdlIHtcbiAgbWFyZ2luLWxlZnQ6IGNhbGMoLTEgKiB2YXIoLS1zcGFjZS1leHRyYS1sYXJnZSkpO1xufVxuXG4uY2hpbGQge1xuICBmbGV4LWdyb3c6IDE7XG59XG4uZXh0cmFTbWFsbCA+IC5jaGlsZCB7XG4gIHBhZGRpbmctbGVmdDogdmFyKC0tc3BhY2UtZXh0cmEtc21hbGwpO1xufVxuLnNtYWxsID4gLmNoaWxkIHtcbiAgcGFkZGluZy1sZWZ0OiB2YXIoLS1zcGFjZS1zbWFsbCk7XG59XG4ubWVkaXVtID4gLmNoaWxkIHtcbiAgcGFkZGluZy1sZWZ0OiB2YXIoLS1zcGFjZS1tZWRpdW0pO1xufVxuLmxhcmdlID4gLmNoaWxkIHtcbiAgcGFkZGluZy1sZWZ0OiB2YXIoLS1zcGFjZS1sYXJnZSk7XG59XG4uZXh0cmFMYXJnZSA+IC5jaGlsZCB7XG4gIHBhZGRpbmctbGVmdDogdmFyKC0tc3BhY2UtZXh0cmEtbGFyZ2UpO1xufVxuIl19 */`;
        document.head.append(element);
      }
      columns_default = { "columns": "_columns_ybv3x_1", "extraSmall": "_extraSmall_ybv3x_4", "small": "_small_ybv3x_7", "medium": "_medium_ybv3x_10", "large": "_large_ybv3x_13", "extraLarge": "_extraLarge_ybv3x_16", "child": "_child_ybv3x_20" };
    }
  });

  // node_modules/@create-figma-plugin/ui/lib/layout/columns/columns.js
  function Columns(_a) {
    var _b = _a, { children, space } = _b, rest = __objRest(_b, ["children", "space"]);
    return h("div", __spreadProps(__spreadValues({}, rest), { class: createClassName([
      columns_default.columns,
      typeof space === "undefined" ? null : columns_default[space]
    ]) }), x(children).map(function(element, index) {
      return h("div", { key: index, class: columns_default.child }, element);
    }));
  }
  var init_columns2 = __esm({
    "node_modules/@create-figma-plugin/ui/lib/layout/columns/columns.js"() {
      init_preact_module();
      init_create_class_name();
      init_columns();
    }
  });

  // ../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/cb5405e9-4c68-403f-b559-fee4d468bf20/container.js
  var container_default;
  var init_container = __esm({
    "../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/cb5405e9-4c68-403f-b559-fee4d468bf20/container.js"() {
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

  // ../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/620487d0-08d9-475b-8826-7f378178905f/middle-align.js
  var middle_align_default;
  var init_middle_align = __esm({
    "../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/620487d0-08d9-475b-8826-7f378178905f/middle-align.js"() {
      if (document.getElementById("28fbd9538f") === null) {
        const element = document.createElement("style");
        element.id = "28fbd9538f";
        element.textContent = `._middleAlign_294f9_1 {
  display: flex;
  height: 100%;
  align-items: center;
  justify-content: center;
}

._children_294f9_8 {
  display: block;
}

/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9AY3JlYXRlLWZpZ21hLXBsdWdpbi91aS9saWIvbGF5b3V0L21pZGRsZS1hbGlnbi9taWRkbGUtYWxpZ24uY3NzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQ0UsYUFBYTtFQUNiLFlBQVk7RUFDWixtQkFBbUI7RUFDbkIsdUJBQXVCO0FBQ3pCOztBQUVBO0VBQ0UsY0FBYztBQUNoQiIsImZpbGUiOiJub2RlX21vZHVsZXMvQGNyZWF0ZS1maWdtYS1wbHVnaW4vdWkvbGliL2xheW91dC9taWRkbGUtYWxpZ24vbWlkZGxlLWFsaWduLmNzcyIsInNvdXJjZXNDb250ZW50IjpbIi5taWRkbGVBbGlnbiB7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGhlaWdodDogMTAwJTtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG59XG5cbi5jaGlsZHJlbiB7XG4gIGRpc3BsYXk6IGJsb2NrO1xufVxuIl19 */`;
        document.head.append(element);
      }
      middle_align_default = { "middleAlign": "_middleAlign_294f9_1", "children": "_children_294f9_8" };
    }
  });

  // node_modules/@create-figma-plugin/ui/lib/layout/middle-align/middle-align.js
  function MiddleAlign(_a) {
    var _b = _a, { children } = _b, rest = __objRest(_b, ["children"]);
    return h("div", __spreadProps(__spreadValues({}, rest), { class: middle_align_default.middleAlign }), h("div", { class: middle_align_default.children }, children));
  }
  var init_middle_align2 = __esm({
    "node_modules/@create-figma-plugin/ui/lib/layout/middle-align/middle-align.js"() {
      init_preact_module();
      init_middle_align();
    }
  });

  // ../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/f682631c-60e6-4412-ad1b-d5a40c5d12c0/vertical-space.js
  var vertical_space_default;
  var init_vertical_space = __esm({
    "../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/f682631c-60e6-4412-ad1b-d5a40c5d12c0/vertical-space.js"() {
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

  // ../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/88f81156-cf6b-4995-9839-1736d4034e98/base.js
  var init_base = __esm({
    "../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/88f81156-cf6b-4995-9839-1736d4034e98/base.js"() {
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
      init_loading_indicator2();
      init_text2();
      init_textbox2();
      init_icon_warning_32();
      init_muted2();
      init_columns2();
      init_container2();
      init_middle_align2();
      init_vertical_space2();
      init_render();
    }
  });

  // ../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/5dafe3b3-9ffe-4a80-a152-464e94f885ae/styles.js
  var init_styles = __esm({
    "../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/5dafe3b3-9ffe-4a80-a152-464e94f885ae/styles.js"() {
      if (document.getElementById("5260158beb") === null) {
        const element = document.createElement("style");
        element.id = "5260158beb";
        element.textContent = `[class^="_selectableItem_"] {
  height: auto;
  padding: var(--space-medium) var(--space-small) var(--space-medium) var(--space-medium);
  margin-bottom: var(--space-small);
}

[class^="_selectableItem_"]:not([class^="_disabled_"]) [class^="_input_"]:checked ~ [class^="_children_"]{
  color: var(--figma-color-text-onbrand);
}
[class^="_selectableItem_"]:not([class^="_disabled_"]) [class^="_input_"]:checked ~ [class^="_box_"] {
  background-color: rgb(130, 43, 85);
}
:root {
  --figma-color-bg-brand: rgb(130, 43, 85);
  --figma-color-bg-selected: rgb(130, 43, 85);
  --figma-color-icon-brand: white;
}`;
        document.head.append(element);
      }
    }
  });

  // src/setup/views/data.ts
  var DEFAULT_SIZE, PAGES;
  var init_data = __esm({
    "src/setup/views/data.ts"() {
      "use strict";
      DEFAULT_SIZE = { width: 300, height: 400 };
      PAGES = {
        index: DEFAULT_SIZE,
        settings: { width: 300, height: 500 }
      };
    }
  });

  // node_modules/preact/compat/dist/compat.module.js
  var compat_module_exports = {};
  __export(compat_module_exports, {
    Children: () => O2,
    Component: () => d,
    Fragment: () => p,
    PureComponent: () => w3,
    StrictMode: () => vn,
    Suspense: () => D,
    SuspenseList: () => V2,
    __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: () => rn,
    cloneElement: () => cn,
    createContext: () => B,
    createElement: () => h,
    createFactory: () => on2,
    createPortal: () => j3,
    createRef: () => y,
    default: () => bn,
    findDOMNode: () => an,
    flushSync: () => hn,
    forwardRef: () => k3,
    hydrate: () => q3,
    isValidElement: () => ln,
    lazy: () => M2,
    memo: () => R,
    render: () => Y,
    startTransition: () => dn,
    unmountComponentAtNode: () => fn,
    unstable_batchedUpdates: () => sn,
    useCallback: () => T2,
    useContext: () => q2,
    useDebugValue: () => x2,
    useDeferredValue: () => pn,
    useEffect: () => h2,
    useErrorBoundary: () => P2,
    useId: () => V,
    useImperativeHandle: () => A2,
    useInsertionEffect: () => yn,
    useLayoutEffect: () => s2,
    useMemo: () => F,
    useReducer: () => y2,
    useRef: () => _2,
    useState: () => p2,
    useSyncExternalStore: () => _n,
    useTransition: () => mn,
    version: () => un
  });
  function g3(n2, t3) {
    for (var e3 in t3)
      n2[e3] = t3[e3];
    return n2;
  }
  function C2(n2, t3) {
    for (var e3 in n2)
      if ("__source" !== e3 && !(e3 in t3))
        return true;
    for (var r3 in t3)
      if ("__source" !== r3 && n2[r3] !== t3[r3])
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
    function r3(n3) {
      var t3 = this.props.ref, r4 = t3 == n3.ref;
      return !r4 && t3 && (t3.call ? t3(null) : t3.current = null), e3 ? !e3(this.props, n3) || !r4 : C2(this.props, n3);
    }
    function u3(e4) {
      return this.shouldComponentUpdate = r3, h(n2, e4);
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
    var e3, r3, u3;
    function o3(o4) {
      if (e3 || (e3 = n2()).then(function(n3) {
        r3 = n3.default || n3;
      }, function(n3) {
        u3 = n3;
      }), u3)
        throw u3;
      if (!r3)
        throw e3;
      return h(r3, o4);
    }
    return o3.displayName = "Lazy", o3.__f = true, o3;
  }
  function V2() {
    this.u = null, this.o = null;
  }
  function P3(n2) {
    return this.getChildContext = function() {
      return n2.context;
    }, n2.children;
  }
  function $2(n2) {
    var e3 = this, r3 = n2.i;
    e3.componentWillUnmount = function() {
      P(null, e3.l), e3.l = null, e3.i = null;
    }, e3.i && e3.i !== r3 && e3.componentWillUnmount(), n2.__v ? (e3.l || (e3.i = r3, e3.l = { nodeType: 1, parentNode: r3, childNodes: [], appendChild: function(n3) {
      this.childNodes.push(n3), e3.i.appendChild(n3);
    }, insertBefore: function(n3, t3) {
      this.childNodes.push(n3), e3.i.appendChild(n3);
    }, removeChild: function(n3) {
      this.childNodes.splice(this.childNodes.indexOf(n3) >>> 1, 1), e3.i.removeChild(n3);
    } }), P(h(P3, { context: e3.context }, n2.__v), e3.l)) : e3.l && e3.componentWillUnmount();
  }
  function j3(n2, e3) {
    var r3 = h($2, { __v: n2, i: e3 });
    return r3.containerInfo = e3, r3;
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
    var e3 = t3(), r3 = p2({ h: { __: e3, v: t3 } }), u3 = r3[0].h, o3 = r3[1];
    return s2(function() {
      u3.__ = e3, u3.v = t3, E(u3.__, t3()) || o3({ h: u3 });
    }, [n2, e3, t3]), h2(function() {
      return E(u3.__, u3.v()) || o3({ h: u3 }), n2(function() {
        E(u3.__, u3.v()) || o3({ h: u3 });
      });
    }, [n2]), e3;
  }
  var x3, N2, A3, O2, T3, I2, W, z3, B3, H2, Z, G, X, nn, tn, en, rn, un, sn, hn, vn, yn, bn;
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
      l.__e = function(n2, t3, e3, r3) {
        if (n2.then) {
          for (var u3, o3 = t3; o3 = o3.__; )
            if ((u3 = o3.__c) && u3.__c)
              return null == t3.__e && (t3.__e = e3.__e, t3.__k = e3.__k), u3.__c(n2, t3);
        }
        T3(n2, t3, e3, r3);
      };
      I2 = l.unmount;
      l.unmount = function(n2) {
        var t3 = n2.__c;
        t3 && t3.__R && t3.__R(), t3 && true === n2.__h && (n2.type = null), I2 && I2(n2);
      }, (D.prototype = new d()).__c = function(n2, t3) {
        var e3 = t3.__c, r3 = this;
        null == r3.t && (r3.t = []), r3.t.push(e3);
        var u3 = F2(r3.__v), o3 = false, i4 = function() {
          o3 || (o3 = true, e3.__R = null, u3 ? u3(l3) : l3());
        };
        e3.__R = i4;
        var l3 = function() {
          if (!--r3.__u) {
            if (r3.state.__a) {
              var n3 = r3.state.__a;
              r3.__v.__k[0] = U(n3, n3.__c.__P, n3.__c.__O);
            }
            var t4;
            for (r3.setState({ __a: r3.__b = null }); t4 = r3.t.pop(); )
              t4.forceUpdate();
          }
        }, c3 = true === t3.__h;
        r3.__u++ || c3 || r3.setState({ __a: r3.__b = r3.__v.__k[0] }), n2.then(i4, i4);
      }, D.prototype.componentWillUnmount = function() {
        this.t = [];
      }, D.prototype.render = function(n2, e3) {
        if (this.__b) {
          if (this.__v.__k) {
            var r3 = document.createElement("div"), o3 = this.__v.__k[0].__c;
            this.__v.__k[0] = L2(this.__b, r3, o3.__O = o3.__P);
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
        var t3 = this, e3 = F2(t3.__v), r3 = t3.o.get(n2);
        return r3[0]++, function(u3) {
          var o3 = function() {
            t3.props.revealOrder ? (r3.push(u3), W(t3, n2, r3)) : u3();
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
      un = "17.0.2";
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
              if (compare2(parent, node) > 0) {
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
              if (compare2(left, node) < 0) {
                if (rightIndex < length && compare2(right, left) < 0) {
                  heap[index] = right;
                  heap[rightIndex] = node;
                  index = rightIndex;
                } else {
                  heap[index] = left;
                  heap[leftIndex] = node;
                  index = leftIndex;
                }
              } else if (rightIndex < length && compare2(right, node) < 0) {
                heap[index] = right;
                heap[rightIndex] = node;
                index = rightIndex;
              } else {
                return;
              }
            }
          }
          function compare2(a4, b3) {
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
  function E2(r3) {
    const t3 = B({ [d3]: { v: { current: r3 }, n: { current: -1 }, l: /* @__PURE__ */ new Set(), u: (e3) => e3() } });
    var o3;
    return t3[f3] = t3.Provider, t3.Provider = (o3 = t3.Provider, ({ value: e3, children: r4 }) => {
      const t4 = _2(e3), c3 = _2(0), [i4, p4] = p2(null);
      i4 && (i4(e3), p4(null));
      const f4 = _2();
      if (!f4.current) {
        const e4 = /* @__PURE__ */ new Set(), r5 = (r6, t5) => {
          sn(() => {
            c3.current += 1;
            const n2 = { n: c3.current };
            null != t5 && t5.suspense && (n2.n *= -1, n2.p = new Promise((e5) => {
              p4(() => (r7) => {
                n2.v = r7, delete n2.p, e5(r7);
              });
            })), e4.forEach((e5) => e5(n2)), r6();
          });
        };
        f4.current = { [d3]: { v: t4, n: c3, l: e4, u: r5 } };
      }
      return v3(() => {
        t4.current = e3, c3.current += 1, a3(() => {
          f4.current[d3].l.forEach((r5) => {
            r5({ n: c3.current, v: e3 });
          });
        });
      }, [e3]), h(o3, { value: f4.current }, r4);
    }), delete t3.Consumer, t3;
  }
  function h3(e3, n2) {
    const o3 = q2(e3)[d3];
    if ("object" == typeof process && true && !o3)
      throw new Error("useContextSelector requires special context");
    const { v: { current: c3 }, n: { current: u3 }, l: s3 } = o3, i4 = n2(c3), [p4, l3] = y2((e4, r3) => {
      if (!r3)
        return [c3, i4];
      if ("p" in r3)
        throw r3.p;
      if (r3.n === u3)
        return Object.is(e4[1], i4) ? e4 : [c3, i4];
      try {
        if ("v" in r3) {
          if (Object.is(e4[0], r3.v))
            return e4;
          const t3 = n2(r3.v);
          return Object.is(e4[1], t3) ? e4 : [r3.v, t3];
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

  // src/setup/tools/createProvider.tsx
  var createProvider;
  var init_createProvider = __esm({
    "src/setup/tools/createProvider.tsx"() {
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

  // src/setup/state/GlobalState.ts
  var GlobalState, useGlobalActions, useGlobalState;
  var init_GlobalState = __esm({
    "src/setup/state/GlobalState.ts"() {
      "use strict";
      init_lib();
      init_hooks_module();
      init_data();
      init_createProvider();
      [GlobalState, useGlobalActions, useGlobalState] = createProvider(
        ({ initialSelection, initialConfig }) => {
          const [selection, setSelection] = p2(initialSelection);
          const [route, setRoute] = p2("index");
          const [config, setConfig] = p2(initialConfig);
          const [globalError, setGlobalError] = p2(
            void 0
          );
          h2(() => {
            return on("SELECTION_CHANGE", (data2) => {
              setSelection(data2);
            });
          }, []);
          h2(() => {
            return on("CONFIG_CHANGE", (data2) => {
              setConfig(data2);
            });
          }, []);
          F(() => {
            emit("RESIZE", PAGES[route]);
          }, [route]);
          function setLanguage(language) {
            emit("SET_LANGUAGE", language);
          }
          const data = {
            route,
            selection,
            config,
            globalError
          };
          const actions = {
            setRoute,
            setLanguage,
            setGlobalError
          };
          return [data, actions];
        }
      );
    }
  });

  // node_modules/use-sync-external-store/cjs/use-sync-external-store-shim.development.js
  var require_use_sync_external_store_shim_development = __commonJS({
    "node_modules/use-sync-external-store/cjs/use-sync-external-store-shim.development.js"(exports) {
      "use strict";
      if (true) {
        (function() {
          "use strict";
          if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ !== "undefined" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart === "function") {
            __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(new Error());
          }
          var React = (init_compat_module(), __toCommonJS(compat_module_exports));
          var ReactSharedInternals = React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
          function error(format) {
            {
              {
                for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
                  args[_key2 - 1] = arguments[_key2];
                }
                printWarning("error", format, args);
              }
            }
          }
          function printWarning(level, format, args) {
            {
              var ReactDebugCurrentFrame = ReactSharedInternals.ReactDebugCurrentFrame;
              var stack = ReactDebugCurrentFrame.getStackAddendum();
              if (stack !== "") {
                format += "%s";
                args = args.concat([stack]);
              }
              var argsWithFormat = args.map(function(item) {
                return String(item);
              });
              argsWithFormat.unshift("Warning: " + format);
              Function.prototype.apply.call(console[level], console, argsWithFormat);
            }
          }
          function is(x4, y3) {
            return x4 === y3 && (x4 !== 0 || 1 / x4 === 1 / y3) || x4 !== x4 && y3 !== y3;
          }
          var objectIs = typeof Object.is === "function" ? Object.is : is;
          var useState = React.useState, useEffect = React.useEffect, useLayoutEffect = React.useLayoutEffect, useDebugValue = React.useDebugValue;
          var didWarnOld18Alpha = false;
          var didWarnUncachedGetSnapshot = false;
          function useSyncExternalStore2(subscribe, getSnapshot, getServerSnapshot) {
            {
              if (!didWarnOld18Alpha) {
                if (React.startTransition !== void 0) {
                  didWarnOld18Alpha = true;
                  error("You are using an outdated, pre-release alpha of React 18 that does not support useSyncExternalStore. The use-sync-external-store shim will not work correctly. Upgrade to a newer pre-release.");
                }
              }
            }
            var value = getSnapshot();
            {
              if (!didWarnUncachedGetSnapshot) {
                var cachedValue = getSnapshot();
                if (!objectIs(value, cachedValue)) {
                  error("The result of getSnapshot should be cached to avoid an infinite loop");
                  didWarnUncachedGetSnapshot = true;
                }
              }
            }
            var _useState = useState({
              inst: {
                value,
                getSnapshot
              }
            }), inst = _useState[0].inst, forceUpdate = _useState[1];
            useLayoutEffect(function() {
              inst.value = value;
              inst.getSnapshot = getSnapshot;
              if (checkIfSnapshotChanged(inst)) {
                forceUpdate({
                  inst
                });
              }
            }, [subscribe, value, getSnapshot]);
            useEffect(function() {
              if (checkIfSnapshotChanged(inst)) {
                forceUpdate({
                  inst
                });
              }
              var handleStoreChange = function() {
                if (checkIfSnapshotChanged(inst)) {
                  forceUpdate({
                    inst
                  });
                }
              };
              return subscribe(handleStoreChange);
            }, [subscribe]);
            useDebugValue(value);
            return value;
          }
          function checkIfSnapshotChanged(inst) {
            var latestGetSnapshot = inst.getSnapshot;
            var prevValue = inst.value;
            try {
              var nextValue = latestGetSnapshot();
              return !objectIs(prevValue, nextValue);
            } catch (error2) {
              return true;
            }
          }
          function useSyncExternalStore$1(subscribe, getSnapshot, getServerSnapshot) {
            return getSnapshot();
          }
          var canUseDOM = !!(typeof window !== "undefined" && typeof window.document !== "undefined" && typeof window.document.createElement !== "undefined");
          var isServerEnvironment = !canUseDOM;
          var shim = isServerEnvironment ? useSyncExternalStore$1 : useSyncExternalStore2;
          var useSyncExternalStore$2 = React.useSyncExternalStore !== void 0 ? React.useSyncExternalStore : shim;
          exports.useSyncExternalStore = useSyncExternalStore$2;
          if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ !== "undefined" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop === "function") {
            __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(new Error());
          }
        })();
      }
    }
  });

  // node_modules/use-sync-external-store/shim/index.js
  var require_shim = __commonJS({
    "node_modules/use-sync-external-store/shim/index.js"(exports, module) {
      "use strict";
      if (false) {
        module.exports = null;
      } else {
        module.exports = require_use_sync_external_store_shim_development();
      }
    }
  });

  // node_modules/swr/_internal/dist/index.mjs
  async function internalMutate(...args) {
    const [cache2, _key, _data, _opts] = args;
    const options = mergeObjects({
      populateCache: true,
      throwOnError: true
    }, typeof _opts === "boolean" ? {
      revalidate: _opts
    } : _opts || {});
    let populateCache = options.populateCache;
    const rollbackOnErrorOption = options.rollbackOnError;
    let optimisticData = options.optimisticData;
    const revalidate = options.revalidate !== false;
    const rollbackOnError = (error) => {
      return typeof rollbackOnErrorOption === "function" ? rollbackOnErrorOption(error) : rollbackOnErrorOption !== false;
    };
    const throwOnError = options.throwOnError;
    if (isFunction(_key)) {
      const keyFilter = _key;
      const matchedKeys = [];
      const it = cache2.keys();
      for (let keyIt = it.next(); !keyIt.done; keyIt = it.next()) {
        const key = keyIt.value;
        if (!key.startsWith("$inf$") && keyFilter(cache2.get(key)._k)) {
          matchedKeys.push(key);
        }
      }
      return Promise.all(matchedKeys.map(mutateByKey));
    }
    return mutateByKey(_key);
    async function mutateByKey(_k) {
      const [key] = serialize(_k);
      if (!key)
        return;
      const [get, set] = createCacheHelper(cache2, key);
      const [EVENT_REVALIDATORS, MUTATION, FETCH] = SWRGlobalState.get(cache2);
      const revalidators = EVENT_REVALIDATORS[key];
      const startRevalidate = () => {
        if (revalidate) {
          delete FETCH[key];
          if (revalidators && revalidators[0]) {
            return revalidators[0](MUTATE_EVENT).then(() => get().data);
          }
        }
        return get().data;
      };
      if (args.length < 3) {
        return startRevalidate();
      }
      let data = _data;
      let error;
      const beforeMutationTs = getTimestamp();
      MUTATION[key] = [
        beforeMutationTs,
        0
      ];
      const hasOptimisticData = !isUndefined(optimisticData);
      const state = get();
      const displayedData = state.data;
      const currentData = state._c;
      const committedData = isUndefined(currentData) ? displayedData : currentData;
      if (hasOptimisticData) {
        optimisticData = isFunction(optimisticData) ? optimisticData(committedData) : optimisticData;
        set({
          data: optimisticData,
          _c: committedData
        });
      }
      if (isFunction(data)) {
        try {
          data = data(committedData);
        } catch (err) {
          error = err;
        }
      }
      if (data && isFunction(data.then)) {
        data = await data.catch((err) => {
          error = err;
        });
        if (beforeMutationTs !== MUTATION[key][0]) {
          if (error)
            throw error;
          return data;
        } else if (error && hasOptimisticData && rollbackOnError(error)) {
          populateCache = true;
          data = committedData;
          set({
            data,
            _c: UNDEFINED
          });
        }
      }
      if (populateCache) {
        if (!error) {
          if (isFunction(populateCache)) {
            data = populateCache(data, committedData);
          }
          set({
            data,
            _c: UNDEFINED
          });
        }
      }
      MUTATION[key][1] = getTimestamp();
      const res = await startRevalidate();
      set({
        _c: UNDEFINED
      });
      if (error) {
        if (throwOnError)
          throw error;
        return;
      }
      return populateCache ? res : data;
    }
  }
  var SWRGlobalState, EMPTY_CACHE, noop, UNDEFINED, OBJECT, isUndefined, isFunction, mergeObjects, STR_UNDEFINED, isWindowDefined, isDocumentDefined, hasRequestAnimationFrame, createCacheHelper, table, counter, stableHash, online, isOnline, onWindowEvent, offWindowEvent, isVisible, initFocus, initReconnect, preset, defaultConfigOptions, IS_REACT_LEGACY, IS_SERVER, rAF, useIsomorphicLayoutEffect, navigatorConnection, slowConnection, serialize, __timestamp, getTimestamp, FOCUS_EVENT, RECONNECT_EVENT, MUTATE_EVENT, constants, revalidateAllKeys, initCache, onErrorRetry, compare, cache, mutate, defaultConfig, mergeConfigs, SWRConfigContext, SWRConfig, enableDevtools, use, setupDevTools, normalize, useSWRConfig, middleware, BUILT_IN_MIDDLEWARE, withArgs, subscribeCallback;
  var init_dist = __esm({
    "node_modules/swr/_internal/dist/index.mjs"() {
      init_compat_module();
      SWRGlobalState = /* @__PURE__ */ new WeakMap();
      EMPTY_CACHE = {};
      noop = () => {
      };
      UNDEFINED = noop();
      OBJECT = Object;
      isUndefined = (v4) => v4 === UNDEFINED;
      isFunction = (v4) => typeof v4 == "function";
      mergeObjects = (a4, b3) => __spreadValues(__spreadValues({}, a4), b3);
      STR_UNDEFINED = "undefined";
      isWindowDefined = typeof window != STR_UNDEFINED;
      isDocumentDefined = typeof document != STR_UNDEFINED;
      hasRequestAnimationFrame = () => isWindowDefined && typeof window["requestAnimationFrame"] != STR_UNDEFINED;
      createCacheHelper = (cache2, key) => {
        const state = SWRGlobalState.get(cache2);
        return [
          () => cache2.get(key) || EMPTY_CACHE,
          (info) => {
            const prev = cache2.get(key);
            state[5](key, mergeObjects(prev, info), prev || EMPTY_CACHE);
          },
          state[6]
        ];
      };
      table = /* @__PURE__ */ new WeakMap();
      counter = 0;
      stableHash = (arg) => {
        const type = typeof arg;
        const constructor = arg && arg.constructor;
        const isDate = constructor == Date;
        let result;
        let index;
        if (OBJECT(arg) === arg && !isDate && constructor != RegExp) {
          result = table.get(arg);
          if (result)
            return result;
          result = ++counter + "~";
          table.set(arg, result);
          if (constructor == Array) {
            result = "@";
            for (index = 0; index < arg.length; index++) {
              result += stableHash(arg[index]) + ",";
            }
            table.set(arg, result);
          }
          if (constructor == OBJECT) {
            result = "#";
            const keys = OBJECT.keys(arg).sort();
            while (!isUndefined(index = keys.pop())) {
              if (!isUndefined(arg[index])) {
                result += index + ":" + stableHash(arg[index]) + ",";
              }
            }
            table.set(arg, result);
          }
        } else {
          result = isDate ? arg.toJSON() : type == "symbol" ? arg.toString() : type == "string" ? JSON.stringify(arg) : "" + arg;
        }
        return result;
      };
      online = true;
      isOnline = () => online;
      [onWindowEvent, offWindowEvent] = isWindowDefined && window.addEventListener ? [
        window.addEventListener.bind(window),
        window.removeEventListener.bind(window)
      ] : [
        noop,
        noop
      ];
      isVisible = () => {
        const visibilityState = isDocumentDefined && document.visibilityState;
        return isUndefined(visibilityState) || visibilityState !== "hidden";
      };
      initFocus = (callback) => {
        if (isDocumentDefined) {
          document.addEventListener("visibilitychange", callback);
        }
        onWindowEvent("focus", callback);
        return () => {
          if (isDocumentDefined) {
            document.removeEventListener("visibilitychange", callback);
          }
          offWindowEvent("focus", callback);
        };
      };
      initReconnect = (callback) => {
        const onOnline = () => {
          online = true;
          callback();
        };
        const onOffline = () => {
          online = false;
        };
        onWindowEvent("online", onOnline);
        onWindowEvent("offline", onOffline);
        return () => {
          offWindowEvent("online", onOnline);
          offWindowEvent("offline", onOffline);
        };
      };
      preset = {
        isOnline,
        isVisible
      };
      defaultConfigOptions = {
        initFocus,
        initReconnect
      };
      IS_REACT_LEGACY = !bn.useId;
      IS_SERVER = !isWindowDefined || "Deno" in window;
      rAF = (f4) => hasRequestAnimationFrame() ? window["requestAnimationFrame"](f4) : setTimeout(f4, 1);
      useIsomorphicLayoutEffect = IS_SERVER ? h2 : s2;
      navigatorConnection = typeof navigator !== "undefined" && navigator.connection;
      slowConnection = !IS_SERVER && navigatorConnection && ([
        "slow-2g",
        "2g"
      ].includes(navigatorConnection.effectiveType) || navigatorConnection.saveData);
      serialize = (key) => {
        if (isFunction(key)) {
          try {
            key = key();
          } catch (err) {
            key = "";
          }
        }
        const args = key;
        key = typeof key == "string" ? key : (Array.isArray(key) ? key.length : key) ? stableHash(key) : "";
        return [
          key,
          args
        ];
      };
      __timestamp = 0;
      getTimestamp = () => ++__timestamp;
      FOCUS_EVENT = 0;
      RECONNECT_EVENT = 1;
      MUTATE_EVENT = 2;
      constants = {
        __proto__: null,
        FOCUS_EVENT,
        RECONNECT_EVENT,
        MUTATE_EVENT
      };
      revalidateAllKeys = (revalidators, type) => {
        for (const key in revalidators) {
          if (revalidators[key][0])
            revalidators[key][0](type);
        }
      };
      initCache = (provider, options) => {
        if (!SWRGlobalState.has(provider)) {
          const opts = mergeObjects(defaultConfigOptions, options);
          const EVENT_REVALIDATORS = {};
          const mutate2 = internalMutate.bind(UNDEFINED, provider);
          let unmount = noop;
          const subscriptions = {};
          const subscribe = (key, callback) => {
            const subs = subscriptions[key] || [];
            subscriptions[key] = subs;
            subs.push(callback);
            return () => subs.splice(subs.indexOf(callback), 1);
          };
          const setter = (key, value, prev) => {
            provider.set(key, value);
            const subs = subscriptions[key];
            if (subs) {
              for (let i4 = subs.length; i4--; ) {
                subs[i4](prev, value);
              }
            }
          };
          const initProvider = () => {
            if (!SWRGlobalState.has(provider)) {
              SWRGlobalState.set(provider, [
                EVENT_REVALIDATORS,
                {},
                {},
                {},
                mutate2,
                setter,
                subscribe
              ]);
              if (!IS_SERVER) {
                const releaseFocus = opts.initFocus(setTimeout.bind(UNDEFINED, revalidateAllKeys.bind(UNDEFINED, EVENT_REVALIDATORS, FOCUS_EVENT)));
                const releaseReconnect = opts.initReconnect(setTimeout.bind(UNDEFINED, revalidateAllKeys.bind(UNDEFINED, EVENT_REVALIDATORS, RECONNECT_EVENT)));
                unmount = () => {
                  releaseFocus && releaseFocus();
                  releaseReconnect && releaseReconnect();
                  SWRGlobalState.delete(provider);
                };
              }
            }
          };
          initProvider();
          return [
            provider,
            mutate2,
            initProvider,
            unmount
          ];
        }
        return [
          provider,
          SWRGlobalState.get(provider)[4]
        ];
      };
      onErrorRetry = (_3, __, config, revalidate, opts) => {
        const maxRetryCount = config.errorRetryCount;
        const currentRetryCount = opts.retryCount;
        const timeout = ~~((Math.random() + 0.5) * (1 << (currentRetryCount < 8 ? currentRetryCount : 8))) * config.errorRetryInterval;
        if (!isUndefined(maxRetryCount) && currentRetryCount > maxRetryCount) {
          return;
        }
        setTimeout(revalidate, timeout, opts);
      };
      compare = (currentData, newData) => stableHash(currentData) == stableHash(newData);
      [cache, mutate] = initCache(/* @__PURE__ */ new Map());
      defaultConfig = mergeObjects(
        {
          onLoadingSlow: noop,
          onSuccess: noop,
          onError: noop,
          onErrorRetry,
          onDiscarded: noop,
          revalidateOnFocus: true,
          revalidateOnReconnect: true,
          revalidateIfStale: true,
          shouldRetryOnError: true,
          errorRetryInterval: slowConnection ? 1e4 : 5e3,
          focusThrottleInterval: 5 * 1e3,
          dedupingInterval: 2 * 1e3,
          loadingTimeout: slowConnection ? 5e3 : 3e3,
          compare,
          isPaused: () => false,
          cache,
          mutate,
          fallback: {}
        },
        preset
      );
      mergeConfigs = (a4, b3) => {
        const v4 = mergeObjects(a4, b3);
        if (b3) {
          const { use: u1, fallback: f1 } = a4;
          const { use: u22, fallback: f22 } = b3;
          if (u1 && u22) {
            v4.use = u1.concat(u22);
          }
          if (f1 && f22) {
            v4.fallback = mergeObjects(f1, f22);
          }
        }
        return v4;
      };
      SWRConfigContext = B({});
      SWRConfig = (props) => {
        const { value } = props;
        const parentConfig = q2(SWRConfigContext);
        const isFunctionalConfig = isFunction(value);
        const config = F(() => isFunctionalConfig ? value(parentConfig) : value, [
          isFunctionalConfig,
          parentConfig,
          value
        ]);
        const extendedConfig = F(() => isFunctionalConfig ? config : mergeConfigs(parentConfig, config), [
          isFunctionalConfig,
          parentConfig,
          config
        ]);
        const provider = config && config.provider;
        const [cacheContext] = p2(() => provider ? initCache(provider(extendedConfig.cache || cache), config) : UNDEFINED);
        if (cacheContext) {
          extendedConfig.cache = cacheContext[0];
          extendedConfig.mutate = cacheContext[1];
        }
        useIsomorphicLayoutEffect(() => {
          if (cacheContext) {
            cacheContext[2] && cacheContext[2]();
            return cacheContext[3];
          }
        }, []);
        return h(SWRConfigContext.Provider, mergeObjects(props, {
          value: extendedConfig
        }));
      };
      enableDevtools = isWindowDefined && window.__SWR_DEVTOOLS_USE__;
      use = enableDevtools ? window.__SWR_DEVTOOLS_USE__ : [];
      setupDevTools = () => {
        if (enableDevtools) {
          window.__SWR_DEVTOOLS_REACT__ = bn;
        }
      };
      normalize = (args) => {
        return isFunction(args[1]) ? [
          args[0],
          args[1],
          args[2] || {}
        ] : [
          args[0],
          null,
          (args[1] === null ? args[2] : args[1]) || {}
        ];
      };
      useSWRConfig = () => {
        return mergeObjects(defaultConfig, q2(SWRConfigContext));
      };
      middleware = (useSWRNext) => (key_, fetcher_, config) => {
        const fetcher = fetcher_ && ((...args) => {
          const key = serialize(key_)[0];
          const [, , , PRELOAD] = SWRGlobalState.get(cache);
          const req = PRELOAD[key];
          if (req) {
            delete PRELOAD[key];
            return req;
          }
          return fetcher_(...args);
        });
        return useSWRNext(key_, fetcher, config);
      };
      BUILT_IN_MIDDLEWARE = use.concat(middleware);
      withArgs = (hook) => {
        return function useSWRArgs(...args) {
          const fallbackConfig = useSWRConfig();
          const [key, fn2, _config] = normalize(args);
          const config = mergeConfigs(fallbackConfig, _config);
          let next = hook;
          const { use: use2 } = config;
          const middleware2 = (use2 || []).concat(BUILT_IN_MIDDLEWARE);
          for (let i4 = middleware2.length; i4--; ) {
            next = middleware2[i4](next);
          }
          return next(key, fn2 || config.fetcher || null, config);
        };
      };
      subscribeCallback = (key, callbacks, callback) => {
        const keyedRevalidators = callbacks[key] || (callbacks[key] = []);
        keyedRevalidators.push(callback);
        return () => {
          const index = keyedRevalidators.indexOf(callback);
          if (index >= 0) {
            keyedRevalidators[index] = keyedRevalidators[keyedRevalidators.length - 1];
            keyedRevalidators.pop();
          }
        };
      };
      setupDevTools();
    }
  });

  // node_modules/swr/core/dist/index.mjs
  var import_shim, WITH_DEDUPE, useSWRHandler, SWRConfig2, useSWR;
  var init_dist2 = __esm({
    "node_modules/swr/core/dist/index.mjs"() {
      init_compat_module();
      import_shim = __toESM(require_shim(), 1);
      init_dist();
      init_dist();
      WITH_DEDUPE = {
        dedupe: true
      };
      useSWRHandler = (_key, fetcher, config) => {
        const { cache: cache2, compare: compare2, suspense, fallbackData, revalidateOnMount, refreshInterval, refreshWhenHidden, refreshWhenOffline, keepPreviousData } = config;
        const [EVENT_REVALIDATORS, MUTATION, FETCH] = SWRGlobalState.get(cache2);
        const [key, fnArg] = serialize(_key);
        const initialMountedRef = _2(false);
        const unmountedRef = _2(false);
        const keyRef = _2(key);
        const fetcherRef = _2(fetcher);
        const configRef = _2(config);
        const getConfig = () => configRef.current;
        const isActive = () => getConfig().isVisible() && getConfig().isOnline();
        const [getCache, setCache, subscribeCache] = createCacheHelper(cache2, key);
        const stateDependencies = _2({}).current;
        const fallback = isUndefined(fallbackData) ? config.fallback[key] : fallbackData;
        const isEqual = (prev, current) => {
          let equal = true;
          for (const _3 in stateDependencies) {
            const t3 = _3;
            if (!compare2(current[t3], prev[t3])) {
              if (t3 === "data" && isUndefined(prev[t3])) {
                if (!compare2(current[t3], returnedData)) {
                  equal = false;
                }
              } else {
                equal = false;
              }
            }
          }
          return equal;
        };
        const getSnapshot = F(() => {
          const shouldStartRequest = (() => {
            if (!key)
              return false;
            if (!fetcher)
              return false;
            if (!isUndefined(revalidateOnMount))
              return revalidateOnMount;
            if (getConfig().isPaused())
              return false;
            if (suspense)
              return false;
            return true;
          })();
          const getSelectedCache = () => {
            const state = getCache();
            const snapshot = mergeObjects(state);
            delete snapshot._k;
            if (!shouldStartRequest) {
              return snapshot;
            }
            return __spreadValues({
              isValidating: true,
              isLoading: true
            }, snapshot);
          };
          let memorizedSnapshot = getSelectedCache();
          return () => {
            const snapshot = getSelectedCache();
            return isEqual(snapshot, memorizedSnapshot) ? memorizedSnapshot : memorizedSnapshot = snapshot;
          };
        }, [
          cache2,
          key
        ]);
        const cached = (0, import_shim.useSyncExternalStore)(T2(
          (callback) => subscribeCache(key, (prev, current) => {
            if (!isEqual(prev, current))
              callback();
          }),
          [
            cache2,
            key
          ]
        ), getSnapshot, getSnapshot);
        const isInitialMount = !initialMountedRef.current;
        const cachedData = cached.data;
        const data = isUndefined(cachedData) ? fallback : cachedData;
        const error = cached.error;
        const laggyDataRef = _2(data);
        const returnedData = keepPreviousData ? isUndefined(cachedData) ? laggyDataRef.current : cachedData : data;
        const shouldDoInitialRevalidation = (() => {
          if (isInitialMount && !isUndefined(revalidateOnMount))
            return revalidateOnMount;
          if (getConfig().isPaused())
            return false;
          if (suspense)
            return isUndefined(data) ? false : config.revalidateIfStale;
          return isUndefined(data) || config.revalidateIfStale;
        })();
        const defaultValidatingState = !!(key && fetcher && isInitialMount && shouldDoInitialRevalidation);
        const isValidating = isUndefined(cached.isValidating) ? defaultValidatingState : cached.isValidating;
        const isLoading = isUndefined(cached.isLoading) ? defaultValidatingState : cached.isLoading;
        const revalidate = T2(
          async (revalidateOpts) => {
            const currentFetcher = fetcherRef.current;
            if (!key || !currentFetcher || unmountedRef.current || getConfig().isPaused()) {
              return false;
            }
            let newData;
            let startAt;
            let loading = true;
            const opts = revalidateOpts || {};
            const shouldStartNewRequest = !FETCH[key] || !opts.dedupe;
            const callbackSafeguard = () => {
              if (IS_REACT_LEGACY) {
                return !unmountedRef.current && key === keyRef.current && initialMountedRef.current;
              }
              return key === keyRef.current;
            };
            const finalState = {
              isValidating: false,
              isLoading: false
            };
            const finishRequestAndUpdateState = () => {
              setCache(finalState);
            };
            const cleanupState = () => {
              const requestInfo = FETCH[key];
              if (requestInfo && requestInfo[1] === startAt) {
                delete FETCH[key];
              }
            };
            const initialState = {
              isValidating: true
            };
            if (isUndefined(getCache().data)) {
              initialState.isLoading = true;
            }
            try {
              if (shouldStartNewRequest) {
                setCache(initialState);
                if (config.loadingTimeout && isUndefined(getCache().data)) {
                  setTimeout(() => {
                    if (loading && callbackSafeguard()) {
                      getConfig().onLoadingSlow(key, config);
                    }
                  }, config.loadingTimeout);
                }
                FETCH[key] = [
                  currentFetcher(fnArg),
                  getTimestamp()
                ];
              }
              [newData, startAt] = FETCH[key];
              newData = await newData;
              if (shouldStartNewRequest) {
                setTimeout(cleanupState, config.dedupingInterval);
              }
              if (!FETCH[key] || FETCH[key][1] !== startAt) {
                if (shouldStartNewRequest) {
                  if (callbackSafeguard()) {
                    getConfig().onDiscarded(key);
                  }
                }
                return false;
              }
              finalState.error = UNDEFINED;
              const mutationInfo = MUTATION[key];
              if (!isUndefined(mutationInfo) && (startAt <= mutationInfo[0] || startAt <= mutationInfo[1] || mutationInfo[1] === 0)) {
                finishRequestAndUpdateState();
                if (shouldStartNewRequest) {
                  if (callbackSafeguard()) {
                    getConfig().onDiscarded(key);
                  }
                }
                return false;
              }
              const cacheData = getCache().data;
              finalState.data = compare2(cacheData, newData) ? cacheData : newData;
              if (shouldStartNewRequest) {
                if (callbackSafeguard()) {
                  getConfig().onSuccess(newData, key, config);
                }
              }
            } catch (err) {
              cleanupState();
              const currentConfig = getConfig();
              const { shouldRetryOnError } = currentConfig;
              if (!currentConfig.isPaused()) {
                finalState.error = err;
                if (shouldStartNewRequest && callbackSafeguard()) {
                  currentConfig.onError(err, key, currentConfig);
                  if (shouldRetryOnError === true || isFunction(shouldRetryOnError) && shouldRetryOnError(err)) {
                    if (isActive()) {
                      currentConfig.onErrorRetry(err, key, currentConfig, revalidate, {
                        retryCount: (opts.retryCount || 0) + 1,
                        dedupe: true
                      });
                    }
                  }
                }
              }
            }
            loading = false;
            finishRequestAndUpdateState();
            return true;
          },
          [
            key,
            cache2
          ]
        );
        const boundMutate = T2(
          (...args) => {
            return internalMutate(cache2, keyRef.current, ...args);
          },
          []
        );
        useIsomorphicLayoutEffect(() => {
          fetcherRef.current = fetcher;
          configRef.current = config;
          if (!isUndefined(cachedData)) {
            laggyDataRef.current = cachedData;
          }
        });
        useIsomorphicLayoutEffect(() => {
          if (!key)
            return;
          const softRevalidate = revalidate.bind(UNDEFINED, WITH_DEDUPE);
          let nextFocusRevalidatedAt = 0;
          const onRevalidate = (type) => {
            if (type == constants.FOCUS_EVENT) {
              const now = Date.now();
              if (getConfig().revalidateOnFocus && now > nextFocusRevalidatedAt && isActive()) {
                nextFocusRevalidatedAt = now + getConfig().focusThrottleInterval;
                softRevalidate();
              }
            } else if (type == constants.RECONNECT_EVENT) {
              if (getConfig().revalidateOnReconnect && isActive()) {
                softRevalidate();
              }
            } else if (type == constants.MUTATE_EVENT) {
              return revalidate();
            }
            return;
          };
          const unsubEvents = subscribeCallback(key, EVENT_REVALIDATORS, onRevalidate);
          unmountedRef.current = false;
          keyRef.current = key;
          initialMountedRef.current = true;
          setCache({
            _k: fnArg
          });
          if (shouldDoInitialRevalidation) {
            if (isUndefined(data) || IS_SERVER) {
              softRevalidate();
            } else {
              rAF(softRevalidate);
            }
          }
          return () => {
            unmountedRef.current = true;
            unsubEvents();
          };
        }, [
          key
        ]);
        useIsomorphicLayoutEffect(() => {
          let timer;
          function next() {
            const interval = isFunction(refreshInterval) ? refreshInterval(data) : refreshInterval;
            if (interval && timer !== -1) {
              timer = setTimeout(execute, interval);
            }
          }
          function execute() {
            if (!getCache().error && (refreshWhenHidden || getConfig().isVisible()) && (refreshWhenOffline || getConfig().isOnline())) {
              revalidate(WITH_DEDUPE).then(next);
            } else {
              next();
            }
          }
          next();
          return () => {
            if (timer) {
              clearTimeout(timer);
              timer = -1;
            }
          };
        }, [
          refreshInterval,
          refreshWhenHidden,
          refreshWhenOffline,
          key
        ]);
        x2(returnedData);
        if (suspense && isUndefined(data) && key) {
          if (!IS_REACT_LEGACY && IS_SERVER) {
            throw new Error("Fallback data is required when using suspense in SSR.");
          }
          fetcherRef.current = fetcher;
          configRef.current = config;
          unmountedRef.current = false;
          throw isUndefined(error) ? revalidate(WITH_DEDUPE) : error;
        }
        return {
          mutate: boundMutate,
          get data() {
            stateDependencies.data = true;
            return returnedData;
          },
          get error() {
            stateDependencies.error = true;
            return error;
          },
          get isValidating() {
            stateDependencies.isValidating = true;
            return isValidating;
          },
          get isLoading() {
            stateDependencies.isLoading = true;
            return isLoading;
          }
        };
      };
      SWRConfig2 = OBJECT.defineProperty(SWRConfig, "defaultValue", {
        value: defaultConfig
      });
      useSWR = withArgs(useSWRHandler);
    }
  });

  // ../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/4e97c4f5-75bc-40d6-9daa-44d90eaf08d9/HeadingTab.js
  var HeadingTab_default;
  var init_HeadingTab = __esm({
    "../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/4e97c4f5-75bc-40d6-9daa-44d90eaf08d9/HeadingTab.js"() {
      if (document.getElementById("617685254d") === null) {
        const element = document.createElement("style");
        element.id = "617685254d";
        element.textContent = `._container_i57p0_1 {
  cursor: pointer;
  padding: 10px;
}

._container_i57p0_1:hover {
  color: var(--figma-color-text) !important;
}

/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9zZXR1cC9jb21wb25lbnRzL0hlYWRpbmdUYWIvSGVhZGluZ1RhYi5jc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFDRSxlQUFlO0VBQ2YsYUFBYTtBQUNmOztBQUVBO0VBQ0UseUNBQXlDO0FBQzNDIiwiZmlsZSI6InNyYy9zZXR1cC9jb21wb25lbnRzL0hlYWRpbmdUYWIvSGVhZGluZ1RhYi5jc3MiLCJzb3VyY2VzQ29udGVudCI6WyIuY29udGFpbmVyIHtcbiAgY3Vyc29yOiBwb2ludGVyO1xuICBwYWRkaW5nOiAxMHB4O1xufVxuXG4uY29udGFpbmVyOmhvdmVyIHtcbiAgY29sb3I6IHZhcigtLWZpZ21hLWNvbG9yLXRleHQpICFpbXBvcnRhbnQ7XG59XG4iXX0= */`;
        document.head.append(element);
      }
      HeadingTab_default = { "container": "_container_i57p0_1" };
    }
  });

  // src/setup/components/HeadingTab/HeadingTab.tsx
  var HeadingTab;
  var init_HeadingTab2 = __esm({
    "src/setup/components/HeadingTab/HeadingTab.tsx"() {
      "use strict";
      init_preact_module();
      init_HeadingTab();
      HeadingTab = ({ name, route, currentRoute, onChange }) => {
        return /* @__PURE__ */ h("div", {
          className: HeadingTab_default.container,
          style: {
            color: route === currentRoute ? "var(--figma-color-text)" : "var(--figma-color-text-secondary)"
          },
          onClick: () => onChange(route)
        }, name);
      };
    }
  });

  // ../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/d22d6e6a-5648-4668-b14b-cee8f63749cf/TopBar.js
  var TopBar_default;
  var init_TopBar = __esm({
    "../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/d22d6e6a-5648-4668-b14b-cee8f63749cf/TopBar.js"() {
      if (document.getElementById("f0da42e164") === null) {
        const element = document.createElement("style");
        element.id = "f0da42e164";
        element.textContent = `._container_1lpp9_1 {
  display: flex;
  justify-content: space-between;
  margin: 0px -10px;
}

._languageContainer_1lpp9_7 {
  display: flex;
  margin: 5px 0px;
}

._tabsContainerLeft_1lpp9_12 {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
}

/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9zZXR1cC92aWV3cy9JbmRleC9Ub3BCYXIvVG9wQmFyLmNzcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUNFLGFBQWE7RUFDYiw4QkFBOEI7RUFDOUIsaUJBQWlCO0FBQ25COztBQUVBO0VBQ0UsYUFBYTtFQUNiLGVBQWU7QUFDakI7O0FBRUE7RUFDRSxhQUFhO0VBQ2IseUJBQXlCO0VBQ3pCLFNBQVM7QUFDWCIsImZpbGUiOiJzcmMvc2V0dXAvdmlld3MvSW5kZXgvVG9wQmFyL1RvcEJhci5jc3MiLCJzb3VyY2VzQ29udGVudCI6WyIuY29udGFpbmVyIHtcbiAgZGlzcGxheTogZmxleDtcbiAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xuICBtYXJnaW46IDBweCAtMTBweDtcbn1cblxuLmxhbmd1YWdlQ29udGFpbmVyIHtcbiAgZGlzcGxheTogZmxleDtcbiAgbWFyZ2luOiA1cHggMHB4O1xufVxuXG4udGFic0NvbnRhaW5lckxlZnQge1xuICBkaXNwbGF5OiBmbGV4O1xuICBqdXN0aWZ5LWNvbnRlbnQ6IGZsZXgtZW5kO1xuICBnYXA6IDE2cHg7XG59XG4iXX0= */`;
        document.head.append(element);
      }
      TopBar_default = { "container": "_container_1lpp9_1", "languageContainer": "_languageContainer_1lpp9_7", "tabsContainerLeft": "_tabsContainerLeft_1lpp9_12" };
    }
  });

  // src/setup/views/Index/TopBar/TopBar.tsx
  var TopBar;
  var init_TopBar2 = __esm({
    "src/setup/views/Index/TopBar/TopBar.tsx"() {
      "use strict";
      init_preact_module();
      init_HeadingTab2();
      init_GlobalState();
      init_TopBar();
      TopBar = ({ languages }) => {
        var _a;
        const language = useGlobalState((c3) => {
          var _a2;
          return (_a2 = c3.config) == null ? void 0 : _a2.lang;
        }) || ((_a = languages == null ? void 0 : languages[0]) == null ? void 0 : _a.tag) || "";
        const { setLanguage } = useGlobalActions();
        const route = useGlobalState((c3) => c3.route);
        const { setRoute } = useGlobalActions();
        const handleRouteChange = (route2) => {
          setRoute(route2);
        };
        return /* @__PURE__ */ h("div", {
          className: TopBar_default.container
        }, /* @__PURE__ */ h("div", {
          className: TopBar_default.languageContainer
        }, languages && /* @__PURE__ */ h("select", {
          value: language,
          placeholder: "Language",
          onChange: (e3) => {
            setLanguage(e3.target.value);
          }
        }, languages.map((l3) => /* @__PURE__ */ h("option", {
          key: l3.tag,
          value: l3.tag
        }, l3.name)))), /* @__PURE__ */ h("div", {
          className: TopBar_default.tabsContainerLeft
        }, /* @__PURE__ */ h(HeadingTab, {
          name: "Settings",
          route: "settings",
          currentRoute: route,
          onChange: handleRouteChange
        })));
      };
    }
  });

  // src/setup/views/Index/Index.tsx
  var Index;
  var init_Index = __esm({
    "src/setup/views/Index/Index.tsx"() {
      "use strict";
      init_lib2();
      init_preact_module();
      init_dist2();
      init_GlobalState();
      init_TopBar2();
      Index = () => {
        var _a;
        const selection = useGlobalState((c3) => c3.selection);
        const { data: languageData, isLoading } = useSWR("/v2/projects/languages");
        const languages = (_a = languageData == null ? void 0 : languageData._embedded) == null ? void 0 : _a.languages;
        if (isLoading) {
          return /* @__PURE__ */ h(MiddleAlign, null, /* @__PURE__ */ h(LoadingIndicator, null));
        }
        return /* @__PURE__ */ h(Container, {
          space: "medium"
        }, /* @__PURE__ */ h(TopBar, {
          languages
        }), /* @__PURE__ */ h(VerticalSpace, {
          space: "large"
        }), !(selection == null ? void 0 : selection.length) && /* @__PURE__ */ h(Text, null, "No nodes selected"), selection == null ? void 0 : selection.map((node) => /* @__PURE__ */ h(p, {
          key: node.id
        }, /* @__PURE__ */ h(Text, null, node.id, ": ", node.name), /* @__PURE__ */ h(VerticalSpace, {
          space: "medium"
        }))));
      };
    }
  });

  // ../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/786ac078-36e9-448b-bc60-92a5398ee61a/Settings.js
  var Settings_default;
  var init_Settings = __esm({
    "../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/786ac078-36e9-448b-bc60-92a5398ee61a/Settings.js"() {
      if (document.getElementById("fa1f875d10") === null) {
        const element = document.createElement("style");
        element.id = "fa1f875d10";
        element.textContent = `._controlsContainer_jr4v9_1 {
  display: flex;
  bottom: 12px;
  position: absolute;
  left: 12px;
  right: 12px;
  gap: 8px;
}

/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9zZXR1cC92aWV3cy9TZXR0aW5ncy9TZXR0aW5ncy5jc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFDRSxhQUFhO0VBQ2IsWUFBWTtFQUNaLGtCQUFrQjtFQUNsQixVQUFVO0VBQ1YsV0FBVztFQUNYLFFBQVE7QUFDViIsImZpbGUiOiJzcmMvc2V0dXAvdmlld3MvU2V0dGluZ3MvU2V0dGluZ3MuY3NzIiwic291cmNlc0NvbnRlbnQiOlsiLmNvbnRyb2xzQ29udGFpbmVyIHtcbiAgZGlzcGxheTogZmxleDtcbiAgYm90dG9tOiAxMnB4O1xuICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gIGxlZnQ6IDEycHg7XG4gIHJpZ2h0OiAxMnB4O1xuICBnYXA6IDhweDtcbn1cbiJdfQ== */`;
        document.head.append(element);
      }
      Settings_default = { "controlsContainer": "_controlsContainer_jr4v9_1" };
    }
  });

  // src/setup/views/Settings/Settings.tsx
  var Settings;
  var init_Settings2 = __esm({
    "src/setup/views/Settings/Settings.tsx"() {
      "use strict";
      init_hooks_module();
      init_lib2();
      init_preact_module();
      init_lib();
      init_dist2();
      init_Settings();
      init_GlobalState();
      Settings = () => {
        var _a, _b;
        const config = useGlobalState((c3) => c3.config) || {};
        const [tolgeeConfig, setTolgeeConfig] = p2(config != null ? config : {});
        const [isLoading, setIsLoading] = p2(false);
        const { fetcher } = useSWRConfig();
        const { setRoute } = useGlobalActions();
        const [error, setError] = p2();
        h2(() => {
          setError(void 0);
        }, [tolgeeConfig]);
        const validateTolgeeCredentials = async () => {
          var _a2;
          setIsLoading(true);
          try {
            const res = await fetcher("/v2/api-keys/current", {
              headers: { "x-api-key": tolgeeConfig.apiKey },
              baseUrl: tolgeeConfig.url
            });
            if (res && ((_a2 = res.scopes) == null ? void 0 : _a2.includes("translations.view"))) {
              return true;
            } else if (res) {
              throw new Error(
                "Missing token scopes. The token should have translations.view and translations.edit scopes."
              );
            } else {
              throw new Error("Wrong credentials");
            }
          } catch (_3) {
            throw new Error("Invalid values. Please check the entered values");
          } finally {
            setIsLoading(false);
          }
        };
        const handleSubmit = async () => {
          if (!tolgeeConfig.apiKey) {
            setError("Missing API key");
            return;
          } else if (!tolgeeConfig.url) {
            setError("Missing API url");
            return;
          }
          try {
            await validateTolgeeCredentials();
            emit("SETUP", __spreadValues({}, tolgeeConfig));
            setRoute("index");
          } catch (e3) {
            setError(e3.message);
          }
        };
        const handleClose = T2(function() {
          setRoute("index");
        }, []);
        return /* @__PURE__ */ h(Container, {
          space: "medium"
        }, /* @__PURE__ */ h(VerticalSpace, {
          space: "large"
        }), /* @__PURE__ */ h(Text, null, /* @__PURE__ */ h(Muted, null, "Tolgee URL")), /* @__PURE__ */ h(VerticalSpace, {
          space: "small"
        }), /* @__PURE__ */ h(Textbox, {
          onValueInput: (url) => setTolgeeConfig(__spreadProps(__spreadValues({}, tolgeeConfig), { url })),
          value: (_a = tolgeeConfig.url) != null ? _a : "",
          variant: "border"
        }), /* @__PURE__ */ h(VerticalSpace, {
          space: "medium"
        }), /* @__PURE__ */ h(Text, null, /* @__PURE__ */ h(Muted, null, "Tolgee API key")), /* @__PURE__ */ h(VerticalSpace, {
          space: "small"
        }), /* @__PURE__ */ h(Textbox, {
          onValueInput: (apiKey) => setTolgeeConfig(__spreadProps(__spreadValues({}, tolgeeConfig), { apiKey })),
          value: (_b = tolgeeConfig.apiKey) != null ? _b : "",
          variant: "border"
        }), /* @__PURE__ */ h(VerticalSpace, {
          space: "medium"
        }), isLoading ? /* @__PURE__ */ h(LoadingIndicator, null) : error ? /* @__PURE__ */ h(Banner, {
          icon: /* @__PURE__ */ h(IconWarning32, null)
        }, error) : null, /* @__PURE__ */ h(VerticalSpace, {
          space: "extraLarge"
        }), !isLoading && /* @__PURE__ */ h(Columns, {
          space: "extraSmall",
          className: Settings_default.controlsContainer
        }, /* @__PURE__ */ h(Button, {
          fullWidth: true,
          onClick: handleSubmit
        }, "Save"), /* @__PURE__ */ h(Button, {
          fullWidth: true,
          onClick: handleClose,
          secondary: true
        }, "Close")), /* @__PURE__ */ h(VerticalSpace, {
          space: "small"
        }));
      };
    }
  });

  // src/setup/views/Router.tsx
  var getRoute, Router;
  var init_Router = __esm({
    "src/setup/views/Router.tsx"() {
      "use strict";
      init_preact_module();
      init_lib2();
      init_Index();
      init_Settings2();
      init_GlobalState();
      getRoute = (route) => {
        switch (route) {
          case "index":
            return /* @__PURE__ */ h(Index, null);
          case "settings":
            return /* @__PURE__ */ h(Settings, null);
        }
      };
      Router = () => {
        const route = useGlobalState((c3) => c3.route);
        const globalError = useGlobalState((c3) => c3.globalError);
        const { setRoute, setGlobalError } = useGlobalActions();
        const handleResolveError = () => {
          setGlobalError(void 0);
          setRoute("settings");
        };
        return /* @__PURE__ */ h(p, null, globalError && /* @__PURE__ */ h(Banner, {
          onClick: handleResolveError,
          icon: /* @__PURE__ */ h(IconWarning32, null)
        }, globalError), getRoute(route));
      };
    }
  });

  // src/setup/ui.tsx
  var ui_exports = {};
  __export(ui_exports, {
    default: () => ui_default
  });
  function Plugin({ config, nodes }) {
    return /* @__PURE__ */ h(GlobalState, {
      initialSelection: nodes,
      initialConfig: config
    }, /* @__PURE__ */ h(SWRConfigProvider, null, /* @__PURE__ */ h(Router, null)));
  }
  var SWRConfigProvider, ui_default;
  var init_ui = __esm({
    "src/setup/ui.tsx"() {
      "use strict";
      init_lib2();
      init_preact_module();
      init_styles();
      init_GlobalState();
      init_Router();
      init_dist2();
      SWRConfigProvider = ({ children }) => {
        const config = useGlobalState((c3) => c3.config);
        const { setGlobalError } = useGlobalActions();
        const swrConfig = {
          refreshInterval: 0,
          dedupingInterval: 0,
          fetcher: async (resource, init) => {
            const baseUrl = (init == null ? void 0 : init.baseUrl) || (config == null ? void 0 : config.url);
            const url = ((baseUrl == null ? void 0 : baseUrl.endsWith("/")) ? baseUrl == null ? void 0 : baseUrl.slice(0, -1) : baseUrl) + resource;
            const headers = __spreadValues({
              "x-api-key": config == null ? void 0 : config.apiKey,
              "content-type": "application/json"
            }, init == null ? void 0 : init.headers);
            const response = await fetch(url, __spreadProps(__spreadValues({}, init), { headers }));
            if (response.status === 401) {
              setGlobalError("Invalid Tolgee API key");
            } else if (!response.ok) {
              setGlobalError(response.statusText);
            } else {
              return response.json();
            }
          }
        };
        return /* @__PURE__ */ h(SWRConfig2, {
          value: swrConfig
        }, children);
      };
      ui_default = render(Plugin);
    }
  });

  // <stdin>
  var rootNode = document.getElementById("create-figma-plugin");
  var modules = { "src/setup/main.ts--default": (init_ui(), __toCommonJS(ui_exports))["default"] };
  var commandId = __FIGMA_COMMAND__ === "" ? "src/setup/main.ts--default" : __FIGMA_COMMAND__;
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
/**
 * @license React
 * use-sync-external-store-shim.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
