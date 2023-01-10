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
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
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
    var h4, y3, d4, k3, b3, g4, w4, x4 = i4 && i4.__k || e, C3 = x4.length;
    for (u3.__k = [], h4 = 0; h4 < l3.length; h4++)
      if (null != (k3 = u3.__k[h4] = null == (k3 = l3[h4]) || "boolean" == typeof k3 ? null : "string" == typeof k3 || "number" == typeof k3 || "bigint" == typeof k3 ? v(null, k3, null, null, k3) : Array.isArray(k3) ? v(p, { children: k3 }, null, null, null) : k3.__b > 0 ? v(k3.type, k3.props, k3.key, k3.ref ? k3.ref : null, k3.__v) : k3)) {
        if (k3.__ = u3, k3.__b = u3.__b + 1, null === (d4 = x4[h4]) || d4 && k3.key == d4.key && k3.type === d4.type)
          x4[h4] = void 0;
        else
          for (y3 = 0; y3 < C3; y3++) {
            if ((d4 = x4[y3]) && k3.key == d4.key && k3.type === d4.type) {
              x4[y3] = void 0;
              break;
            }
            d4 = null;
          }
        j(n2, k3, d4 = d4 || f, t3, o3, r3, c3, s3, a4), b3 = k3.__e, (y3 = k3.ref) && d4.ref != y3 && (w4 || (w4 = []), d4.ref && w4.push(d4.ref, null, k3), w4.push(y3, k3.__c || b3, k3)), null != b3 ? (null == g4 && (g4 = b3), "function" == typeof k3.type && k3.__k === d4.__k ? k3.__d = s3 = m(k3, s3, n2) : s3 = A(n2, k3, d4, x4, b3, s3), "function" == typeof u3.type && (u3.__d = s3)) : s3 && d4.__e == s3 && s3.parentNode != n2 && (s3 = _(d4));
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
    var a4, h4, v4, y3, _3, k3, b3, g4, m3, x4, A3, C3, $2, H3, I3, T4 = u3.type;
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
              }), A3 = 0; A3 < h4._sb.length; A3++)
                h4.__h.push(h4._sb[A3]);
              h4._sb = [], h4.__h.length && f4.push(h4);
              break n;
            }
            null != h4.componentWillUpdate && h4.componentWillUpdate(g4, h4.__s, x4), null != h4.componentDidUpdate && h4.__h.push(function() {
              h4.componentDidUpdate(y3, _3, k3);
            });
          }
          if (h4.context = x4, h4.props = g4, h4.__v = u3, h4.__P = n2, C3 = l.__r, $2 = 0, "prototype" in T4 && T4.prototype.render) {
            for (h4.state = h4.__s, h4.__d = false, C3 && C3(u3), a4 = h4.render(h4.props, h4.state, h4.context), H3 = 0; H3 < h4._sb.length; H3++)
              h4.__h.push(h4._sb[H3]);
            h4._sb = [];
          } else
            do {
              h4.__d = false, C3 && C3(u3), a4 = h4.render(h4.props, h4.state, h4.context), h4.state = h4.__s;
            } while (h4.__d && ++$2 < 25);
          h4.state = h4.__s, null != h4.getChildContext && (t3 = s(s({}, t3), h4.getChildContext())), v4 || null == h4.getSnapshotBeforeUpdate || (k3 = h4.getSnapshotBeforeUpdate(y3, _3)), I3 = null != a4 && a4.type === p && null == a4.key ? a4.props.children : a4, w(n2, Array.isArray(I3) ? I3 : [I3], u3, i4, t3, o3, r3, f4, e3, c3), h4.base = u3.__e, u3.__h = null, h4.__h.length && f4.push(h4), b3 && (h4.__E = h4.__ = null), h4.__e = false;
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
    var s3, h4, v4, y3 = i4.props, p4 = u3.props, d4 = u3.type, k3 = 0;
    if ("svg" === d4 && (o3 = true), null != r3) {
      for (; k3 < r3.length; k3++)
        if ((s3 = r3[k3]) && "setAttribute" in s3 == !!d4 && (d4 ? s3.localName === d4 : 3 === s3.nodeType)) {
          l3 = s3, r3[k3] = null;
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
          for (y3 = {}, k3 = 0; k3 < l3.attributes.length; k3++)
            y3[l3.attributes[k3].name] = l3.attributes[k3].value;
        (v4 || h4) && (v4 && (h4 && v4.__html == h4.__html || v4.__html === l3.innerHTML) || (l3.innerHTML = v4 && v4.__html || ""));
      }
      if (C(l3, p4, y3, o3, c3), v4)
        u3.__k = [];
      else if (k3 = u3.props.children, w(l3, Array.isArray(k3) ? k3 : [k3], u3, i4, t3, o3 && "foreignObject" !== d4, r3, e3, r3 ? r3[0] : i4.__k && _(i4, 0), c3), null != r3)
        for (k3 = r3.length; k3--; )
          null != r3[k3] && a(r3[k3]);
      c3 || ("value" in p4 && void 0 !== (k3 = p4.value) && (k3 !== l3.value || "progress" === d4 && !k3 || "option" === d4 && k3 !== y3.value) && H(l3, "value", k3, y3.value, false), "checked" in p4 && void 0 !== (k3 = p4.checked) && k3 !== l3.checked && H(l3, "checked", k3, y3.checked, false));
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

  // ../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/33a16b21-226c-4bff-8f6b-654b78005dbb/banner.js
  var banner_default;
  var init_banner = __esm({
    "../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/33a16b21-226c-4bff-8f6b-654b78005dbb/banner.js"() {
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
    return o2 = 1, y(B2, n2);
  }
  function y(n2, u3, i4) {
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
  function F(n2, r3) {
    var u3 = d2(t2++, 7);
    return z2(u3.__H, r3) ? (u3.__V = n2(), u3.i = r3, u3.__h = n2, u3.__V) : u3.__;
  }
  function T2(n2, t3) {
    return o2 = 8, F(function() {
      return n2;
    }, t3);
  }
  function q(n2) {
    var u3 = r2.context[n2.__c], i4 = d2(t2++, 9);
    return i4.c = n2, u3 ? (null == i4.__ && (i4.__ = true, u3.sub(r2)), u3.props.value) : n2.__;
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

  // ../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/c766a58a-12f7-4763-93bd-1cab4216e3ee/loading-indicator.js
  var loading_indicator_default;
  var init_loading_indicator = __esm({
    "../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/c766a58a-12f7-4763-93bd-1cab4216e3ee/loading-indicator.js"() {
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

  // ../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/a6b2554e-cf30-4885-84b0-cb357a514af3/button.js
  var button_default;
  var init_button = __esm({
    "../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/a6b2554e-cf30-4885-84b0-cb357a514af3/button.js"() {
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

  // ../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/34504fd5-ee4e-4b8b-9981-97a6117394d2/icon.js
  var icon_default;
  var init_icon = __esm({
    "../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/34504fd5-ee4e-4b8b-9981-97a6117394d2/icon.js"() {
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

  // node_modules/@create-figma-plugin/ui/lib/icons/icon-16/icon-caret-right-16.js
  var IconCaretRight16;
  var init_icon_caret_right_16 = __esm({
    "node_modules/@create-figma-plugin/ui/lib/icons/icon-16/icon-caret-right-16.js"() {
      init_create_icon();
      IconCaretRight16 = createIcon("M12 8 8 5v6l4-3Z", {
        height: 16,
        width: 16
      });
    }
  });

  // ../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/c123a488-430e-42a6-9328-4b37a4fcf497/disclosure.js
  var disclosure_default;
  var init_disclosure = __esm({
    "../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/c123a488-430e-42a6-9328-4b37a4fcf497/disclosure.js"() {
      if (document.getElementById("c4ba35c0c8") === null) {
        const element = document.createElement("style");
        element.id = "c4ba35c0c8";
        element.textContent = `._label_ekvh7_1 {
  position: relative;
}

._input_ekvh7_5 {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}

._title_ekvh7_13,
._children_ekvh7_14 {
  padding: var(--space-extra-small) var(--space-small) var(--space-extra-small)
    var(--space-large);
}

._title_ekvh7_13 {
  position: relative;
  color: var(--figma-color-text);
  font-weight: var(--font-weight-bold);
}
._title_ekvh7_13:hover,
._input_ekvh7_5:focus ~ ._title_ekvh7_13 {
  background-color: var(--figma-color-bg-hover);
}

._icon_ekvh7_29 {
  position: absolute;
  top: var(--space-extra-small);
  left: 0;
  color: var(--figma-color-icon);
}
._input_ekvh7_5:checked ~ ._title_ekvh7_13 ._icon_ekvh7_29 {
  top: calc(var(--space-extra-small) - 2px);
  left: 2px;
  transform: rotate(90deg);
}

._children_ekvh7_14 {
  color: var(--figma-color-text);
}

/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9AY3JlYXRlLWZpZ21hLXBsdWdpbi91aS9saWIvY29tcG9uZW50cy9kaXNjbG9zdXJlL2Rpc2Nsb3N1cmUuY3NzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQ0Usa0JBQWtCO0FBQ3BCOztBQUVBO0VBQ0Usa0JBQWtCO0VBQ2xCLE1BQU07RUFDTixRQUFRO0VBQ1IsU0FBUztFQUNULE9BQU87QUFDVDs7QUFFQTs7RUFFRTtzQkFDb0I7QUFDdEI7O0FBRUE7RUFDRSxrQkFBa0I7RUFDbEIsOEJBQThCO0VBQzlCLG9DQUFvQztBQUN0QztBQUNBOztFQUVFLDZDQUE2QztBQUMvQzs7QUFFQTtFQUNFLGtCQUFrQjtFQUNsQiw2QkFBNkI7RUFDN0IsT0FBTztFQUNQLDhCQUE4QjtBQUNoQztBQUNBO0VBQ0UseUNBQXlDO0VBQ3pDLFNBQVM7RUFDVCx3QkFBd0I7QUFDMUI7O0FBRUE7RUFDRSw4QkFBOEI7QUFDaEMiLCJmaWxlIjoibm9kZV9tb2R1bGVzL0BjcmVhdGUtZmlnbWEtcGx1Z2luL3VpL2xpYi9jb21wb25lbnRzL2Rpc2Nsb3N1cmUvZGlzY2xvc3VyZS5jc3MiLCJzb3VyY2VzQ29udGVudCI6WyIubGFiZWwge1xuICBwb3NpdGlvbjogcmVsYXRpdmU7XG59XG5cbi5pbnB1dCB7XG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgdG9wOiAwO1xuICByaWdodDogMDtcbiAgYm90dG9tOiAwO1xuICBsZWZ0OiAwO1xufVxuXG4udGl0bGUsXG4uY2hpbGRyZW4ge1xuICBwYWRkaW5nOiB2YXIoLS1zcGFjZS1leHRyYS1zbWFsbCkgdmFyKC0tc3BhY2Utc21hbGwpIHZhcigtLXNwYWNlLWV4dHJhLXNtYWxsKVxuICAgIHZhcigtLXNwYWNlLWxhcmdlKTtcbn1cblxuLnRpdGxlIHtcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xuICBjb2xvcjogdmFyKC0tZmlnbWEtY29sb3ItdGV4dCk7XG4gIGZvbnQtd2VpZ2h0OiB2YXIoLS1mb250LXdlaWdodC1ib2xkKTtcbn1cbi50aXRsZTpob3Zlcixcbi5pbnB1dDpmb2N1cyB+IC50aXRsZSB7XG4gIGJhY2tncm91bmQtY29sb3I6IHZhcigtLWZpZ21hLWNvbG9yLWJnLWhvdmVyKTtcbn1cblxuLmljb24ge1xuICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gIHRvcDogdmFyKC0tc3BhY2UtZXh0cmEtc21hbGwpO1xuICBsZWZ0OiAwO1xuICBjb2xvcjogdmFyKC0tZmlnbWEtY29sb3ItaWNvbik7XG59XG4uaW5wdXQ6Y2hlY2tlZCB+IC50aXRsZSAuaWNvbiB7XG4gIHRvcDogY2FsYyh2YXIoLS1zcGFjZS1leHRyYS1zbWFsbCkgLSAycHgpO1xuICBsZWZ0OiAycHg7XG4gIHRyYW5zZm9ybTogcm90YXRlKDkwZGVnKTtcbn1cblxuLmNoaWxkcmVuIHtcbiAgY29sb3I6IHZhcigtLWZpZ21hLWNvbG9yLXRleHQpO1xufVxuIl19 */`;
        document.head.append(element);
      }
      disclosure_default = { "label": "_label_ekvh7_1", "input": "_input_ekvh7_5", "title": "_title_ekvh7_13", "children": "_children_ekvh7_14", "icon": "_icon_ekvh7_29" };
    }
  });

  // node_modules/@create-figma-plugin/ui/lib/components/disclosure/disclosure.js
  function Disclosure(_a) {
    var _b = _a, { children, onClick, open, propagateEscapeKeyDown = true, title } = _b, rest = __objRest(_b, ["children", "onClick", "open", "propagateEscapeKeyDown", "title"]);
    const handleKeyDown = T2(function(event) {
      if (event.key !== "Escape") {
        return;
      }
      if (propagateEscapeKeyDown === false) {
        event.stopPropagation();
      }
      event.currentTarget.blur();
    }, [propagateEscapeKeyDown]);
    return h(p, null, h("label", { class: disclosure_default.label }, h("input", __spreadProps(__spreadValues({}, rest), { checked: open === true, class: disclosure_default.input, onClick, onKeyDown: handleKeyDown, tabIndex: 0, type: "checkbox" })), h("div", { class: disclosure_default.title }, h("div", { class: disclosure_default.icon }, h(IconCaretRight16, null)), title)), open === true ? h("div", { class: disclosure_default.children }, children) : null);
  }
  var init_disclosure2 = __esm({
    "node_modules/@create-figma-plugin/ui/lib/components/disclosure/disclosure.js"() {
      init_preact_module();
      init_hooks_module();
      init_icon_caret_right_16();
      init_disclosure();
    }
  });

  // ../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/bdedc512-223c-4a24-9a06-269ccf588505/divider.js
  var divider_default;
  var init_divider = __esm({
    "../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/bdedc512-223c-4a24-9a06-269ccf588505/divider.js"() {
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

  // ../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/961a6d91-fcbe-402d-bcc5-f45091117cb9/menu.js
  var menu_default;
  var init_menu = __esm({
    "../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/961a6d91-fcbe-402d-bcc5-f45091117cb9/menu.js"() {
      if (document.getElementById("c78045625c") === null) {
        const element = document.createElement("style");
        element.id = "c78045625c";
        element.textContent = `._menu_1xkj6_1 {
  position: absolute;
  left: 0;
  min-width: 100%;
  padding: var(--space-extra-small) 0;
  background-color: #1e1e1e; /* FIXME */
  border-radius: var(--border-radius-2);
  box-shadow: var(--box-shadow-menu);
  color: rgba(255, 255, 255, 1); /* FIXME */
  font-size: var(--font-size-12);
  overflow-y: auto;
}
._menu_1xkj6_1::-webkit-scrollbar {
  display: none;
}

._hidden_1xkj6_17 {
  pointer-events: none;
  visibility: hidden;
}

@media screen and (-webkit-min-device-pixel-ratio: 1.5),
  screen and (min-resolution: 1.5dppx) {
  ._menu_1xkj6_1 {
    -webkit-font-smoothing: antialiased;
  }
}

._optionHeader_1xkj6_29,
._optionValue_1xkj6_30 {
  overflow: hidden;
  padding: 4px var(--space-medium) 4px 32px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

._optionHeader_1xkj6_29 {
  color: rgba(255, 255, 255, 0.7); /* FIXME */
  font-size: var(--font-size-12);
}

._optionValue_1xkj6_30 {
  position: relative;
}
._optionValueSelected_1xkj6_45 {
  background-color: var(--figma-color-bg-brand);
}
._optionValueDisabled_1xkj6_48 {
  color: rgba(255, 255, 255, 0.4); /* FIXME */
}

._optionSeparator_1xkj6_52 {
  width: 100%;
  height: 1px;
  margin: var(--space-extra-small) 0;
  background-color: #444444; /* FIXME */
}

._input_1xkj6_59 {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: block;
  width: 100%;
  height: 100%;
}

._checkIcon_1xkj6_70 {
  position: absolute;
  top: 5px;
  left: var(--space-extra-small);
}

/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9AY3JlYXRlLWZpZ21hLXBsdWdpbi91aS9saWIvY3NzL21lbnUuY3NzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQ0Usa0JBQWtCO0VBQ2xCLE9BQU87RUFDUCxlQUFlO0VBQ2YsbUNBQW1DO0VBQ25DLHlCQUF5QixFQUFFLFVBQVU7RUFDckMscUNBQXFDO0VBQ3JDLGtDQUFrQztFQUNsQyw2QkFBNkIsRUFBRSxVQUFVO0VBQ3pDLDhCQUE4QjtFQUM5QixnQkFBZ0I7QUFDbEI7QUFDQTtFQUNFLGFBQWE7QUFDZjs7QUFFQTtFQUNFLG9CQUFvQjtFQUNwQixrQkFBa0I7QUFDcEI7O0FBRUE7O0VBRUU7SUFDRSxtQ0FBbUM7RUFDckM7QUFDRjs7QUFFQTs7RUFFRSxnQkFBZ0I7RUFDaEIseUNBQXlDO0VBQ3pDLHVCQUF1QjtFQUN2QixtQkFBbUI7QUFDckI7O0FBRUE7RUFDRSwrQkFBK0IsRUFBRSxVQUFVO0VBQzNDLDhCQUE4QjtBQUNoQzs7QUFFQTtFQUNFLGtCQUFrQjtBQUNwQjtBQUNBO0VBQ0UsNkNBQTZDO0FBQy9DO0FBQ0E7RUFDRSwrQkFBK0IsRUFBRSxVQUFVO0FBQzdDOztBQUVBO0VBQ0UsV0FBVztFQUNYLFdBQVc7RUFDWCxrQ0FBa0M7RUFDbEMseUJBQXlCLEVBQUUsVUFBVTtBQUN2Qzs7QUFFQTtFQUNFLGtCQUFrQjtFQUNsQixNQUFNO0VBQ04sUUFBUTtFQUNSLFNBQVM7RUFDVCxPQUFPO0VBQ1AsY0FBYztFQUNkLFdBQVc7RUFDWCxZQUFZO0FBQ2Q7O0FBRUE7RUFDRSxrQkFBa0I7RUFDbEIsUUFBUTtFQUNSLDhCQUE4QjtBQUNoQyIsImZpbGUiOiJub2RlX21vZHVsZXMvQGNyZWF0ZS1maWdtYS1wbHVnaW4vdWkvbGliL2Nzcy9tZW51LmNzcyIsInNvdXJjZXNDb250ZW50IjpbIi5tZW51IHtcbiAgcG9zaXRpb246IGFic29sdXRlO1xuICBsZWZ0OiAwO1xuICBtaW4td2lkdGg6IDEwMCU7XG4gIHBhZGRpbmc6IHZhcigtLXNwYWNlLWV4dHJhLXNtYWxsKSAwO1xuICBiYWNrZ3JvdW5kLWNvbG9yOiAjMWUxZTFlOyAvKiBGSVhNRSAqL1xuICBib3JkZXItcmFkaXVzOiB2YXIoLS1ib3JkZXItcmFkaXVzLTIpO1xuICBib3gtc2hhZG93OiB2YXIoLS1ib3gtc2hhZG93LW1lbnUpO1xuICBjb2xvcjogcmdiYSgyNTUsIDI1NSwgMjU1LCAxKTsgLyogRklYTUUgKi9cbiAgZm9udC1zaXplOiB2YXIoLS1mb250LXNpemUtMTIpO1xuICBvdmVyZmxvdy15OiBhdXRvO1xufVxuLm1lbnU6Oi13ZWJraXQtc2Nyb2xsYmFyIHtcbiAgZGlzcGxheTogbm9uZTtcbn1cblxuLmhpZGRlbiB7XG4gIHBvaW50ZXItZXZlbnRzOiBub25lO1xuICB2aXNpYmlsaXR5OiBoaWRkZW47XG59XG5cbkBtZWRpYSBzY3JlZW4gYW5kICgtd2Via2l0LW1pbi1kZXZpY2UtcGl4ZWwtcmF0aW86IDEuNSksXG4gIHNjcmVlbiBhbmQgKG1pbi1yZXNvbHV0aW9uOiAxLjVkcHB4KSB7XG4gIC5tZW51IHtcbiAgICAtd2Via2l0LWZvbnQtc21vb3RoaW5nOiBhbnRpYWxpYXNlZDtcbiAgfVxufVxuXG4ub3B0aW9uSGVhZGVyLFxuLm9wdGlvblZhbHVlIHtcbiAgb3ZlcmZsb3c6IGhpZGRlbjtcbiAgcGFkZGluZzogNHB4IHZhcigtLXNwYWNlLW1lZGl1bSkgNHB4IDMycHg7XG4gIHRleHQtb3ZlcmZsb3c6IGVsbGlwc2lzO1xuICB3aGl0ZS1zcGFjZTogbm93cmFwO1xufVxuXG4ub3B0aW9uSGVhZGVyIHtcbiAgY29sb3I6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC43KTsgLyogRklYTUUgKi9cbiAgZm9udC1zaXplOiB2YXIoLS1mb250LXNpemUtMTIpO1xufVxuXG4ub3B0aW9uVmFsdWUge1xuICBwb3NpdGlvbjogcmVsYXRpdmU7XG59XG4ub3B0aW9uVmFsdWVTZWxlY3RlZCB7XG4gIGJhY2tncm91bmQtY29sb3I6IHZhcigtLWZpZ21hLWNvbG9yLWJnLWJyYW5kKTtcbn1cbi5vcHRpb25WYWx1ZURpc2FibGVkIHtcbiAgY29sb3I6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC40KTsgLyogRklYTUUgKi9cbn1cblxuLm9wdGlvblNlcGFyYXRvciB7XG4gIHdpZHRoOiAxMDAlO1xuICBoZWlnaHQ6IDFweDtcbiAgbWFyZ2luOiB2YXIoLS1zcGFjZS1leHRyYS1zbWFsbCkgMDtcbiAgYmFja2dyb3VuZC1jb2xvcjogIzQ0NDQ0NDsgLyogRklYTUUgKi9cbn1cblxuLmlucHV0IHtcbiAgcG9zaXRpb246IGFic29sdXRlO1xuICB0b3A6IDA7XG4gIHJpZ2h0OiAwO1xuICBib3R0b206IDA7XG4gIGxlZnQ6IDA7XG4gIGRpc3BsYXk6IGJsb2NrO1xuICB3aWR0aDogMTAwJTtcbiAgaGVpZ2h0OiAxMDAlO1xufVxuXG4uY2hlY2tJY29uIHtcbiAgcG9zaXRpb246IGFic29sdXRlO1xuICB0b3A6IDVweDtcbiAgbGVmdDogdmFyKC0tc3BhY2UtZXh0cmEtc21hbGwpO1xufVxuIl19 */`;
        document.head.append(element);
      }
      menu_default = { "menu": "_menu_1xkj6_1", "hidden": "_hidden_1xkj6_17", "optionHeader": "_optionHeader_1xkj6_29", "optionValue": "_optionValue_1xkj6_30", "optionValueSelected": "_optionValueSelected_1xkj6_45", "optionValueDisabled": "_optionValueDisabled_1xkj6_48", "optionSeparator": "_optionSeparator_1xkj6_52", "input": "_input_1xkj6_59", "checkIcon": "_checkIcon_1xkj6_70" };
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

  // node_modules/@create-figma-plugin/ui/lib/hooks/use-mouse-down-outside.js
  function useMouseDownOutside(options) {
    const { ref, onMouseDownOutside } = options;
    h2(function() {
      function handleBlur() {
        onMouseDownOutside();
      }
      function handleMouseDown(event) {
        const element = getCurrentFromRef(ref);
        if (element === event.target || element.contains(event.target)) {
          return;
        }
        onMouseDownOutside();
      }
      window.addEventListener("blur", handleBlur);
      window.addEventListener("mousedown", handleMouseDown);
      return function() {
        window.removeEventListener("blur", handleBlur);
        window.removeEventListener("mousedown", handleMouseDown);
      };
    }, [ref, onMouseDownOutside]);
  }
  var init_use_mouse_down_outside = __esm({
    "node_modules/@create-figma-plugin/ui/lib/hooks/use-mouse-down-outside.js"() {
      init_hooks_module();
      init_get_current_from_ref();
    }
  });

  // node_modules/@create-figma-plugin/ui/lib/hooks/use-scrollable-menu.js
  function useScrollableMenu(options) {
    const { itemIdDataAttributeName, menuElementRef, selectedId, setSelectedId } = options;
    const getItemElements = T2(function() {
      return Array.from(getCurrentFromRef(menuElementRef).querySelectorAll(`[${itemIdDataAttributeName}]`)).filter(function(element) {
        return element.hasAttribute("disabled") === false;
      });
    }, [itemIdDataAttributeName, menuElementRef]);
    const findIndexByItemId = T2(function(id) {
      if (id === null) {
        return -1;
      }
      const index = getItemElements().findIndex(function(element) {
        return element.getAttribute(itemIdDataAttributeName) === id;
      });
      if (index === -1) {
        throw new Error("Invariant violation");
      }
      return index;
    }, [getItemElements, itemIdDataAttributeName]);
    const updateScrollPosition = T2(function(id) {
      const itemElements = getItemElements();
      const index = findIndexByItemId(id);
      const selectedElement = itemElements[index];
      const menuElement = getCurrentFromRef(menuElementRef);
      const scrollTop = menuElement.scrollTop;
      const offsetTop = computeRelativeOffsetTop(selectedElement, menuElement);
      if (offsetTop < scrollTop) {
        menuElement.scrollTop = offsetTop;
        return;
      }
      const offsetBottom = offsetTop + selectedElement.offsetHeight;
      if (offsetBottom > menuElement.scrollTop + menuElement.offsetHeight) {
        menuElement.scrollTop = offsetBottom - menuElement.offsetHeight;
      }
    }, [findIndexByItemId, getItemElements, menuElementRef]);
    const handleScrollableMenuKeyDown = T2(function(event) {
      const key = event.key;
      if (key === "ArrowDown" || key === "ArrowUp") {
        const itemElements = getItemElements();
        const index = findIndexByItemId(selectedId);
        let newIndex;
        if (key === "ArrowDown") {
          newIndex = index === -1 || index === itemElements.length - 1 ? 0 : index + 1;
        } else {
          newIndex = index === -1 || index === 0 ? itemElements.length - 1 : index - 1;
        }
        const selectedElement = itemElements[newIndex];
        const newSelectedId = selectedElement.getAttribute(itemIdDataAttributeName);
        setSelectedId(newSelectedId);
        updateScrollPosition(newSelectedId);
      }
    }, [
      getItemElements,
      findIndexByItemId,
      itemIdDataAttributeName,
      setSelectedId,
      selectedId,
      updateScrollPosition
    ]);
    const handleScrollableMenuItemMouseMove = T2(function(event) {
      const id = event.currentTarget.getAttribute(itemIdDataAttributeName);
      if (id !== selectedId) {
        setSelectedId(id);
      }
    }, [itemIdDataAttributeName, selectedId, setSelectedId]);
    return {
      handleScrollableMenuItemMouseMove,
      handleScrollableMenuKeyDown
    };
  }
  function computeRelativeOffsetTop(targetElement, parentElement) {
    let element = targetElement;
    let offsetTop = 0;
    while (element !== parentElement) {
      offsetTop += element.offsetTop;
      if (element.parentElement === null) {
        throw new Error("`element.parentElement` is `null`");
      }
      element = element.parentElement;
    }
    return offsetTop;
  }
  var init_use_scrollable_menu = __esm({
    "node_modules/@create-figma-plugin/ui/lib/hooks/use-scrollable-menu.js"() {
      init_hooks_module();
      init_get_current_from_ref();
    }
  });

  // node_modules/@create-figma-plugin/ui/lib/icons/icon-8/icon-control-chevron-down-8.js
  var IconControlChevronDown8;
  var init_icon_control_chevron_down_8 = __esm({
    "node_modules/@create-figma-plugin/ui/lib/icons/icon-8/icon-control-chevron-down-8.js"() {
      init_create_icon();
      IconControlChevronDown8 = createIcon("m3.64641 6.35352-3-3 .70711-.70711 2.64644 2.64645 2.64645-2.64645.70711.70711-3 3-.35356.35355-.35355-.35355Z", { height: 8, width: 8 });
    }
  });

  // node_modules/@create-figma-plugin/ui/lib/icons/icon-16/icon-menu-checkmark-checked-16.js
  var IconMenuCheckmarkChecked16;
  var init_icon_menu_checkmark_checked_16 = __esm({
    "node_modules/@create-figma-plugin/ui/lib/icons/icon-16/icon-menu-checkmark-checked-16.js"() {
      init_create_icon();
      IconMenuCheckmarkChecked16 = createIcon("M13.2069 5.20724 7.70688 10.7072l-.70711.7072-.70711-.7072-3-2.99996 1.41422-1.41421 2.29289 2.29289 4.79293-4.79289 1.4142 1.41421Z", { height: 16, width: 16 });
    }
  });

  // ../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/deab1246-5236-4637-be3b-26bdcfae72e4/dropdown.js
  var dropdown_default;
  var init_dropdown = __esm({
    "../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/deab1246-5236-4637-be3b-26bdcfae72e4/dropdown.js"() {
      if (document.getElementById("dffb4a029a") === null) {
        const element = document.createElement("style");
        element.id = "dffb4a029a";
        element.textContent = `._dropdown_idjri_1 {
  position: relative;
  z-index: var(--z-index-1);
  display: flex;
  width: 100%;
  min-width: 0; /* See https://css-tricks.com/flexbox-truncated-text/ */
  height: 28px;
  align-items: center;
  padding-left: var(--space-extra-small);
  color: var(--figma-color-text);
}
._dropdown_idjri_1:not(._disabled_idjri_12):focus-within {
  z-index: var(--z-index-2); /* stack \`.dropdown\` over its sibling elements */
  outline: 0;
}

._disabled_idjri_12 {
  cursor: not-allowed;
}

._icon_idjri_21 {
  position: absolute;
  top: 14px;
  left: 16px;
  color: var(--figma-color-icon-secondary);
  text-align: center;
  transform: translate(-50%, -50%);
}
._disabled_idjri_12 ._icon_idjri_21 {
  color: var(--figma-color-icon-disabled);
}

._empty_idjri_33 {
  flex-grow: 1;
}

._value_idjri_37 {
  overflow: hidden;
  margin-right: 6px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
._dropdown_idjri_1:not(._disabled_idjri_12):hover ._value_idjri_37,
._dropdown_idjri_1:not(._disabled_idjri_12):focus ._value_idjri_37,
._dropdown_idjri_1:not(._disabled_idjri_12):focus-within ._value_idjri_37 {
  flex-grow: 1;
}
._disabled_idjri_12 ._value_idjri_37 {
  color: var(--figma-color-text-disabled);
}
._hasIcon_idjri_51 ._value_idjri_37 {
  padding-left: var(--space-extra-large);
}

._placeholder_idjri_55 {
  color: var(--figma-color-text-tertiary);
}

._chevronIcon_idjri_59 {
  margin-right: var(--space-extra-small);
  color: var(--figma-color-icon-secondary);
}
._dropdown_idjri_1:not(._disabled_idjri_12):hover ._chevronIcon_idjri_59 {
  color: var(--figma-color-icon);
}
._disabled_idjri_12 ._chevronIcon_idjri_59 {
  color: var(--figma-color-icon-disabled);
}

._border_idjri_70 {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  border: 1px solid transparent;
  border-radius: var(--border-radius-2);
}
._hasBorder_idjri_79 ._border_idjri_70,
._dropdown_idjri_1:not(._disabled_idjri_12):hover ._border_idjri_70 {
  border-color: var(--figma-color-border);
}

._underline_idjri_84 {
  position: absolute;
  right: var(--space-extra-small);
  bottom: 0;
  left: var(--space-extra-small);
  height: 1px;
  background-color: var(--figma-color-border);
}
._dropdown_idjri_1:not(._disabled_idjri_12):hover ._underline_idjri_84,
._dropdown_idjri_1:not(._disabled_idjri_12):focus ._underline_idjri_84 {
  background-color: transparent;
}

._menu_idjri_97 {
  max-width: 0;
  max-height: 0;
}

/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9AY3JlYXRlLWZpZ21hLXBsdWdpbi91aS9saWIvY29tcG9uZW50cy9kcm9wZG93bi9kcm9wZG93bi5jc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFDRSxrQkFBa0I7RUFDbEIseUJBQXlCO0VBQ3pCLGFBQWE7RUFDYixXQUFXO0VBQ1gsWUFBWSxFQUFFLHVEQUF1RDtFQUNyRSxZQUFZO0VBQ1osbUJBQW1CO0VBQ25CLHNDQUFzQztFQUN0Qyw4QkFBOEI7QUFDaEM7QUFDQTtFQUNFLHlCQUF5QixFQUFFLGdEQUFnRDtFQUMzRSxVQUFVO0FBQ1o7O0FBRUE7RUFDRSxtQkFBbUI7QUFDckI7O0FBRUE7RUFDRSxrQkFBa0I7RUFDbEIsU0FBUztFQUNULFVBQVU7RUFDVix3Q0FBd0M7RUFDeEMsa0JBQWtCO0VBQ2xCLGdDQUFnQztBQUNsQztBQUNBO0VBQ0UsdUNBQXVDO0FBQ3pDOztBQUVBO0VBQ0UsWUFBWTtBQUNkOztBQUVBO0VBQ0UsZ0JBQWdCO0VBQ2hCLGlCQUFpQjtFQUNqQix1QkFBdUI7RUFDdkIsbUJBQW1CO0FBQ3JCO0FBQ0E7OztFQUdFLFlBQVk7QUFDZDtBQUNBO0VBQ0UsdUNBQXVDO0FBQ3pDO0FBQ0E7RUFDRSxzQ0FBc0M7QUFDeEM7O0FBRUE7RUFDRSx1Q0FBdUM7QUFDekM7O0FBRUE7RUFDRSxzQ0FBc0M7RUFDdEMsd0NBQXdDO0FBQzFDO0FBQ0E7RUFDRSw4QkFBOEI7QUFDaEM7QUFDQTtFQUNFLHVDQUF1QztBQUN6Qzs7QUFFQTtFQUNFLGtCQUFrQjtFQUNsQixNQUFNO0VBQ04sUUFBUTtFQUNSLFNBQVM7RUFDVCxPQUFPO0VBQ1AsNkJBQTZCO0VBQzdCLHFDQUFxQztBQUN2QztBQUNBOztFQUVFLHVDQUF1QztBQUN6Qzs7QUFFQTtFQUNFLGtCQUFrQjtFQUNsQiwrQkFBK0I7RUFDL0IsU0FBUztFQUNULDhCQUE4QjtFQUM5QixXQUFXO0VBQ1gsMkNBQTJDO0FBQzdDO0FBQ0E7O0VBRUUsNkJBQTZCO0FBQy9COztBQUVBO0VBQ0UsWUFBWTtFQUNaLGFBQWE7QUFDZiIsImZpbGUiOiJub2RlX21vZHVsZXMvQGNyZWF0ZS1maWdtYS1wbHVnaW4vdWkvbGliL2NvbXBvbmVudHMvZHJvcGRvd24vZHJvcGRvd24uY3NzIiwic291cmNlc0NvbnRlbnQiOlsiLmRyb3Bkb3duIHtcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xuICB6LWluZGV4OiB2YXIoLS16LWluZGV4LTEpO1xuICBkaXNwbGF5OiBmbGV4O1xuICB3aWR0aDogMTAwJTtcbiAgbWluLXdpZHRoOiAwOyAvKiBTZWUgaHR0cHM6Ly9jc3MtdHJpY2tzLmNvbS9mbGV4Ym94LXRydW5jYXRlZC10ZXh0LyAqL1xuICBoZWlnaHQ6IDI4cHg7XG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gIHBhZGRpbmctbGVmdDogdmFyKC0tc3BhY2UtZXh0cmEtc21hbGwpO1xuICBjb2xvcjogdmFyKC0tZmlnbWEtY29sb3ItdGV4dCk7XG59XG4uZHJvcGRvd246bm90KC5kaXNhYmxlZCk6Zm9jdXMtd2l0aGluIHtcbiAgei1pbmRleDogdmFyKC0tei1pbmRleC0yKTsgLyogc3RhY2sgYC5kcm9wZG93bmAgb3ZlciBpdHMgc2libGluZyBlbGVtZW50cyAqL1xuICBvdXRsaW5lOiAwO1xufVxuXG4uZGlzYWJsZWQge1xuICBjdXJzb3I6IG5vdC1hbGxvd2VkO1xufVxuXG4uaWNvbiB7XG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgdG9wOiAxNHB4O1xuICBsZWZ0OiAxNnB4O1xuICBjb2xvcjogdmFyKC0tZmlnbWEtY29sb3ItaWNvbi1zZWNvbmRhcnkpO1xuICB0ZXh0LWFsaWduOiBjZW50ZXI7XG4gIHRyYW5zZm9ybTogdHJhbnNsYXRlKC01MCUsIC01MCUpO1xufVxuLmRpc2FibGVkIC5pY29uIHtcbiAgY29sb3I6IHZhcigtLWZpZ21hLWNvbG9yLWljb24tZGlzYWJsZWQpO1xufVxuXG4uZW1wdHkge1xuICBmbGV4LWdyb3c6IDE7XG59XG5cbi52YWx1ZSB7XG4gIG92ZXJmbG93OiBoaWRkZW47XG4gIG1hcmdpbi1yaWdodDogNnB4O1xuICB0ZXh0LW92ZXJmbG93OiBlbGxpcHNpcztcbiAgd2hpdGUtc3BhY2U6IG5vd3JhcDtcbn1cbi5kcm9wZG93bjpub3QoLmRpc2FibGVkKTpob3ZlciAudmFsdWUsXG4uZHJvcGRvd246bm90KC5kaXNhYmxlZCk6Zm9jdXMgLnZhbHVlLFxuLmRyb3Bkb3duOm5vdCguZGlzYWJsZWQpOmZvY3VzLXdpdGhpbiAudmFsdWUge1xuICBmbGV4LWdyb3c6IDE7XG59XG4uZGlzYWJsZWQgLnZhbHVlIHtcbiAgY29sb3I6IHZhcigtLWZpZ21hLWNvbG9yLXRleHQtZGlzYWJsZWQpO1xufVxuLmhhc0ljb24gLnZhbHVlIHtcbiAgcGFkZGluZy1sZWZ0OiB2YXIoLS1zcGFjZS1leHRyYS1sYXJnZSk7XG59XG5cbi5wbGFjZWhvbGRlciB7XG4gIGNvbG9yOiB2YXIoLS1maWdtYS1jb2xvci10ZXh0LXRlcnRpYXJ5KTtcbn1cblxuLmNoZXZyb25JY29uIHtcbiAgbWFyZ2luLXJpZ2h0OiB2YXIoLS1zcGFjZS1leHRyYS1zbWFsbCk7XG4gIGNvbG9yOiB2YXIoLS1maWdtYS1jb2xvci1pY29uLXNlY29uZGFyeSk7XG59XG4uZHJvcGRvd246bm90KC5kaXNhYmxlZCk6aG92ZXIgLmNoZXZyb25JY29uIHtcbiAgY29sb3I6IHZhcigtLWZpZ21hLWNvbG9yLWljb24pO1xufVxuLmRpc2FibGVkIC5jaGV2cm9uSWNvbiB7XG4gIGNvbG9yOiB2YXIoLS1maWdtYS1jb2xvci1pY29uLWRpc2FibGVkKTtcbn1cblxuLmJvcmRlciB7XG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgdG9wOiAwO1xuICByaWdodDogMDtcbiAgYm90dG9tOiAwO1xuICBsZWZ0OiAwO1xuICBib3JkZXI6IDFweCBzb2xpZCB0cmFuc3BhcmVudDtcbiAgYm9yZGVyLXJhZGl1czogdmFyKC0tYm9yZGVyLXJhZGl1cy0yKTtcbn1cbi5oYXNCb3JkZXIgLmJvcmRlcixcbi5kcm9wZG93bjpub3QoLmRpc2FibGVkKTpob3ZlciAuYm9yZGVyIHtcbiAgYm9yZGVyLWNvbG9yOiB2YXIoLS1maWdtYS1jb2xvci1ib3JkZXIpO1xufVxuXG4udW5kZXJsaW5lIHtcbiAgcG9zaXRpb246IGFic29sdXRlO1xuICByaWdodDogdmFyKC0tc3BhY2UtZXh0cmEtc21hbGwpO1xuICBib3R0b206IDA7XG4gIGxlZnQ6IHZhcigtLXNwYWNlLWV4dHJhLXNtYWxsKTtcbiAgaGVpZ2h0OiAxcHg7XG4gIGJhY2tncm91bmQtY29sb3I6IHZhcigtLWZpZ21hLWNvbG9yLWJvcmRlcik7XG59XG4uZHJvcGRvd246bm90KC5kaXNhYmxlZCk6aG92ZXIgLnVuZGVybGluZSxcbi5kcm9wZG93bjpub3QoLmRpc2FibGVkKTpmb2N1cyAudW5kZXJsaW5lIHtcbiAgYmFja2dyb3VuZC1jb2xvcjogdHJhbnNwYXJlbnQ7XG59XG5cbi5tZW51IHtcbiAgbWF4LXdpZHRoOiAwO1xuICBtYXgtaGVpZ2h0OiAwO1xufVxuIl19 */`;
        document.head.append(element);
      }
      dropdown_default = { "dropdown": "_dropdown_idjri_1", "disabled": "_disabled_idjri_12", "icon": "_icon_idjri_21", "empty": "_empty_idjri_33", "value": "_value_idjri_37", "hasIcon": "_hasIcon_idjri_51", "placeholder": "_placeholder_idjri_55", "chevronIcon": "_chevronIcon_idjri_59", "border": "_border_idjri_70", "hasBorder": "_hasBorder_idjri_79", "underline": "_underline_idjri_84", "menu": "_menu_idjri_97" };
    }
  });

  // node_modules/@create-figma-plugin/ui/lib/components/dropdown/private/constants.js
  var INVALID_ID, ITEM_ID_DATA_ATTRIBUTE_NAME, VIEWPORT_MARGIN;
  var init_constants = __esm({
    "node_modules/@create-figma-plugin/ui/lib/components/dropdown/private/constants.js"() {
      INVALID_ID = null;
      ITEM_ID_DATA_ATTRIBUTE_NAME = "data-dropdown-item-id";
      VIEWPORT_MARGIN = 16;
    }
  });

  // node_modules/@create-figma-plugin/ui/lib/components/dropdown/private/update-menu-element-layout.js
  function updateMenuElementLayout(rootElement, menuElement, selectedId) {
    const menuElementMaxWidth = window.innerWidth - 2 * VIEWPORT_MARGIN;
    const menuElementMaxHeight = window.innerHeight - 2 * VIEWPORT_MARGIN;
    menuElement.style.maxWidth = `${menuElementMaxWidth}px`;
    menuElement.style.maxHeight = `${menuElementMaxHeight}px`;
    const selectedLabelElement = getSelectedLabelElement(menuElement, selectedId);
    const rootElementBoundingClientRect = rootElement.getBoundingClientRect();
    const isScrollable = menuElement.offsetHeight === menuElementMaxHeight;
    const left = computeMenuElementLeft({
      menuWidth: menuElement.offsetWidth,
      rootLeft: rootElementBoundingClientRect.left
    });
    const top = computeMenuElementTop({
      isScrollable,
      menuHeight: menuElement.offsetHeight,
      rootHeight: rootElement.offsetHeight,
      rootTop: rootElementBoundingClientRect.top,
      selectedTop: selectedLabelElement === null ? null : selectedLabelElement.offsetTop
    });
    menuElement.style.left = `${left}px`;
    menuElement.style.top = `${top}px`;
    if (selectedLabelElement !== null && isScrollable === true) {
      menuElement.scrollTop = computeMenuElementScrollTop({
        menuHeight: menuElement.offsetHeight,
        menuScrollHeight: menuElement.scrollHeight,
        menuTop: menuElement.getBoundingClientRect().top,
        rootHeight: rootElement.offsetHeight,
        rootTop: rootElementBoundingClientRect.top,
        selectedHeight: selectedLabelElement.offsetHeight,
        selectedTop: selectedLabelElement.offsetTop
      });
    }
  }
  function getSelectedLabelElement(menuElement, selectedId) {
    if (selectedId === INVALID_ID) {
      return null;
    }
    const selectedInputElement = menuElement.querySelector(`[${ITEM_ID_DATA_ATTRIBUTE_NAME}='${selectedId}']`);
    if (selectedInputElement === null) {
      throw new Error("Invariant violation");
    }
    const selectedLabelElement = selectedInputElement.parentElement;
    if (selectedLabelElement === null) {
      throw new Error("Invariant violation");
    }
    return selectedLabelElement;
  }
  function computeMenuElementLeft(options) {
    const { rootLeft, menuWidth } = options;
    if (rootLeft <= VIEWPORT_MARGIN) {
      return negate(rootLeft) + VIEWPORT_MARGIN;
    }
    const left = negate(rootLeft + menuWidth - (window.innerWidth - VIEWPORT_MARGIN));
    return Math.min(left, 0);
  }
  function computeMenuElementTop(options) {
    const viewportHeight = window.innerHeight;
    const { isScrollable, menuHeight, rootHeight, rootTop, selectedTop } = options;
    if (rootTop <= VIEWPORT_MARGIN) {
      return negate(rootTop) + VIEWPORT_MARGIN;
    }
    if (rootTop + rootHeight >= viewportHeight - VIEWPORT_MARGIN) {
      return negate(rootTop - (viewportHeight - VIEWPORT_MARGIN - menuHeight));
    }
    const minimumTop = negate(rootTop - VIEWPORT_MARGIN);
    const maximumTop = viewportHeight - VIEWPORT_MARGIN - menuHeight - rootTop;
    if (selectedTop === null || isScrollable === true) {
      const top = Math.min(negate((menuHeight - rootHeight) / 2), 0);
      return restrictToRange(top, minimumTop, maximumTop);
    }
    return restrictToRange(negate(selectedTop), minimumTop, maximumTop);
  }
  function computeMenuElementScrollTop(options) {
    const viewportHeight = window.innerHeight;
    const { menuHeight, menuScrollHeight, menuTop, rootHeight, rootTop, selectedTop, selectedHeight } = options;
    const minimumScrollTop = 0;
    const maximumScrollTop = menuScrollHeight - menuHeight;
    if (rootTop <= menuTop) {
      return restrictToRange(selectedTop, minimumScrollTop, maximumScrollTop);
    }
    if (rootTop + rootHeight >= viewportHeight - VIEWPORT_MARGIN) {
      return restrictToRange(selectedTop + selectedHeight - menuHeight, minimumScrollTop, maximumScrollTop);
    }
    return restrictToRange(selectedTop - rootTop + menuTop, minimumScrollTop, maximumScrollTop);
  }
  function negate(number) {
    return -1 * number;
  }
  function restrictToRange(number, minimum, maximum) {
    return Math.min(Math.max(number, minimum), maximum);
  }
  var init_update_menu_element_layout = __esm({
    "node_modules/@create-figma-plugin/ui/lib/components/dropdown/private/update-menu-element-layout.js"() {
      init_constants();
    }
  });

  // node_modules/@create-figma-plugin/ui/lib/components/dropdown/dropdown.js
  function Dropdown(_a) {
    var _b = _a, { disabled = false, icon, name, options, onChange = function() {
    }, onValueChange = function() {
    }, placeholder, value, variant } = _b, rest = __objRest(_b, ["disabled", "icon", "name", "options", "onChange", "onValueChange", "placeholder", "value", "variant"]);
    if (typeof icon === "string" && icon.length !== 1) {
      throw new Error(`String \`icon\` must be a single character: ${icon}`);
    }
    const rootElementRef = _2(null);
    const menuElementRef = _2(null);
    const [isMenuVisible, setIsMenuVisible] = p2(false);
    const index = findOptionIndexByValue(options, value);
    if (value !== null && index === -1) {
      throw new Error(`Invalid \`value\`: ${value}`);
    }
    const [selectedId, setSelectedId] = p2(index === -1 ? INVALID_ID : `${index}`);
    const children = typeof options[index] === "undefined" ? "" : getDropdownOptionValue(options[index]);
    const { handleScrollableMenuKeyDown, handleScrollableMenuItemMouseMove } = useScrollableMenu({
      itemIdDataAttributeName: ITEM_ID_DATA_ATTRIBUTE_NAME,
      menuElementRef,
      selectedId,
      setSelectedId
    });
    const triggerBlur = T2(function() {
      setIsMenuVisible(false);
      setSelectedId(INVALID_ID);
      getCurrentFromRef(rootElementRef).blur();
    }, []);
    const triggerUpdateMenuElementLayout = T2(function(selectedId2) {
      const rootElement = getCurrentFromRef(rootElementRef);
      const menuElement = getCurrentFromRef(menuElementRef);
      updateMenuElementLayout(rootElement, menuElement, selectedId2);
    }, []);
    const handleRootFocus = T2(function() {
      setIsMenuVisible(true);
      if (value === null) {
        triggerUpdateMenuElementLayout(selectedId);
        return;
      }
      const index2 = findOptionIndexByValue(options, value);
      if (index2 === -1) {
        throw new Error(`Invalid \`value\`: ${value}`);
      }
      const newSelectedId = `${index2}`;
      setSelectedId(newSelectedId);
      triggerUpdateMenuElementLayout(newSelectedId);
    }, [options, selectedId, triggerUpdateMenuElementLayout, value]);
    const handleRootKeyDown = T2(function(event) {
      if (event.key === "Escape" || event.key === "Tab") {
        triggerBlur();
        return;
      }
      if (event.key === "Enter") {
        if (selectedId !== INVALID_ID) {
          const selectedElement = getCurrentFromRef(menuElementRef).querySelector(`[${ITEM_ID_DATA_ATTRIBUTE_NAME}='${selectedId}']`);
          if (selectedElement === null) {
            throw new Error("Invariant violation");
          }
          selectedElement.checked = true;
          const changeEvent = document.createEvent("Event");
          changeEvent.initEvent("change", true, true);
          selectedElement.dispatchEvent(changeEvent);
        }
        triggerBlur();
        return;
      }
      handleScrollableMenuKeyDown(event);
    }, [handleScrollableMenuKeyDown, selectedId, triggerBlur]);
    const handleRootMouseDown = T2(function(event) {
      if (isMenuVisible === false) {
        return;
      }
      event.preventDefault();
      triggerBlur();
    }, [isMenuVisible, triggerBlur]);
    const handleMenuMouseDown = T2(function(event) {
      event.stopPropagation();
    }, []);
    const handleOptionChange = T2(function(event) {
      const id = event.currentTarget.getAttribute(ITEM_ID_DATA_ATTRIBUTE_NAME);
      const optionValue = options[parseInt(id, 10)];
      const newValue = optionValue.value;
      onValueChange(newValue, name);
      onChange(event);
      triggerBlur();
    }, [name, onChange, onValueChange, options, triggerBlur]);
    const handleMouseDownOutside = T2(function() {
      if (isMenuVisible === false) {
        return;
      }
      triggerBlur();
    }, [isMenuVisible, triggerBlur]);
    useMouseDownOutside({
      onMouseDownOutside: handleMouseDownOutside,
      ref: rootElementRef
    });
    return h("div", __spreadProps(__spreadValues({}, rest), { ref: rootElementRef, class: createClassName([
      dropdown_default.dropdown,
      typeof variant === "undefined" ? null : variant === "border" ? dropdown_default.hasBorder : null,
      typeof icon === "undefined" ? null : dropdown_default.hasIcon,
      disabled === true ? dropdown_default.disabled : null
    ]), onFocus: handleRootFocus, onKeyDown: disabled === true ? void 0 : handleRootKeyDown, onMouseDown: handleRootMouseDown, tabIndex: disabled === true ? -1 : 0 }), typeof icon === "undefined" ? null : h("div", { class: dropdown_default.icon }, icon), value === null ? typeof placeholder === "undefined" ? h("div", { class: dropdown_default.empty }) : h("div", { class: createClassName([
      dropdown_default.value,
      dropdown_default.placeholder
    ]) }, placeholder) : h("div", { class: dropdown_default.value }, children), h("div", { class: dropdown_default.chevronIcon }, h(IconControlChevronDown8, null)), variant === "underline" ? h("div", { class: dropdown_default.underline }) : null, h("div", { class: dropdown_default.border }), h("div", { ref: menuElementRef, class: createClassName([
      menu_default.menu,
      dropdown_default.menu,
      disabled === true || isMenuVisible === false ? menu_default.hidden : null
    ]), onMouseDown: handleMenuMouseDown }, options.map(function(option, index2) {
      if ("separator" in option) {
        return h("hr", { key: index2, class: menu_default.optionSeparator });
      }
      if ("header" in option) {
        return h("h1", { key: index2, class: menu_default.optionHeader }, option.header);
      }
      return h("label", { key: index2, class: createClassName([
        menu_default.optionValue,
        option.disabled === true ? menu_default.optionValueDisabled : null,
        option.disabled !== true && `${index2}` === selectedId ? menu_default.optionValueSelected : null
      ]) }, h("input", __spreadValues({ checked: value === option.value, class: menu_default.input, disabled: option.disabled === true, name, onChange: value === option.value ? void 0 : handleOptionChange, onClick: value === option.value ? triggerBlur : void 0, onMouseMove: handleScrollableMenuItemMouseMove, tabIndex: -1, type: "radio", value: `${option.value}` }, { [ITEM_ID_DATA_ATTRIBUTE_NAME]: `${index2}` })), option.value === value ? h("div", { class: menu_default.checkIcon }, h(IconMenuCheckmarkChecked16, null)) : null, typeof option.text === "undefined" ? option.value : option.text);
    })));
  }
  function getDropdownOptionValue(option) {
    if ("text" in option) {
      return option.text;
    }
    if ("value" in option) {
      return option.value;
    }
    throw new Error("Invariant violation");
  }
  function findOptionIndexByValue(options, value) {
    if (value === null) {
      return -1;
    }
    let index = 0;
    for (const option of options) {
      if ("value" in option && option.value === value) {
        return index;
      }
      index += 1;
    }
    return -1;
  }
  var init_dropdown2 = __esm({
    "node_modules/@create-figma-plugin/ui/lib/components/dropdown/dropdown.js"() {
      init_preact_module();
      init_hooks_module();
      init_menu();
      init_use_mouse_down_outside();
      init_use_scrollable_menu();
      init_icon_control_chevron_down_8();
      init_icon_menu_checkmark_checked_16();
      init_create_class_name();
      init_get_current_from_ref();
      init_dropdown();
      init_constants();
      init_update_menu_element_layout();
    }
  });

  // ../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/705501a9-4b83-4619-a6e8-d32676916d32/text.js
  var text_default;
  var init_text = __esm({
    "../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/705501a9-4b83-4619-a6e8-d32676916d32/text.js"() {
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

  // ../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/eedb7415-cfb7-43dc-9026-6e2d42b2dbb7/textbox.js
  var textbox_default;
  var init_textbox = __esm({
    "../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/eedb7415-cfb7-43dc-9026-6e2d42b2dbb7/textbox.js"() {
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

  // ../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/56279844-1398-4574-b578-950b84dd1a80/muted.js
  var muted_default;
  var init_muted = __esm({
    "../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/56279844-1398-4574-b578-950b84dd1a80/muted.js"() {
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

  // ../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/2db2f47d-b5b8-446f-a7aa-01a8965cda2d/columns.js
  var columns_default;
  var init_columns = __esm({
    "../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/2db2f47d-b5b8-446f-a7aa-01a8965cda2d/columns.js"() {
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

  // ../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/38f0c1b7-780b-4f2a-9337-902f1558e4ae/container.js
  var container_default;
  var init_container = __esm({
    "../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/38f0c1b7-780b-4f2a-9337-902f1558e4ae/container.js"() {
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

  // ../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/c85ce29a-6e45-482a-bcd6-be82d632c555/middle-align.js
  var middle_align_default;
  var init_middle_align = __esm({
    "../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/c85ce29a-6e45-482a-bcd6-be82d632c555/middle-align.js"() {
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

  // ../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/48d0b857-2fde-4c08-a93a-db101b66996b/vertical-space.js
  var vertical_space_default;
  var init_vertical_space = __esm({
    "../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/48d0b857-2fde-4c08-a93a-db101b66996b/vertical-space.js"() {
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

  // ../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/1396716b-8d43-46de-ae02-59eb95354a6e/base.js
  var init_base = __esm({
    "../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/1396716b-8d43-46de-ae02-59eb95354a6e/base.js"() {
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
      init_disclosure2();
      init_divider2();
      init_dropdown2();
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

  // ../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/93286b1e-fc58-444c-83f6-ed58f3b38e40/styles.js
  var init_styles = __esm({
    "../../../../../private/var/folders/ks/f05_8xtd79sf6d3ddj6c44pr0000gn/T/93286b1e-fc58-444c-83f6-ed58f3b38e40/styles.js"() {
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

  // src/setup/pages/data.ts
  var DEFAULT_SIZE, PAGES;
  var init_data = __esm({
    "src/setup/pages/data.ts"() {
      "use strict";
      DEFAULT_SIZE = { width: 300, height: 400 };
      PAGES = {
        index: DEFAULT_SIZE,
        settings: { width: 300, height: 500 }
      };
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
    for (var r3 in t3)
      if ("__source" !== r3 && n2[r3] !== t3[r3])
        return true;
    return false;
  }
  function w3(n2) {
    this.props = n2;
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
  function V2() {
    this.u = null, this.o = null;
  }
  function J() {
  }
  function K() {
    return this.cancelBubble;
  }
  function Q() {
    return this.defaultPrevented;
  }
  var x3, N2, T3, I2, W, z3, B3, H2, Z, G, X, nn, tn, en, sn;
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
      sn = function(n2, t3) {
        return n2(t3);
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
  function E(r3) {
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
    const o3 = q(e3)[d3];
    if ("object" == typeof process && true && !o3)
      throw new Error("useContextSelector requires special context");
    const { v: { current: c3 }, n: { current: u3 }, l: s3 } = o3, i4 = n2(c3), [p4, l3] = y((e4, r3) => {
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
        const StateContext = E(null);
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
        const useActions = () => q(DispatchContext);
        const useStateContext = function(selector) {
          return h3(StateContext, selector);
        };
        return [Provider, useActions, useStateContext];
      };
    }
  });

  // src/setup/state/GlobalState.ts
  var updateSize, GlobalState, useGlobalActions, useGlobalState;
  var init_GlobalState = __esm({
    "src/setup/state/GlobalState.ts"() {
      "use strict";
      init_lib();
      init_hooks_module();
      init_data();
      init_createProvider();
      updateSize = (size) => {
        emit("RESIZE", size);
      };
      [GlobalState, useGlobalActions, useGlobalState] = createProvider(
        ({ initialSelection, config }) => {
          const [selection, setSelection] = p2(initialSelection);
          const [route, setRoute] = p2("index");
          h2(() => {
            return on("SELECTION_CHANGE", (data2) => {
              setSelection(data2);
            });
          }, []);
          F(() => {
            updateSize(PAGES[route]);
          }, [route]);
          const data = {
            route,
            selection,
            config
          };
          const actions = {
            setRoute
          };
          return [data, actions];
        }
      );
    }
  });

  // src/setup/pages/Index.tsx
  var Index;
  var init_Index = __esm({
    "src/setup/pages/Index.tsx"() {
      "use strict";
      init_lib2();
      init_preact_module();
      init_GlobalState();
      Index = () => {
        const selection = useGlobalState((c3) => c3.selection);
        return /* @__PURE__ */ h(Container, {
          space: "medium"
        }, !(selection == null ? void 0 : selection.length) && /* @__PURE__ */ h(Text, null, "No nodes selected"), selection == null ? void 0 : selection.map((node) => /* @__PURE__ */ h(Text, {
          key: node.id
        }, node.id, ": ", node.name)));
      };
    }
  });

  // src/tolgee.ts
  async function sendTolgeeRequest(endpoint, method, tolgeeConfig, body) {
    if (!tolgeeConfig) {
      console.log("ABORT: NO CONFIG");
      return null;
    }
    return new Promise((resolve, reject) => {
      const request = new XMLHttpRequest();
      request.open(method, `${tolgeeConfig.url}/${endpoint}`);
      request.setRequestHeader("X-API-Key", tolgeeConfig.apiKey);
      request.setRequestHeader("Content-Type", "application/json");
      request.responseType = "json";
      request.onloadend = () => {
        resolve({ status: request.status, data: request.response });
      };
      request.onerror = () => {
        reject();
      };
      request.send(body);
    });
  }
  var init_tolgee = __esm({
    "src/tolgee.ts"() {
      "use strict";
    }
  });

  // src/setup/pages/Settings.tsx
  var Settings;
  var init_Settings = __esm({
    "src/setup/pages/Settings.tsx"() {
      "use strict";
      init_hooks_module();
      init_lib2();
      init_preact_module();
      init_lib();
      init_tolgee();
      init_GlobalState();
      Settings = () => {
        var _a, _b, _c;
        const config = useGlobalState((c3) => c3.config);
        const [isLoading, setIsLoading] = p2(false);
        const [previousConfig, setPreviousConfig] = p2(config != null ? config : {});
        const [tolgeeConfig, setTolgeeConfig] = p2(config != null ? config : {});
        const [languages, setLanguages] = p2([]);
        const [open, setOpen] = p2(
          !config || !!config.apiKey && !!config.url
        );
        const { setRoute } = useGlobalActions();
        const [error, setError] = p2();
        h2(() => {
          setError(void 0);
        }, [tolgeeConfig]);
        h2(() => {
          if (config && config.apiKey && config.url) {
            validateTolgeeCredentials();
          }
        }, [config]);
        const validateTolgeeCredentials = async () => {
          var _a2, _b2, _c2, _d;
          setIsLoading(true);
          try {
            const res = await sendTolgeeRequest(
              "v2/api-keys/current",
              "GET",
              tolgeeConfig
            );
            if (res && res.status === 200 && ((_b2 = (_a2 = res.data) == null ? void 0 : _a2.scopes) == null ? void 0 : _b2.includes("translations.view")) && ((_d = (_c2 = res.data) == null ? void 0 : _c2.scopes) == null ? void 0 : _d.includes("translations.view"))) {
              getTolgeeLanguages();
              setOpen(false);
              setPreviousConfig(tolgeeConfig);
            } else if (res && res.status === 200) {
              setOpen(true);
              setError(
                "Missing token scopes. The token should have translations.view and translations.edit scopes."
              );
            } else {
              setOpen(true);
              setError("Wrong credentials");
            }
          } catch (_3) {
            setError("Invalid values. Please check the entered values");
          } finally {
            setIsLoading(false);
          }
        };
        const getTolgeeLanguages = async () => {
          var _a2, _b2, _c2, _d;
          try {
            const res = await sendTolgeeRequest(
              "v2/projects/languages",
              "GET",
              tolgeeConfig
            );
            if (res && res.status === 200 && ((_c2 = (_b2 = (_a2 = res.data) == null ? void 0 : _a2._embedded) == null ? void 0 : _b2.languages) == null ? void 0 : _c2.length)) {
              setLanguages(
                res.data._embedded.languages.map((e3) => ({
                  value: e3.tag,
                  text: e3.name
                }))
              );
              setTolgeeConfig(__spreadProps(__spreadValues({}, tolgeeConfig), {
                lang: (_d = tolgeeConfig.lang) != null ? _d : res.data._embedded.languages[0].tag
              }));
            } else {
              setError("An error occurred while fetching the available languages.");
            }
          } catch (e3) {
            setError("An error occurred while fetching the available languages.");
          }
        };
        const handleSubmit = () => {
          if (!tolgeeConfig.apiKey) {
            setError("Missing API key");
            return;
          } else if (!tolgeeConfig.url) {
            setError("Missing API url");
            return;
          }
          if (tolgeeConfig.apiKey !== previousConfig.apiKey || tolgeeConfig.url !== previousConfig.url) {
            validateTolgeeCredentials();
            return;
          }
          if (tolgeeConfig.lang) {
            emit("SETUP", tolgeeConfig);
          }
        };
        const handleClose = T2(function() {
          setRoute("index");
        }, []);
        if (isLoading) {
          return /* @__PURE__ */ h(MiddleAlign, null, /* @__PURE__ */ h(LoadingIndicator, null));
        }
        return /* @__PURE__ */ h(Container, {
          space: "medium"
        }, /* @__PURE__ */ h(VerticalSpace, {
          space: "large"
        }), /* @__PURE__ */ h(Disclosure, {
          onClick: () => setOpen(!open),
          open,
          title: "Tolgee Credentials"
        }, /* @__PURE__ */ h(Text, null, /* @__PURE__ */ h(Muted, null, "Tolgee URL")), /* @__PURE__ */ h(VerticalSpace, {
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
        })), error ? /* @__PURE__ */ h(Banner, {
          icon: /* @__PURE__ */ h(IconWarning32, null)
        }, error) : /* @__PURE__ */ h("div", null), /* @__PURE__ */ h(VerticalSpace, {
          space: "medium"
        }), /* @__PURE__ */ h(Text, null, /* @__PURE__ */ h(Muted, null, "Language")), /* @__PURE__ */ h(VerticalSpace, {
          space: "small"
        }), /* @__PURE__ */ h(Dropdown, {
          placeholder: "Language",
          disabled: !languages.length,
          onChange: ({ currentTarget: { value: lang } }) => setTolgeeConfig(__spreadProps(__spreadValues({}, tolgeeConfig), { lang })),
          options: languages,
          value: languages.find((e3) => e3.value === tolgeeConfig.lang) ? (_c = tolgeeConfig.lang) != null ? _c : null : null
        }), /* @__PURE__ */ h(VerticalSpace, {
          space: "extraLarge"
        }), /* @__PURE__ */ h(Columns, {
          space: "extraSmall",
          style: {
            bottom: "12px",
            position: "absolute",
            left: "12px",
            right: "12px"
          }
        }, /* @__PURE__ */ h(Button, {
          fullWidth: true,
          onClick: handleSubmit
        }, languages.length ? "Save" : "Get languages"), /* @__PURE__ */ h(Button, {
          fullWidth: true,
          onClick: handleClose,
          secondary: true
        }, "Close")), /* @__PURE__ */ h(VerticalSpace, {
          space: "small"
        }));
      };
    }
  });

  // src/setup/components/HeadingTab.tsx
  var HeadingTab;
  var init_HeadingTab = __esm({
    "src/setup/components/HeadingTab.tsx"() {
      "use strict";
      init_preact_module();
      HeadingTab = ({ name, route, currentRoute, onChange }) => {
        return /* @__PURE__ */ h("div", {
          style: { color: route === currentRoute ? "white" : "lightgrey" },
          onClick: () => onChange(route)
        }, name);
      };
    }
  });

  // src/setup/Router.tsx
  var getRoute, Router;
  var init_Router = __esm({
    "src/setup/Router.tsx"() {
      "use strict";
      init_preact_module();
      init_lib2();
      init_Index();
      init_Settings();
      init_GlobalState();
      init_HeadingTab();
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
        const { setRoute } = useGlobalActions();
        const handleRouteChange = (route2) => {
          setRoute(route2);
        };
        return /* @__PURE__ */ h(p, null, /* @__PURE__ */ h(Container, {
          space: "medium"
        }, /* @__PURE__ */ h("div", {
          style: {
            display: "flex",
            justifyContent: "space-between",
            padding: "10px 0px"
          }
        }, /* @__PURE__ */ h(HeadingTab, {
          name: "Home",
          route: "index",
          currentRoute: route,
          onChange: handleRouteChange
        }), /* @__PURE__ */ h("div", {
          style: {
            display: "flex",
            justifyContent: "flex-end",
            gap: "16px"
          }
        }, /* @__PURE__ */ h(HeadingTab, {
          name: "Settings",
          route: "settings",
          currentRoute: route,
          onChange: handleRouteChange
        })))), /* @__PURE__ */ h(Divider, null), getRoute(route));
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
      config
    }, /* @__PURE__ */ h(Router, null));
  }
  var ui_default;
  var init_ui = __esm({
    "src/setup/ui.tsx"() {
      "use strict";
      init_lib2();
      init_preact_module();
      init_styles();
      init_GlobalState();
      init_Router();
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
