/*
@license
Webix Pivot v.9.1.0
This software is covered by Webix Commercial License.
Usage without proper license is prohibited.
(c) XB Software Ltd.
*/
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = global || self, factory(global.pivot = {}));
}(this, (function (exports) { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    function __spreadArrays() {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
        for (var r = Array(s), k = 0, i = 0; i < il; i++)
            for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
                r[k] = a[j];
        return r;
    }

    var NavigationBlocked = (function () {
        function NavigationBlocked() {
        }
        return NavigationBlocked;
    }());
    var JetBase = (function () {
        function JetBase(webix, config) {
            this.webixJet = true;
            this.webix = webix;
            this._events = [];
            this._subs = {};
            this._data = {};
            if (config && config.params)
                webix.extend(this._data, config.params);
        }
        JetBase.prototype.getRoot = function () {
            return this._root;
        };
        JetBase.prototype.destructor = function () {
            this._detachEvents();
            this._destroySubs();
            this._events = this._container = this.app = this._parent = this._root = null;
        };
        JetBase.prototype.setParam = function (id, value, url) {
            if (this._data[id] !== value) {
                this._data[id] = value;
                this._segment.update(id, value, 0);
                if (url) {
                    return this.show(null);
                }
            }
        };
        JetBase.prototype.getParam = function (id, parent) {
            var value = this._data[id];
            if (typeof value !== "undefined" || !parent) {
                return value;
            }
            var view = this.getParentView();
            if (view) {
                return view.getParam(id, parent);
            }
        };
        JetBase.prototype.getUrl = function () {
            return this._segment.suburl();
        };
        JetBase.prototype.getUrlString = function () {
            return this._segment.toString();
        };
        JetBase.prototype.getParentView = function () {
            return this._parent;
        };
        JetBase.prototype.$$ = function (id) {
            if (typeof id === "string") {
                var root_1 = this.getRoot();
                return root_1.queryView((function (obj) { return (obj.config.id === id || obj.config.localId === id) &&
                    (obj.$scope === root_1.$scope); }), "self");
            }
            else {
                return id;
            }
        };
        JetBase.prototype.on = function (obj, name, code) {
            var id = obj.attachEvent(name, code);
            this._events.push({ obj: obj, id: id });
            return id;
        };
        JetBase.prototype.contains = function (view) {
            for (var key in this._subs) {
                var kid = this._subs[key].view;
                if (kid === view || kid.contains(view)) {
                    return true;
                }
            }
            return false;
        };
        JetBase.prototype.getSubView = function (name) {
            var sub = this.getSubViewInfo(name);
            if (sub) {
                return sub.subview.view;
            }
        };
        JetBase.prototype.getSubViewInfo = function (name) {
            var sub = this._subs[name || "default"];
            if (sub) {
                return { subview: sub, parent: this };
            }
            if (name === "_top") {
                this._subs[name] = { url: "", id: null, popup: true };
                return this.getSubViewInfo(name);
            }
            if (this._parent) {
                return this._parent.getSubViewInfo(name);
            }
            return null;
        };
        JetBase.prototype._detachEvents = function () {
            var events = this._events;
            for (var i = events.length - 1; i >= 0; i--) {
                events[i].obj.detachEvent(events[i].id);
            }
        };
        JetBase.prototype._destroySubs = function () {
            for (var key in this._subs) {
                var subView = this._subs[key].view;
                if (subView) {
                    subView.destructor();
                }
            }
            this._subs = {};
        };
        JetBase.prototype._init_url_data = function () {
            var url = this._segment.current();
            this._data = {};
            this.webix.extend(this._data, url.params, true);
        };
        JetBase.prototype._getDefaultSub = function () {
            if (this._subs.default) {
                return this._subs.default;
            }
            for (var key in this._subs) {
                var sub = this._subs[key];
                if (!sub.branch && sub.view && key !== "_top") {
                    var child = sub.view._getDefaultSub();
                    if (child) {
                        return child;
                    }
                }
            }
        };
        JetBase.prototype._routed_view = function () {
            var parent = this.getParentView();
            if (!parent) {
                return true;
            }
            var sub = parent._getDefaultSub();
            if (!sub && sub !== this) {
                return false;
            }
            return parent._routed_view();
        };
        return JetBase;
    }());
    function parse(url) {
        if (url[0] === "/") {
            url = url.substr(1);
        }
        var parts = url.split("/");
        var chunks = [];
        for (var i = 0; i < parts.length; i++) {
            var test = parts[i];
            var result = {};
            var pos = test.indexOf(":");
            if (pos === -1) {
                pos = test.indexOf("?");
            }
            if (pos !== -1) {
                var params = test.substr(pos + 1).split(/[\:\?\&]/g);
                for (var _i = 0, params_1 = params; _i < params_1.length; _i++) {
                    var param = params_1[_i];
                    var dchunk = param.split("=");
                    result[dchunk[0]] = decodeURIComponent(dchunk[1]);
                }
            }
            chunks[i] = {
                page: (pos > -1 ? test.substr(0, pos) : test),
                params: result,
                isNew: true
            };
        }
        return chunks;
    }
    function url2str(stack) {
        var url = [];
        for (var _i = 0, stack_1 = stack; _i < stack_1.length; _i++) {
            var chunk = stack_1[_i];
            url.push("/" + chunk.page);
            var params = obj2str(chunk.params);
            if (params) {
                url.push("?" + params);
            }
        }
        return url.join("");
    }
    function obj2str(obj) {
        var str = [];
        for (var key in obj) {
            if (typeof obj[key] === "object")
                continue;
            if (str.length) {
                str.push("&");
            }
            str.push(key + "=" + encodeURIComponent(obj[key]));
        }
        return str.join("");
    }
    var Route = (function () {
        function Route(route, index) {
            this._next = 1;
            if (typeof route === "string") {
                this.route = {
                    url: parse(route),
                    path: route
                };
            }
            else {
                this.route = route;
            }
            this.index = index;
        }
        Route.prototype.current = function () {
            return this.route.url[this.index];
        };
        Route.prototype.next = function () {
            return this.route.url[this.index + this._next];
        };
        Route.prototype.suburl = function () {
            return this.route.url.slice(this.index);
        };
        Route.prototype.shift = function (params) {
            var route = new Route(this.route, this.index + this._next);
            route.setParams(route.route.url, params, route.index);
            return route;
        };
        Route.prototype.setParams = function (url, params, index) {
            if (params) {
                var old = url[index].params;
                for (var key in params)
                    old[key] = params[key];
            }
        };
        Route.prototype.refresh = function () {
            var url = this.route.url;
            for (var i = this.index + 1; i < url.length; i++) {
                url[i].isNew = true;
            }
        };
        Route.prototype.toString = function () {
            var str = url2str(this.suburl());
            return str ? str.substr(1) : "";
        };
        Route.prototype._join = function (path, kids) {
            var url = this.route.url;
            if (path === null) {
                return url;
            }
            var old = this.route.url;
            var reset = true;
            url = old.slice(0, this.index + (kids ? this._next : 0));
            if (path) {
                url = url.concat(parse(path));
                for (var i = 0; i < url.length; i++) {
                    if (old[i]) {
                        url[i].view = old[i].view;
                    }
                    if (reset && old[i] && url[i].page === old[i].page) {
                        url[i].isNew = false;
                    }
                    else if (url[i].isNew) {
                        reset = false;
                    }
                }
            }
            return url;
        };
        Route.prototype.append = function (path) {
            var url = this._join(path, true);
            this.route.path = url2str(url);
            this.route.url = url;
            return this.route.path;
        };
        Route.prototype.show = function (path, view, kids) {
            var _this = this;
            var url = this._join(path.url, kids);
            this.setParams(url, path.params, this.index + (kids ? this._next : 0));
            return new Promise(function (res, rej) {
                var redirect = url2str(url);
                var obj = {
                    url: url,
                    redirect: redirect,
                    confirm: Promise.resolve()
                };
                var app = view ? view.app : null;
                if (app) {
                    var result = app.callEvent("app:guard", [obj.redirect, view, obj]);
                    if (!result) {
                        rej(new NavigationBlocked());
                        return;
                    }
                }
                obj.confirm.catch(function (err) { return rej(err); }).then(function () {
                    if (obj.redirect === null) {
                        rej(new NavigationBlocked());
                        return;
                    }
                    if (obj.redirect !== redirect) {
                        app.show(obj.redirect);
                        rej(new NavigationBlocked());
                        return;
                    }
                    _this.route.path = redirect;
                    _this.route.url = url;
                    res();
                });
            });
        };
        Route.prototype.size = function (n) {
            this._next = n;
        };
        Route.prototype.split = function () {
            var route = {
                url: this.route.url.slice(this.index + 1),
                path: ""
            };
            if (route.url.length) {
                route.path = url2str(route.url);
            }
            return new Route(route, 0);
        };
        Route.prototype.update = function (name, value, index) {
            var chunk = this.route.url[this.index + (index || 0)];
            if (!chunk) {
                this.route.url.push({ page: "", params: {} });
                return this.update(name, value, index);
            }
            if (name === "") {
                chunk.page = value;
            }
            else {
                chunk.params[name] = value;
            }
            this.route.path = url2str(this.route.url);
        };
        return Route;
    }());
    var JetView = (function (_super) {
        __extends(JetView, _super);
        function JetView(app, config) {
            var _this = _super.call(this, app.webix) || this;
            _this.app = app;
            _this._children = [];
            return _this;
        }
        JetView.prototype.ui = function (ui, config) {
            config = config || {};
            var container = config.container || ui.container;
            var jetview = this.app.createView(ui);
            this._children.push(jetview);
            jetview.render(container, this._segment, this);
            if (typeof ui !== "object" || (ui instanceof JetBase)) {
                return jetview;
            }
            else {
                return jetview.getRoot();
            }
        };
        JetView.prototype.show = function (path, config) {
            config = config || {};
            if (typeof path === "object") {
                for (var key in path) {
                    this.setParam(key, path[key]);
                }
                path = null;
            }
            else {
                if (path.substr(0, 1) === "/") {
                    return this.app.show(path, config);
                }
                if (path.indexOf("./") === 0) {
                    path = path.substr(2);
                }
                if (path.indexOf("../") === 0) {
                    var parent_1 = this.getParentView();
                    if (parent_1) {
                        return parent_1.show(path.substr(3), config);
                    }
                    else {
                        return this.app.show("/" + path.substr(3));
                    }
                }
                var sub = this.getSubViewInfo(config.target);
                if (sub) {
                    if (sub.parent !== this) {
                        return sub.parent.show(path, config);
                    }
                    else if (config.target && config.target !== "default") {
                        return this._renderFrameLock(config.target, sub.subview, {
                            url: path,
                            params: config.params,
                        });
                    }
                }
                else {
                    if (path) {
                        return this.app.show("/" + path, config);
                    }
                }
            }
            return this._show(this._segment, { url: path, params: config.params }, this);
        };
        JetView.prototype._show = function (segment, path, view) {
            var _this = this;
            return segment.show(path, view, true).then(function () {
                _this._init_url_data();
                return _this._urlChange();
            }).then(function () {
                if (segment.route.linkRouter) {
                    _this.app.getRouter().set(segment.route.path, { silent: true });
                    _this.app.callEvent("app:route", [segment.route.path]);
                }
            });
        };
        JetView.prototype.init = function (_$view, _$) {
        };
        JetView.prototype.ready = function (_$view, _$url) {
        };
        JetView.prototype.config = function () {
            this.app.webix.message("View:Config is not implemented");
        };
        JetView.prototype.urlChange = function (_$view, _$url) {
        };
        JetView.prototype.destroy = function () {
        };
        JetView.prototype.destructor = function () {
            this.destroy();
            this._destroyKids();
            if (this._root) {
                this._root.destructor();
                _super.prototype.destructor.call(this);
            }
        };
        JetView.prototype.use = function (plugin, config) {
            plugin(this.app, this, config);
        };
        JetView.prototype.refresh = function () {
            var url = this.getUrl();
            this.destroy();
            this._destroyKids();
            this._destroySubs();
            this._detachEvents();
            if (this._container.tagName) {
                this._root.destructor();
            }
            this._segment.refresh();
            return this._render(this._segment);
        };
        JetView.prototype.render = function (root, url, parent) {
            var _this = this;
            if (typeof url === "string") {
                url = new Route(url, 0);
            }
            this._segment = url;
            this._parent = parent;
            this._init_url_data();
            root = root || document.body;
            var _container = (typeof root === "string") ? this.webix.toNode(root) : root;
            if (this._container !== _container) {
                this._container = _container;
                return this._render(url);
            }
            else {
                return this._urlChange().then(function () { return _this.getRoot(); });
            }
        };
        JetView.prototype._render = function (url) {
            var _this = this;
            var config = this.config();
            if (config.then) {
                return config.then(function (cfg) { return _this._render_final(cfg, url); });
            }
            else {
                return this._render_final(config, url);
            }
        };
        JetView.prototype._render_final = function (config, url) {
            var _this = this;
            var slot = null;
            var container = null;
            var show = false;
            if (!this._container.tagName) {
                slot = this._container;
                if (slot.popup) {
                    container = document.body;
                    show = true;
                }
                else {
                    container = this.webix.$$(slot.id);
                }
            }
            else {
                container = this._container;
            }
            if (!this.app || !container) {
                return Promise.reject(null);
            }
            var response;
            var current = this._segment.current();
            var result = { ui: {} };
            this.app.copyConfig(config, result.ui, this._subs);
            this.app.callEvent("app:render", [this, url, result]);
            result.ui.$scope = this;
            if (!slot && current.isNew && current.view) {
                current.view.destructor();
            }
            try {
                if (slot && !show) {
                    var oldui = container;
                    var parent_2 = oldui.getParentView();
                    if (parent_2 && parent_2.name === "multiview" && !result.ui.id) {
                        result.ui.id = oldui.config.id;
                    }
                }
                this._root = this.app.webix.ui(result.ui, container);
                var asWin = this._root;
                if (show && asWin.setPosition && !asWin.isVisible()) {
                    asWin.show();
                }
                if (slot) {
                    if (slot.view && slot.view !== this && slot.view !== this.app) {
                        slot.view.destructor();
                    }
                    slot.id = this._root.config.id;
                    if (this.getParentView() || !this.app.app)
                        slot.view = this;
                    else {
                        slot.view = this.app;
                    }
                }
                if (current.isNew) {
                    current.view = this;
                    current.isNew = false;
                }
                response = Promise.resolve(this._init(this._root, url)).then(function () {
                    return _this._urlChange().then(function () {
                        _this._initUrl = null;
                        return _this.ready(_this._root, url.suburl());
                    });
                });
            }
            catch (e) {
                response = Promise.reject(e);
            }
            return response.catch(function (err) { return _this._initError(_this, err); });
        };
        JetView.prototype._init = function (view, url) {
            return this.init(view, url.suburl());
        };
        JetView.prototype._urlChange = function () {
            var _this = this;
            this.app.callEvent("app:urlchange", [this, this._segment]);
            var waits = [];
            for (var key in this._subs) {
                var frame = this._subs[key];
                var wait = this._renderFrameLock(key, frame, null);
                if (wait) {
                    waits.push(wait);
                }
            }
            return Promise.all(waits).then(function () {
                return _this.urlChange(_this._root, _this._segment.suburl());
            });
        };
        JetView.prototype._renderFrameLock = function (key, frame, path) {
            if (!frame.lock) {
                var lock = this._renderFrame(key, frame, path);
                if (lock) {
                    frame.lock = lock.then(function () { return frame.lock = null; }, function () { return frame.lock = null; });
                }
            }
            return frame.lock;
        };
        JetView.prototype._renderFrame = function (key, frame, path) {
            var _this = this;
            if (key === "default") {
                if (this._segment.next()) {
                    var params = path ? path.params : null;
                    if (frame.params) {
                        params = this.webix.extend(params || {}, frame.params);
                    }
                    return this._createSubView(frame, this._segment.shift(params));
                }
                else if (frame.view && frame.popup) {
                    frame.view.destructor();
                    frame.view = null;
                }
            }
            if (path !== null) {
                frame.url = path.url;
                if (frame.params) {
                    path.params = this.webix.extend(path.params || {}, frame.params);
                }
            }
            if (frame.route) {
                if (path !== null) {
                    return frame.route.show(path, frame.view).then(function () {
                        return _this._createSubView(frame, frame.route);
                    });
                }
                if (frame.branch) {
                    return;
                }
            }
            var view = frame.view;
            if (!view && frame.url) {
                if (typeof frame.url === "string") {
                    frame.route = new Route(frame.url, 0);
                    if (path)
                        frame.route.setParams(frame.route.route.url, path.params, 0);
                    if (frame.params)
                        frame.route.setParams(frame.route.route.url, frame.params, 0);
                    return this._createSubView(frame, frame.route);
                }
                else {
                    if (typeof frame.url === "function" && !(view instanceof frame.url)) {
                        view = new (this.app._override(frame.url))(this.app, "");
                    }
                    if (!view) {
                        view = frame.url;
                    }
                }
            }
            if (view) {
                return view.render(frame, (frame.route || this._segment), this);
            }
        };
        JetView.prototype._initError = function (view, err) {
            if (this.app) {
                this.app.error("app:error:initview", [err, view]);
            }
            return true;
        };
        JetView.prototype._createSubView = function (sub, suburl) {
            var _this = this;
            return this.app.createFromURL(suburl.current()).then(function (view) {
                return view.render(sub, suburl, _this);
            });
        };
        JetView.prototype._destroyKids = function () {
            var uis = this._children;
            for (var i = uis.length - 1; i >= 0; i--) {
                if (uis[i] && uis[i].destructor) {
                    uis[i].destructor();
                }
            }
            this._children = [];
        };
        return JetView;
    }(JetBase));
    var JetViewRaw = (function (_super) {
        __extends(JetViewRaw, _super);
        function JetViewRaw(app, config) {
            var _this = _super.call(this, app, config) || this;
            _this._ui = config.ui;
            return _this;
        }
        JetViewRaw.prototype.config = function () {
            return this._ui;
        };
        return JetViewRaw;
    }(JetView));
    var SubRouter = (function () {
        function SubRouter(cb, config, app) {
            this.path = "";
            this.app = app;
        }
        SubRouter.prototype.set = function (path, config) {
            this.path = path;
            var a = this.app;
            a.app.getRouter().set(a._segment.append(this.path), { silent: true });
        };
        SubRouter.prototype.get = function () {
            return this.path;
        };
        return SubRouter;
    }());
    var _once = true;
    var JetAppBase = (function (_super) {
        __extends(JetAppBase, _super);
        function JetAppBase(config) {
            var _this = this;
            var webix = (config || {}).webix || window.webix;
            config = webix.extend({
                name: "App",
                version: "1.0",
                start: "/home"
            }, config, true);
            _this = _super.call(this, webix, config) || this;
            _this.config = config;
            _this.app = _this.config.app;
            _this.ready = Promise.resolve();
            _this._services = {};
            _this.webix.extend(_this, _this.webix.EventSystem);
            return _this;
        }
        JetAppBase.prototype.getUrl = function () {
            return this._subSegment.suburl();
        };
        JetAppBase.prototype.getUrlString = function () {
            return this._subSegment.toString();
        };
        JetAppBase.prototype.getService = function (name) {
            var obj = this._services[name];
            if (typeof obj === "function") {
                obj = this._services[name] = obj(this);
            }
            return obj;
        };
        JetAppBase.prototype.setService = function (name, handler) {
            this._services[name] = handler;
        };
        JetAppBase.prototype.destructor = function () {
            this.getSubView().destructor();
            _super.prototype.destructor.call(this);
        };
        JetAppBase.prototype.copyConfig = function (obj, target, config) {
            if (obj instanceof JetBase ||
                (typeof obj === "function" && obj.prototype instanceof JetBase)) {
                obj = { $subview: obj };
            }
            if (typeof obj.$subview != "undefined") {
                return this.addSubView(obj, target, config);
            }
            var isArray = obj instanceof Array;
            target = target || (isArray ? [] : {});
            for (var method in obj) {
                var point = obj[method];
                if (typeof point === "function" && point.prototype instanceof JetBase) {
                    point = { $subview: point };
                }
                if (point && typeof point === "object" &&
                    !(point instanceof this.webix.DataCollection) && !(point instanceof RegExp) && !(point instanceof Map)) {
                    if (point instanceof Date) {
                        target[method] = new Date(point);
                    }
                    else {
                        var copy = this.copyConfig(point, (point instanceof Array ? [] : {}), config);
                        if (copy !== null) {
                            if (isArray)
                                target.push(copy);
                            else
                                target[method] = copy;
                        }
                    }
                }
                else {
                    target[method] = point;
                }
            }
            return target;
        };
        JetAppBase.prototype.getRouter = function () {
            return this.$router;
        };
        JetAppBase.prototype.clickHandler = function (e, target) {
            if (e) {
                target = target || (e.target || e.srcElement);
                if (target && target.getAttribute) {
                    var trigger_1 = target.getAttribute("trigger");
                    if (trigger_1) {
                        this._forView(target, function (view) { return view.app.trigger(trigger_1); });
                        e.cancelBubble = true;
                        return e.preventDefault();
                    }
                    var route_1 = target.getAttribute("route");
                    if (route_1) {
                        this._forView(target, function (view) { return view.show(route_1); });
                        e.cancelBubble = true;
                        return e.preventDefault();
                    }
                }
            }
            var parent = target.parentNode;
            if (parent) {
                this.clickHandler(e, parent);
            }
        };
        JetAppBase.prototype.getRoot = function () {
            return this.getSubView().getRoot();
        };
        JetAppBase.prototype.refresh = function () {
            var _this = this;
            if (!this._subSegment) {
                return Promise.resolve(null);
            }
            return this.getSubView().refresh().then(function (view) {
                _this.callEvent("app:route", [_this.getUrl()]);
                return view;
            });
        };
        JetAppBase.prototype.loadView = function (url) {
            var _this = this;
            var views = this.config.views;
            var result = null;
            if (url === "") {
                return Promise.resolve(this._loadError("", new Error("Webix Jet: Empty url segment")));
            }
            try {
                if (views) {
                    if (typeof views === "function") {
                        result = views(url);
                    }
                    else {
                        result = views[url];
                    }
                    if (typeof result === "string") {
                        url = result;
                        result = null;
                    }
                }
                if (!result) {
                    if (url === "_hidden") {
                        result = { hidden: true };
                    }
                    else if (url === "_blank") {
                        result = {};
                    }
                    else {
                        url = url.replace(/\./g, "/");
                        result = this.require("jet-views", url);
                    }
                }
            }
            catch (e) {
                result = this._loadError(url, e);
            }
            if (!result.then) {
                result = Promise.resolve(result);
            }
            result = result
                .then(function (module) { return module.__esModule ? module.default : module; })
                .catch(function (err) { return _this._loadError(url, err); });
            return result;
        };
        JetAppBase.prototype._forView = function (target, handler) {
            var view = this.webix.$$(target);
            if (view) {
                handler(view.$scope);
            }
        };
        JetAppBase.prototype._loadViewDynamic = function (url) {
            return null;
        };
        JetAppBase.prototype.createFromURL = function (chunk) {
            var _this = this;
            var view;
            if (chunk.isNew || !chunk.view) {
                view = this.loadView(chunk.page)
                    .then(function (ui) { return _this.createView(ui, name, chunk.params); });
            }
            else {
                view = Promise.resolve(chunk.view);
            }
            return view;
        };
        JetAppBase.prototype._override = function (ui) {
            var over = this.config.override;
            if (over) {
                var dv = void 0;
                while (ui) {
                    dv = ui;
                    ui = over.get(ui);
                }
                return dv;
            }
            return ui;
        };
        JetAppBase.prototype.createView = function (ui, name, params) {
            ui = this._override(ui);
            var obj;
            if (typeof ui === "function") {
                if (ui.prototype instanceof JetAppBase) {
                    return new ui({ app: this, name: name, params: params, router: SubRouter });
                }
                else if (ui.prototype instanceof JetBase) {
                    return new ui(this, { name: name, params: params });
                }
                else {
                    ui = ui(this);
                }
            }
            if (ui instanceof JetBase) {
                obj = ui;
            }
            else {
                obj = new JetViewRaw(this, { name: name, ui: ui });
            }
            return obj;
        };
        JetAppBase.prototype.show = function (url, config) {
            if (url && this.app && url.indexOf("//") == 0)
                return this.app.show(url.substr(1), config);
            return this.render(this._container, url || this.config.start, config);
        };
        JetAppBase.prototype.trigger = function (name) {
            var rest = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                rest[_i - 1] = arguments[_i];
            }
            this.apply(name, rest);
        };
        JetAppBase.prototype.apply = function (name, data) {
            this.callEvent(name, data);
        };
        JetAppBase.prototype.action = function (name) {
            return this.webix.bind(function () {
                var rest = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    rest[_i] = arguments[_i];
                }
                this.apply(name, rest);
            }, this);
        };
        JetAppBase.prototype.on = function (name, handler) {
            this.attachEvent(name, handler);
        };
        JetAppBase.prototype.use = function (plugin, config) {
            plugin(this, null, config);
        };
        JetAppBase.prototype.error = function (name, er) {
            this.callEvent(name, er);
            this.callEvent("app:error", er);
            if (this.config.debug) {
                for (var i = 0; i < er.length; i++) {
                    console.error(er[i]);
                    if (er[i] instanceof Error) {
                        var text = er[i].message;
                        if (text.indexOf("Module build failed") === 0) {
                            text = text.replace(/\x1b\[[0-9;]*m/g, "");
                            document.body.innerHTML = "<pre style='font-size:16px; background-color: #ec6873; color: #000; padding:10px;'>" + text + "</pre>";
                        }
                        else {
                            text += "<br><br>Check console for more details";
                            this.webix.message({ type: "error", text: text, expire: -1 });
                        }
                    }
                }
                debugger;
            }
        };
        JetAppBase.prototype.render = function (root, url, config) {
            var _this = this;
            this._container = (typeof root === "string") ?
                this.webix.toNode(root) :
                (root || document.body);
            var firstInit = !this.$router;
            var path = null;
            if (firstInit) {
                if (_once && "tagName" in this._container) {
                    this.webix.event(document.body, "click", function (e) { return _this.clickHandler(e); });
                    _once = false;
                }
                if (typeof url === "string") {
                    url = new Route(url, 0);
                }
                this._subSegment = this._first_start(url);
                this._subSegment.route.linkRouter = true;
            }
            else {
                if (typeof url === "string") {
                    path = url;
                }
                else {
                    if (this.app) {
                        path = url.split().route.path || this.config.start;
                    }
                    else {
                        path = url.toString();
                    }
                }
            }
            var params = config ? config.params : this.config.params || null;
            var top = this.getSubView();
            var segment = this._subSegment;
            var ready = segment
                .show({ url: path, params: params }, top)
                .then(function () { return _this.createFromURL(segment.current()); })
                .then(function (view) { return view.render(root, segment); })
                .then(function (base) {
                _this.$router.set(segment.route.path, { silent: true });
                _this.callEvent("app:route", [_this.getUrl()]);
                return base;
            });
            this.ready = this.ready.then(function () { return ready; });
            return ready;
        };
        JetAppBase.prototype.getSubView = function () {
            if (this._subSegment) {
                var view = this._subSegment.current().view;
                if (view)
                    return view;
            }
            return new JetView(this, {});
        };
        JetAppBase.prototype.require = function (type, url) { return null; };
        JetAppBase.prototype._first_start = function (route) {
            var _this = this;
            this._segment = route;
            var cb = function (a) { return setTimeout(function () {
                _this.show(a).catch(function (e) {
                    if (!(e instanceof NavigationBlocked))
                        throw e;
                });
            }, 1); };
            this.$router = new (this.config.router)(cb, this.config, this);
            if (this._container === document.body && this.config.animation !== false) {
                var node_1 = this._container;
                this.webix.html.addCss(node_1, "webixappstart");
                setTimeout(function () {
                    _this.webix.html.removeCss(node_1, "webixappstart");
                    _this.webix.html.addCss(node_1, "webixapp");
                }, 10);
            }
            if (!route) {
                var urlString = this.$router.get();
                if (!urlString) {
                    urlString = this.config.start;
                    this.$router.set(urlString, { silent: true });
                }
                route = new Route(urlString, 0);
            }
            else if (this.app) {
                var now = route.current().view;
                route.current().view = this;
                if (route.next()) {
                    route.refresh();
                    route = route.split();
                }
                else {
                    route = new Route(this.config.start, 0);
                }
                route.current().view = now;
            }
            return route;
        };
        JetAppBase.prototype._loadError = function (url, err) {
            this.error("app:error:resolve", [err, url]);
            return { template: " " };
        };
        JetAppBase.prototype.addSubView = function (obj, target, config) {
            var url = obj.$subview !== true ? obj.$subview : null;
            var name = obj.name || (url ? this.webix.uid() : "default");
            target.id = obj.id || "s" + this.webix.uid();
            var view = config[name] = {
                id: target.id,
                url: url,
                branch: obj.branch,
                popup: obj.popup,
                params: obj.params
            };
            return view.popup ? null : target;
        };
        return JetAppBase;
    }(JetBase));
    var HashRouter = (function () {
        function HashRouter(cb, config) {
            var _this = this;
            this.config = config || {};
            this._detectPrefix();
            this.cb = cb;
            window.onpopstate = function () { return _this.cb(_this.get()); };
        }
        HashRouter.prototype.set = function (path, config) {
            var _this = this;
            if (this.config.routes) {
                var compare = path.split("?", 2);
                for (var key in this.config.routes) {
                    if (this.config.routes[key] === compare[0]) {
                        path = key + (compare.length > 1 ? "?" + compare[1] : "");
                        break;
                    }
                }
            }
            if (this.get() !== path) {
                window.history.pushState(null, null, this.prefix + this.sufix + path);
            }
            if (!config || !config.silent) {
                setTimeout(function () { return _this.cb(path); }, 1);
            }
        };
        HashRouter.prototype.get = function () {
            var path = this._getRaw().replace(this.prefix, "").replace(this.sufix, "");
            path = (path !== "/" && path !== "#") ? path : "";
            if (this.config.routes) {
                var compare = path.split("?", 2);
                var key = this.config.routes[compare[0]];
                if (key) {
                    path = key + (compare.length > 1 ? "?" + compare[1] : "");
                }
            }
            return path;
        };
        HashRouter.prototype._detectPrefix = function () {
            var sufix = this.config.routerPrefix;
            this.sufix = "#" + ((typeof sufix === "undefined") ? "!" : sufix);
            this.prefix = document.location.href.split("#", 2)[0];
        };
        HashRouter.prototype._getRaw = function () {
            return document.location.href;
        };
        return HashRouter;
    }());
    var isPatched = false;
    function patch(w) {
        if (isPatched || !w) {
            return;
        }
        isPatched = true;
        var win = window;
        if (!win.Promise) {
            win.Promise = w.promise;
        }
        var version = w.version.split(".");
        if (version[0] * 10 + version[1] * 1 < 53) {
            w.ui.freeze = function (handler) {
                var res = handler();
                if (res && res.then) {
                    res.then(function (some) {
                        w.ui.$freeze = false;
                        w.ui.resize();
                        return some;
                    });
                }
                else {
                    w.ui.$freeze = false;
                    w.ui.resize();
                }
                return res;
            };
        }
        var baseAdd = w.ui.baselayout.prototype.addView;
        var baseRemove = w.ui.baselayout.prototype.removeView;
        var config = {
            addView: function (view, index) {
                if (this.$scope && this.$scope.webixJet && !view.queryView) {
                    var jview_1 = this.$scope;
                    var subs_1 = {};
                    view = jview_1.app.copyConfig(view, {}, subs_1);
                    baseAdd.apply(this, [view, index]);
                    var _loop_1 = function (key) {
                        jview_1._renderFrame(key, subs_1[key], null).then(function () {
                            jview_1._subs[key] = subs_1[key];
                        });
                    };
                    for (var key in subs_1) {
                        _loop_1(key);
                    }
                    return view.id;
                }
                else {
                    return baseAdd.apply(this, arguments);
                }
            },
            removeView: function () {
                baseRemove.apply(this, arguments);
                if (this.$scope && this.$scope.webixJet) {
                    var subs = this.$scope._subs;
                    for (var key in subs) {
                        var test = subs[key];
                        if (!w.$$(test.id)) {
                            test.view.destructor();
                            delete subs[key];
                        }
                    }
                }
            }
        };
        w.extend(w.ui.layout.prototype, config, true);
        w.extend(w.ui.baselayout.prototype, config, true);
        w.protoUI({
            name: "jetapp",
            $init: function (cfg) {
                this.$app = new this.app(cfg);
                var id = w.uid().toString();
                cfg.body = { id: id };
                this.$ready.push(function () {
                    this.callEvent("onInit", [this.$app]);
                    this.$app.render({ id: id });
                });
            }
        }, w.ui.proxy, w.EventSystem);
    }
    var JetApp = (function (_super) {
        __extends(JetApp, _super);
        function JetApp(config) {
            var _this = this;
            config.router = config.router || HashRouter;
            _this = _super.call(this, config) || this;
            patch(_this.webix);
            return _this;
        }
        JetApp.prototype.require = function (type, url) {
            return require(type + "/" + url);
        };
        return JetApp;
    }(JetAppBase));
    var UrlRouter = (function (_super) {
        __extends(UrlRouter, _super);
        function UrlRouter() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        UrlRouter.prototype._detectPrefix = function () {
            this.prefix = "";
            this.sufix = this.config.routerPrefix || "";
        };
        UrlRouter.prototype._getRaw = function () {
            return document.location.pathname + (document.location.search || "");
        };
        return UrlRouter;
    }(HashRouter));
    var EmptyRouter = (function () {
        function EmptyRouter(cb, _$config) {
            this.path = "";
            this.cb = cb;
        }
        EmptyRouter.prototype.set = function (path, config) {
            var _this = this;
            this.path = path;
            if (!config || !config.silent) {
                setTimeout(function () { return _this.cb(path); }, 1);
            }
        };
        EmptyRouter.prototype.get = function () {
            return this.path;
        };
        return EmptyRouter;
    }());
    function UnloadGuard(app, view, config) {
        view.on(app, "app:guard", function (_$url, point, promise) {
            if (point === view || point.contains(view)) {
                var res_1 = config();
                if (res_1 === false) {
                    promise.confirm = Promise.reject(new NavigationBlocked());
                }
                else {
                    promise.confirm = promise.confirm.then(function () { return res_1; });
                }
            }
        });
    }
    function has(store, key) {
        return Object.prototype.hasOwnProperty.call(store, key);
    }
    function forEach(obj, handler, context) {
        for (var key in obj) {
            if (has(obj, key)) {
                handler.call((context || obj), obj[key], key, obj);
            }
        }
    }
    function trim(str) {
        return str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
    }
    function warn(message) {
        message = 'Warning: ' + message;
        if (typeof console !== 'undefined') {
            console.error(message);
        }
        try {
            throw new Error(message);
        }
        catch (x) { }
    }
    var replace = String.prototype.replace;
    var split = String.prototype.split;
    var delimiter = '||||';
    var russianPluralGroups = function (n) {
        var end = n % 10;
        if (n !== 11 && end === 1) {
            return 0;
        }
        if (2 <= end && end <= 4 && !(n >= 12 && n <= 14)) {
            return 1;
        }
        return 2;
    };
    var pluralTypes = {
        arabic: function (n) {
            if (n < 3) {
                return n;
            }
            var lastTwo = n % 100;
            if (lastTwo >= 3 && lastTwo <= 10)
                return 3;
            return lastTwo >= 11 ? 4 : 5;
        },
        bosnian_serbian: russianPluralGroups,
        chinese: function () { return 0; },
        croatian: russianPluralGroups,
        french: function (n) { return n > 1 ? 1 : 0; },
        german: function (n) { return n !== 1 ? 1 : 0; },
        russian: russianPluralGroups,
        lithuanian: function (n) {
            if (n % 10 === 1 && n % 100 !== 11) {
                return 0;
            }
            return n % 10 >= 2 && n % 10 <= 9 && (n % 100 < 11 || n % 100 > 19) ? 1 : 2;
        },
        czech: function (n) {
            if (n === 1) {
                return 0;
            }
            return (n >= 2 && n <= 4) ? 1 : 2;
        },
        polish: function (n) {
            if (n === 1) {
                return 0;
            }
            var end = n % 10;
            return 2 <= end && end <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2;
        },
        icelandic: function (n) { return (n % 10 !== 1 || n % 100 === 11) ? 1 : 0; },
        slovenian: function (n) {
            var lastTwo = n % 100;
            if (lastTwo === 1) {
                return 0;
            }
            if (lastTwo === 2) {
                return 1;
            }
            if (lastTwo === 3 || lastTwo === 4) {
                return 2;
            }
            return 3;
        }
    };
    var pluralTypeToLanguages = {
        arabic: ['ar'],
        bosnian_serbian: ['bs-Latn-BA', 'bs-Cyrl-BA', 'srl-RS', 'sr-RS'],
        chinese: ['id', 'id-ID', 'ja', 'ko', 'ko-KR', 'lo', 'ms', 'th', 'th-TH', 'zh'],
        croatian: ['hr', 'hr-HR'],
        german: ['fa', 'da', 'de', 'en', 'es', 'fi', 'el', 'he', 'hi-IN', 'hu', 'hu-HU', 'it', 'nl', 'no', 'pt', 'sv', 'tr'],
        french: ['fr', 'tl', 'pt-br'],
        russian: ['ru', 'ru-RU'],
        lithuanian: ['lt'],
        czech: ['cs', 'cs-CZ', 'sk'],
        polish: ['pl'],
        icelandic: ['is'],
        slovenian: ['sl-SL']
    };
    function langToTypeMap(mapping) {
        var ret = {};
        forEach(mapping, function (langs, type) {
            forEach(langs, function (lang) {
                ret[lang] = type;
            });
        });
        return ret;
    }
    function pluralTypeName(locale) {
        var langToPluralType = langToTypeMap(pluralTypeToLanguages);
        return langToPluralType[locale]
            || langToPluralType[split.call(locale, /-/, 1)[0]]
            || langToPluralType.en;
    }
    function pluralTypeIndex(locale, count) {
        return pluralTypes[pluralTypeName(locale)](count);
    }
    function escape(token) {
        return token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    function constructTokenRegex(opts) {
        var prefix = (opts && opts.prefix) || '%{';
        var suffix = (opts && opts.suffix) || '}';
        if (prefix === delimiter || suffix === delimiter) {
            throw new RangeError('"' + delimiter + '" token is reserved for pluralization');
        }
        return new RegExp(escape(prefix) + '(.*?)' + escape(suffix), 'g');
    }
    var dollarRegex = /\$/g;
    var dollarBillsYall = '$$';
    var defaultTokenRegex = /%\{(.*?)\}/g;
    function transformPhrase(phrase, substitutions, locale, tokenRegex) {
        if (typeof phrase !== 'string') {
            throw new TypeError('Polyglot.transformPhrase expects argument #1 to be string');
        }
        if (substitutions == null) {
            return phrase;
        }
        var result = phrase;
        var interpolationRegex = tokenRegex || defaultTokenRegex;
        var options = typeof substitutions === 'number' ? { smart_count: substitutions } : substitutions;
        if (options.smart_count != null && result) {
            var texts = split.call(result, delimiter);
            result = trim(texts[pluralTypeIndex(locale || 'en', options.smart_count)] || texts[0]);
        }
        result = replace.call(result, interpolationRegex, function (expression, argument) {
            if (!has(options, argument) || options[argument] == null) {
                return expression;
            }
            return replace.call(options[argument], dollarRegex, dollarBillsYall);
        });
        return result;
    }
    function Polyglot(options) {
        var opts = options || {};
        this.phrases = {};
        this.extend(opts.phrases || {});
        this.currentLocale = opts.locale || 'en';
        var allowMissing = opts.allowMissing ? transformPhrase : null;
        this.onMissingKey = typeof opts.onMissingKey === 'function' ? opts.onMissingKey : allowMissing;
        this.warn = opts.warn || warn;
        this.tokenRegex = constructTokenRegex(opts.interpolation);
    }
    Polyglot.prototype.locale = function (newLocale) {
        if (newLocale)
            this.currentLocale = newLocale;
        return this.currentLocale;
    };
    Polyglot.prototype.extend = function (morePhrases, prefix) {
        forEach(morePhrases, function (phrase, key) {
            var prefixedKey = prefix ? prefix + '.' + key : key;
            if (typeof phrase === 'object') {
                this.extend(phrase, prefixedKey);
            }
            else {
                this.phrases[prefixedKey] = phrase;
            }
        }, this);
    };
    Polyglot.prototype.unset = function (morePhrases, prefix) {
        if (typeof morePhrases === 'string') {
            delete this.phrases[morePhrases];
        }
        else {
            forEach(morePhrases, function (phrase, key) {
                var prefixedKey = prefix ? prefix + '.' + key : key;
                if (typeof phrase === 'object') {
                    this.unset(phrase, prefixedKey);
                }
                else {
                    delete this.phrases[prefixedKey];
                }
            }, this);
        }
    };
    Polyglot.prototype.clear = function () {
        this.phrases = {};
    };
    Polyglot.prototype.replace = function (newPhrases) {
        this.clear();
        this.extend(newPhrases);
    };
    Polyglot.prototype.t = function (key, options) {
        var phrase, result;
        var opts = options == null ? {} : options;
        if (typeof this.phrases[key] === 'string') {
            phrase = this.phrases[key];
        }
        else if (typeof opts._ === 'string') {
            phrase = opts._;
        }
        else if (this.onMissingKey) {
            var onMissingKey = this.onMissingKey;
            result = onMissingKey(key, opts, this.currentLocale, this.tokenRegex);
        }
        else {
            this.warn('Missing translation for key: "' + key + '"');
            result = key;
        }
        if (typeof phrase === 'string') {
            result = transformPhrase(phrase, opts, this.currentLocale, this.tokenRegex);
        }
        return result;
    };
    Polyglot.prototype.has = function (key) {
        return has(this.phrases, key);
    };
    Polyglot.transformPhrase = function transform(phrase, substitutions, locale) {
        return transformPhrase(phrase, substitutions, locale);
    };
    var webixPolyglot = Polyglot;
    function Locale(app, _view, config) {
        config = config || {};
        var storage = config.storage;
        var lang = storage ? (storage.get("lang") || "en") : (config.lang || "en");
        function setLangData(name, data, silent) {
            if (data.__esModule) {
                data = data.default;
            }
            var pconfig = { phrases: data };
            if (config.polyglot) {
                app.webix.extend(pconfig, config.polyglot);
            }
            var poly = service.polyglot = new webixPolyglot(pconfig);
            poly.locale(name);
            service._ = app.webix.bind(poly.t, poly);
            lang = name;
            if (storage) {
                storage.put("lang", lang);
            }
            if (config.webix) {
                var locName = config.webix[name];
                if (locName) {
                    app.webix.i18n.setLocale(locName);
                }
            }
            if (!silent) {
                return app.refresh();
            }
            return Promise.resolve();
        }
        function getLang() { return lang; }
        function setLang(name, silent) {
            if (config.path === false) {
                return;
            }
            var path = (config.path ? config.path + "/" : "") + name;
            var data = app.require("jet-locales", path);
            setLangData(name, data, silent);
        }
        var service = {
            getLang: getLang, setLang: setLang, setLangData: setLangData,
            _: null, polyglot: null
        };
        app.setService("locale", service);
        setLang(lang, true);
    }
    function show(view, config, value) {
        var _a;
        if (config.urls) {
            value = config.urls[value] || value;
        }
        else if (config.param) {
            value = (_a = {}, _a[config.param] = value, _a);
        }
        view.show(value);
    }
    function Menu(app, view, config) {
        var frame = view.getSubViewInfo().parent;
        var ui = view.$$(config.id || config);
        var silent = false;
        ui.attachEvent("onchange", function () {
            if (!silent) {
                show(frame, config, this.getValue());
            }
        });
        ui.attachEvent("onafterselect", function () {
            if (!silent) {
                var id = null;
                if (ui.setValue) {
                    id = this.getValue();
                }
                else if (ui.getSelectedId) {
                    id = ui.getSelectedId();
                }
                show(frame, config, id);
            }
        });
        view.on(app, "app:route", function () {
            var name = "";
            if (config.param) {
                name = view.getParam(config.param, true);
            }
            else {
                var segment = frame.getUrl()[1];
                if (segment) {
                    name = segment.page;
                }
            }
            if (name) {
                silent = true;
                if (ui.setValue && ui.getValue() !== name) {
                    ui.setValue(name);
                }
                else if (ui.select && ui.exists(name) && ui.getSelectedId() !== name) {
                    ui.select(name);
                }
                silent = false;
            }
        });
    }
    var baseicons = {
        good: "check",
        error: "warning",
        saving: "refresh fa-spin"
    };
    var basetext = {
        good: "Ok",
        error: "Error",
        saving: "Connecting..."
    };
    function Status(app, view, config) {
        var status = "good";
        var count = 0;
        var iserror = false;
        var expireDelay = config.expire;
        if (!expireDelay && expireDelay !== false) {
            expireDelay = 2000;
        }
        var texts = config.texts || basetext;
        var icons = config.icons || baseicons;
        if (typeof config === "string") {
            config = { target: config };
        }
        function refresh(content) {
            var area = view.$$(config.target);
            if (area) {
                if (!content) {
                    content = "<div class='status_" +
                        status +
                        "'><span class='webix_icon fa-" +
                        icons[status] + "'></span> " + texts[status] + "</div>";
                }
                area.setHTML(content);
            }
        }
        function success() {
            count--;
            setStatus("good");
        }
        function fail(err) {
            count--;
            setStatus("error", err);
        }
        function start(promise) {
            count++;
            setStatus("saving");
            if (promise && promise.then) {
                promise.then(success, fail);
            }
        }
        function getStatus() {
            return status;
        }
        function hideStatus() {
            if (count === 0) {
                refresh(" ");
            }
        }
        function setStatus(mode, err) {
            if (count < 0) {
                count = 0;
            }
            if (mode === "saving") {
                status = "saving";
                refresh();
            }
            else {
                iserror = (mode === "error");
                if (count === 0) {
                    status = iserror ? "error" : "good";
                    if (iserror) {
                        app.error("app:error:server", [err.responseText || err]);
                    }
                    else {
                        if (expireDelay) {
                            setTimeout(hideStatus, expireDelay);
                        }
                    }
                    refresh();
                }
            }
        }
        function track(data) {
            var dp = app.webix.dp(data);
            if (dp) {
                view.on(dp, "onAfterDataSend", start);
                view.on(dp, "onAfterSaveError", function (_id, _obj, response) { return fail(response); });
                view.on(dp, "onAfterSave", success);
            }
        }
        app.setService("status", {
            getStatus: getStatus,
            setStatus: setStatus,
            track: track
        });
        if (config.remote) {
            view.on(app.webix, "onRemoteCall", start);
        }
        if (config.ajax) {
            view.on(app.webix, "onBeforeAjax", function (_mode, _url, _data, _request, _headers, _files, promise) {
                start(promise);
            });
        }
        if (config.data) {
            track(config.data);
        }
    }
    function Theme(app, _view, config) {
        config = config || {};
        var storage = config.storage;
        var theme = storage ?
            (storage.get("theme") || "flat-default")
            :
                (config.theme || "flat-default");
        var service = {
            getTheme: function () { return theme; },
            setTheme: function (name, silent) {
                var parts = name.split("-");
                var links = document.getElementsByTagName("link");
                for (var i = 0; i < links.length; i++) {
                    var lname = links[i].getAttribute("title");
                    if (lname) {
                        if (lname === name || lname === parts[0]) {
                            links[i].disabled = false;
                        }
                        else {
                            links[i].disabled = true;
                        }
                    }
                }
                app.webix.skin.set(parts[0]);
                app.webix.html.removeCss(document.body, "theme-" + theme);
                app.webix.html.addCss(document.body, "theme-" + name);
                theme = name;
                if (storage) {
                    storage.put("theme", name);
                }
                if (!silent) {
                    app.refresh();
                }
            }
        };
        app.setService("theme", service);
        service.setTheme(theme, true);
    }
    function copyParams(data, url, route) {
        for (var i = 0; i < route.length; i++) {
            data[route[i]] = url[i + 1] ? url[i + 1].page : "";
        }
    }
    function UrlParam(app, view, config) {
        var route = config.route || config;
        var data = {};
        view.on(app, "app:urlchange", function (subview, segment) {
            if (view === subview) {
                copyParams(data, segment.suburl(), route);
                segment.size(route.length + 1);
            }
        });
        var os = view.setParam;
        var og = view.getParam;
        view.setParam = function (name, value, show) {
            var index = route.indexOf(name);
            if (index >= 0) {
                data[name] = value;
                this._segment.update("", value, index + 1);
                if (show) {
                    return view.show(null);
                }
            }
            else {
                return os.call(this, name, value, show);
            }
        };
        view.getParam = function (key, mode) {
            var val = data[key];
            if (typeof val !== "undefined") {
                return val;
            }
            return og.call(this, key, mode);
        };
        copyParams(data, view.getUrl(), route);
    }
    function User(app, _view, config) {
        config = config || {};
        var login = config.login || "/login";
        var logout = config.logout || "/logout";
        var afterLogin = config.afterLogin || app.config.start;
        var afterLogout = config.afterLogout || "/login";
        var ping = config.ping || 5 * 60 * 1000;
        var model = config.model;
        var user = config.user;
        var service = {
            getUser: function () {
                return user;
            },
            getStatus: function (server) {
                if (!server) {
                    return user !== null;
                }
                return model.status().catch(function () { return null; }).then(function (data) {
                    user = data;
                });
            },
            login: function (name, pass) {
                return model.login(name, pass).then(function (data) {
                    user = data;
                    if (!data) {
                        throw new Error("Access denied");
                    }
                    app.callEvent("app:user:login", [user]);
                    app.show(afterLogin);
                });
            },
            logout: function () {
                user = null;
                return model.logout().then(function (res) {
                    app.callEvent("app:user:logout", []);
                    return res;
                });
            }
        };
        function canNavigate(url, obj) {
            if (url === logout) {
                service.logout();
                obj.redirect = afterLogout;
            }
            else if (url !== login && !service.getStatus()) {
                obj.redirect = login;
            }
        }
        app.setService("user", service);
        app.attachEvent("app:guard", function (url, _$root, obj) {
            if (config.public && config.public(url)) {
                return true;
            }
            if (typeof user === "undefined") {
                obj.confirm = service.getStatus(true).then(function () { return canNavigate(url, obj); });
            }
            return canNavigate(url, obj);
        });
        if (ping) {
            setInterval(function () { return service.getStatus(true); }, ping);
        }
    }
    var webix$1 = window.webix;
    if (webix$1) {
        patch(webix$1);
    }
    var plugins = {
        UnloadGuard: UnloadGuard, Locale: Locale, Menu: Menu, Theme: Theme, User: User, Status: Status, UrlParam: UrlParam
    };
    var w = window;
    if (!w.Promise) {
        w.Promise = w.webix.promise;
    }

    var index = 1;
    function uid() {
        return index++;
    }
    var empty = undefined;
    var context = null;
    function link(source, target, key) {
        Object.defineProperty(target, key, {
            get: function () { return source[key]; },
            set: function (value) { return (source[key] = value); },
        });
    }
    function createState(data, config) {
        config = config || {};
        var handlers = {};
        var out = {};
        var observe = function (mask, handler) {
            var key = uid();
            handlers[key] = { mask: mask, handler: handler };
            if (mask === "*")
                handler(out, empty, mask);
            else
                handler(out[mask], empty, mask);
            return key;
        };
        var extend = function (data, sconfig) {
            sconfig = sconfig || config;
            for (var key in data) {
                if (data.hasOwnProperty(key)) {
                    var test = data[key];
                    if (sconfig.nested && typeof test === "object" && test) {
                        out[key] = createState(test, sconfig);
                    }
                    else {
                        reactive(out, test, key, notify);
                    }
                }
            }
        };
        var observeEnd = function (id) {
            delete handlers[id];
        };
        var queue = [];
        var waitInQueue = false;
        var batch = function (code) {
            if (typeof code !== "function") {
                var values_1 = code;
                code = function () {
                    for (var key in values_1)
                        out[key] = values_1[key];
                };
            }
            waitInQueue = true;
            code(out);
            waitInQueue = false;
            while (queue.length) {
                var obj = queue.shift();
                notify.apply(this, obj);
            }
        };
        var notify = function (key, old, value, meta) {
            if (waitInQueue) {
                queue.push([key, old, value, meta]);
                return;
            }
            var list = Object.keys(handlers);
            for (var i = 0; i < list.length; i++) {
                var obj = handlers[list[i]];
                if (!obj)
                    continue;
                if (obj.mask === "*" || obj.mask === key) {
                    obj.handler(value, old, key, meta);
                }
            }
        };
        Object.defineProperty(out, "$changes", {
            value: {
                attachEvent: observe,
                detachEvent: observeEnd,
            },
            enumerable: false,
            configurable: false,
        });
        Object.defineProperty(out, "$observe", {
            value: observe,
            enumerable: false,
            configurable: false,
        });
        Object.defineProperty(out, "$batch", {
            value: batch,
            enumerable: false,
            configurable: false,
        });
        Object.defineProperty(out, "$extend", {
            value: extend,
            enumerable: false,
            configurable: false,
        });
        out.$extend(data, config);
        return out;
    }
    function reactive(obj, val, key, notify) {
        Object.defineProperty(obj, key, {
            get: function () {
                return val;
            },
            set: function (value) {
                var changed = false;
                if (val === null || value === null) {
                    changed = val !== value;
                }
                else {
                    changed = val.valueOf() != value.valueOf();
                }
                if (changed) {
                    var old = val;
                    val = value;
                    notify(key, old, value, context);
                }
            },
            enumerable: true,
            configurable: false,
        });
    }

    var ChartView = (function (_super) {
        __extends(ChartView, _super);
        function ChartView() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        ChartView.prototype.config = function () {
            var state = (this.State = this.getParam("state", true));
            var chart = {
                view: "chart",
                $mainView: true,
                borderless: true,
                localId: "data",
                xAxis: {},
                yAxis: {},
            };
            webix.extend(chart, state.chart, true);
            if (!chart.xAxis.template)
                chart.xAxis.template = function (obj) { return obj[obj.length - 1]; };
            var commonAxisSettings = {
                lines: state.chart.lines,
            };
            if (state.chart.scaleColor)
                commonAxisSettings.color = commonAxisSettings.lineColor =
                    state.chart.scaleColor;
            webix.extend(chart.xAxis, commonAxisSettings, true);
            webix.extend(chart.yAxis, commonAxisSettings, true);
            return chart;
        };
        ChartView.prototype.init = function () {
            var _this = this;
            this.Local = this.app.getService("local");
            this.LoadData();
            this.on(this.State.$changes, "structure", function (structure, old) {
                if (old)
                    _this.UpdateStructure();
            });
            this.on(this.State.$changes, "chart", function (val, o) {
                if (o)
                    _this.refresh();
            });
        };
        ChartView.prototype.LoadData = function () {
            var _this = this;
            return this.Local.getData().then(function (data) {
                _this.UpdateChart(data);
            });
        };
        ChartView.prototype.UpdateStructure = function () {
            var data = this.Local.getPivotData();
            this.UpdateChart(data);
        };
        ChartView.prototype.UpdateChart = function (data) {
            this.$$("data").clearAll();
            this.$$("data").removeAllSeries();
            this.SetSeries(data.values);
            this.$$("data").parse(data.data);
        };
        ChartView.prototype.SetSeries = function (values) {
            var _this = this;
            var type = this.State.chart.type;
            var _ = this.app.getService("locale")._;
            var _loop_1 = function (i) {
                this_1.$$("data").addSeries({
                    value: function (obj) { return obj[i]; },
                    alpha: type == "area" || type == "splineArea" ? 0.7 : 1,
                    color: values[i].color,
                    tooltip: function (obj) { return obj[i]; },
                    item: {
                        color: values[i].color,
                        borderColor: values[i].color,
                    },
                    line: {
                        color: values[i].color,
                    },
                });
                if (values[i].text != values[i].operation) {
                    var text = values[i].text.split(",");
                    text = text.map(function (t) { return _this.Local.getField(t).value; }).join(", ");
                    values[i].text = text + " (" + _(values[i].operation) + ")";
                }
                else
                    values[i].text = this_1.Local.fixMath(values[i].operation);
            };
            var this_1 = this;
            for (var i = 0; i < values.length; i++) {
                _loop_1(i);
            }
            this.SetLegend(values);
        };
        ChartView.prototype.SetLegend = function (values) {
            var legend = webix.extend({
                values: values,
                valign: "middle",
                align: "right",
                layout: "y",
            }, this.State.chart.legend || {}, true);
            this.$$("data").define({ legend: legend });
        };
        return ChartView;
    }(JetView));

    webix.protoUI({
        name: "pivot-portlet",
        $reorderOnly: true,
        $drag: function (object) {
            webix.html.addCss(this.$view, "portlet_in_drag");
            var ctx = webix.DragControl.getContext();
            ctx.source = ctx.from = object;
            webix.callEvent("onClick", []);
            var local = this.$scope.app.getService("local");
            var values = this.getChildViews()[0].getValues();
            var text = values.name ? local.getField(values.name).value : "";
            if (values.name2)
                text += (text ? ", " : "") + local.getField(values.name2).value;
            if (webix.isUndefined(values.name) && values.operation) {
                text = local.fixMath(values.operation);
            }
            else if (!text) {
                var _ = this.$scope.app.getService("locale")._;
                text = _("Field not defined");
            }
            else if (values.operation)
                text += " (" + values.operation + ")";
            var askin = webix.skin.$active;
            var style = "width:" + (this.$width - askin.inputHeight) + "px;height:" + this.$height + "px;";
            return "<div class=\"webix_pivot_portlet_drag\" style=\"" + style + "\">\n\t\t\t\t<span class=\"webix_icon " + this.config.icon + "\"></span>" + text + "\n\t\t\t</div>";
        },
    }, webix.ui.portlet);

    var Property = (function (_super) {
        __extends(Property, _super);
        function Property(app, name, config) {
            var _this = _super.call(this, app, name) || this;
            if (!config)
                config = {};
            _this.plusLabel = config.plusLabel;
            _this.field = config.field;
            return _this;
        }
        Property.prototype.config = function () {
            var _this = this;
            var askin = webix.skin.$active;
            return {
                borderless: true,
                type: "clean",
                paddingY: 8,
                rows: [
                    {
                        localId: "forms",
                        type: "clean",
                        rows: [],
                    },
                    {
                        template: "<div class=\"webix_pivot_handle_add_value\">\n\t\t\t\t\t\t<span class=\"webix_icon wxi-plus-circle\"></span><span>" + this.plusLabel + "</span>\n\t\t\t\t\t</div>",
                        css: "webix_pivot_add_value",
                        height: askin.inputHeight - 2 * askin.inputPadding,
                        localId: "addValue",
                        onClick: {
                            webix_pivot_handle_add_value: function () {
                                var forms = _this.$$("forms").getChildViews();
                                var added = _this.Add(null, forms.length);
                                var input = webix.$$(added).queryView({ name: "name" });
                                if (input) {
                                    input.focus();
                                    webix.html.triggerEvent(input.getInputNode(), "MouseEvents", "click");
                                }
                                if (_this.field != "values" &&
                                    forms.length == _this.app.getState().fields.length)
                                    _this.$$("addValue").hide();
                            },
                        },
                    },
                ],
            };
        };
        Property.prototype.init = function () {
            var _this = this;
            this.on(webix, "onAfterPortletMove", function (source) {
                if (source == _this.$$("forms"))
                    _this.app.callEvent("property:change", [_this.field, _this.GetValue()]);
            });
            this.on(webix, "onPortletDrag", function (active, target) {
                if (active.$reorderOnly)
                    return active.getParentView() === target.getParentView();
            });
        };
        Property.prototype.ListTemplate = function (obj) {
            var input = this._activeInput;
            var wavg = this.field == "values" &&
                input &&
                !input.$destructed &&
                input.getFormView().elements.operation.getValue() == "wavg";
            var corrections = this.getParentView().GetCorrections()[this.field];
            var value = obj.value;
            if (!wavg && corrections) {
                var includes = this.CheckCorrections(corrections, obj.id);
                var css = "webix_pivot_list_marker";
                if (includes)
                    css += " webix_pivot_list_marker_fill";
                return "<div class=\"" + css + "\"> " + value + "</div>";
            }
            else
                return value;
        };
        Property.prototype.CheckCorrections = function (corrections, id) {
            if (this._activeInput && id == this._activeInput.getValue())
                return true;
            var structure = this.app.getStructure();
            for (var i = 0; i < corrections.length; i++) {
                var name_1 = corrections[i];
                var val = structure[name_1];
                if (val) {
                    if (typeof val == "string") {
                        if (val == id)
                            return true;
                    }
                    else {
                        for (var j = 0; j < val.length; j++) {
                            var value = val[j];
                            if (value.name)
                                value = value.name;
                            if (value == id)
                                return true;
                        }
                    }
                }
            }
            return false;
        };
        Property.prototype.GetValue = function () {
            var forms = this.$$("forms").getChildViews();
            var arr = [];
            forms.forEach(function (form) {
                var val = form.getChildViews()[0].getValues().name;
                if (val)
                    arr.push(val);
            });
            return arr;
        };
        Property.prototype.SetValue = function (val) {
            var layout = this.$$("forms");
            var forms = layout.getChildViews();
            for (var i = forms.length - 1; i >= 0; i--)
                layout.removeView(forms[i]);
            for (var i = 0; i < val.length; i++) {
                if (!val[i].external)
                    this.Add(val[i], i);
            }
        };
        Property.prototype.Add = function (val, i) {
            var _this = this;
            return this.$$("forms").addView({
                view: "pivot-portlet",
                mode: "replace",
                borderless: true,
                body: {
                    view: "form",
                    paddingY: 0,
                    paddingX: 2,
                    elements: [
                        {
                            margin: 2,
                            cols: this.ItemConfig(val, i),
                        },
                    ],
                    on: {
                        onChange: function () {
                            _this.app.callEvent("property:change", [
                                _this.field,
                                _this.GetValue(),
                            ]);
                        },
                    },
                },
            });
        };
        Property.prototype.ItemConfig = function (val) {
            var _this = this;
            return [
                { width: webix.skin.$active.inputHeight },
                {
                    view: "richselect",
                    name: "name",
                    value: this.PrepareValue(val),
                    options: {
                        css: "webix_pivot_suggest",
                        data: this.app.getState().fields,
                        on: {
                            onBeforeShow: function () {
                                var input = webix.$$(this.config.master);
                                var master = input.$scope;
                                var data = master.GetValue();
                                master._activeInput = input;
                                this.getList().filter(function (val) {
                                    return master.FilterSuggest(data, input.getValue(), val);
                                });
                            },
                        },
                        body: {
                            template: function (obj) { return _this.ListTemplate(obj); },
                        },
                    },
                },
                {
                    view: "icon",
                    icon: "wxi-close",
                    css: "webix_pivot_close_icon",
                    click: function () {
                        var master = this.$scope;
                        master.$$("addValue").show();
                        master
                            .$$("forms")
                            .removeView(this.queryView("pivot-portlet", "parent"));
                        master.app.callEvent("property:change", [
                            master.field,
                            master.GetValue(),
                        ]);
                    },
                },
            ];
        };
        Property.prototype.PrepareValue = function (val) {
            if (val) {
                if (typeof val == "object")
                    val = val.name;
                if (webix.isArray(val))
                    val = val[0];
            }
            else
                val = "";
            return val;
        };
        Property.prototype.FilterSuggest = function (data, activeVal, val) {
            val = val.id;
            if (val == activeVal)
                return true;
            return !data.find(function (item) {
                if (item.name)
                    item = item.name;
                return val == item;
            });
        };
        return Property;
    }(JetView));

    var ValuesProperty = (function (_super) {
        __extends(ValuesProperty, _super);
        function ValuesProperty(app, name, config) {
            var _this = _super.call(this, app, name, config) || this;
            _this.Local = _this.app.getService("local");
            var _ = _this.app.getService("locale")._;
            _this.typeName = "operation";
            _this.plusLabel = _("Add value");
            _this.field = "values";
            _this.operations = _this.Local.operations;
            _this.operations.map(function (operation) {
                operation.value = _(operation.id);
                return operation;
            });
            return _this;
        }
        ValuesProperty.prototype.init = function () {
            var _this = this;
            _super.prototype.init.call(this);
            this.State = this.app.getState();
            this.on(this.State.$changes, "mode", function (mode) {
                _this.ToggleColors(mode == "chart");
            });
        };
        ValuesProperty.prototype.GetValue = function () {
            var forms = this.$$("forms").getChildViews();
            var arr = [];
            forms.forEach(function (form) {
                var values = form.getChildViews()[0].getValues({ hidden: false });
                if (!webix.isUndefined(values.name2)) {
                    if (values.name && values.name2) {
                        values.name = [values.name, values.name2];
                        delete values.name2;
                    }
                    else
                        values.name = "";
                }
                if (values.name == "")
                    return;
                arr.push(values);
            });
            return arr;
        };
        ValuesProperty.prototype.ItemConfig = function (val, i) {
            var config = _super.prototype.ItemConfig.call(this, val);
            if (val && !val.name) {
                config.splice(1, 1, {
                    view: "label",
                    css: "webix_pivot_complex_operation",
                    name: "operation",
                    label: this.Local.fixMath(val.operation),
                    value: val.operation,
                });
            }
            else {
                var operation = void 0;
                if (val)
                    operation = val.operation;
                else {
                    var def_1 = this.app.config.defaultOperation;
                    var defIndex = Math.max(this.operations.findIndex(function (a) { return a.id == def_1; }), 0);
                    operation = this.operations[defIndex].id;
                }
                config.splice(2, 0, {
                    view: "richselect",
                    name: "operation",
                    width: 100,
                    value: operation,
                    options: {
                        css: "webix_pivot_suggest",
                        data: this.operations,
                    },
                    on: {
                        onChange: function (v) {
                            this.$scope.SetOperation(v, this);
                        },
                    },
                });
                config.splice(2, 0, {
                    view: "richselect",
                    hidden: !val || val.operation != "wavg",
                    value: val && webix.isArray(val.name) ? val.name[1] : "",
                    name: "name2",
                    options: {
                        css: "webix_pivot_suggest",
                        data: this.app.getState().fields,
                    },
                });
            }
            var mini = webix.skin.$name == "mini" || webix.skin.$name == "compact";
            var palette = this.Local.getPalette();
            var color = (val && val.color) || this.Local.getValueColor(i);
            config.splice(1, 0, {
                view: "colorpicker",
                hidden: this.State.mode != "chart",
                name: "color",
                css: "webix_pivot_value_color",
                value: color,
                width: mini ? 30 : 38,
                suggest: {
                    type: "colorboard",
                    body: {
                        width: 150,
                        height: 150,
                        view: "colorboard",
                        palette: palette,
                    },
                },
            });
            return config;
        };
        ValuesProperty.prototype.ToggleColors = function (show) {
            var layout = this.$$("forms");
            var forms = layout.getChildViews();
            for (var i = 0; i < forms.length; i++) {
                var input = forms[i].getChildViews()[0].elements.color;
                if (show)
                    input.show();
                else
                    input.hide();
            }
        };
        ValuesProperty.prototype.FilterSuggest = function () {
            return true;
        };
        ValuesProperty.prototype.SetOperation = function (val, view) {
            var form = view.getFormView();
            if (val == "wavg")
                form.elements.name2.show();
            else
                form.elements.name2.hide();
        };
        return ValuesProperty;
    }(Property));

    var GroupProperty = (function (_super) {
        __extends(GroupProperty, _super);
        function GroupProperty(app, name) {
            var _this = _super.call(this, app, name) || this;
            _this.field = "groupBy";
            return _this;
        }
        GroupProperty.prototype.config = function () {
            var _this = this;
            return {
                padding: 10,
                rows: [
                    {
                        view: "richselect",
                        localId: "group",
                        options: {
                            css: "webix_pivot_suggest",
                            data: this.app.getState().fields,
                            body: {
                                template: function (obj) { return _this.ListTemplate(obj); },
                            },
                            on: {
                                onBeforeShow: function () {
                                    _this._activeInput = _this.$$("group");
                                },
                            },
                        },
                        on: {
                            onChange: function (value, oldValue, source) {
                                if (source == "user")
                                    _this.app.callEvent("property:change", [_this.field, value]);
                            },
                        },
                    },
                ],
            };
        };
        GroupProperty.prototype.GetValue = function () {
            return this.$$("group").getValue();
        };
        GroupProperty.prototype.SetValue = function (val) {
            this.$$("group").setValue(val);
        };
        return GroupProperty;
    }(Property));

    var ChartSettings = (function (_super) {
        __extends(ChartSettings, _super);
        function ChartSettings() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        ChartSettings.prototype.config = function () {
            var _this = this;
            var _ = this.app.getService("locale")._;
            return {
                view: "form",
                complexData: true,
                padding: 10,
                elements: [
                    {
                        name: "type",
                        view: "richselect",
                        value: "bar",
                        options: {
                            css: "webix_pivot_suggest",
                            data: [
                                { id: "bar", value: _("Bar") },
                                { id: "line", value: _("Line") },
                                { id: "radar", value: _("Radar") },
                                { id: "area", value: _("Area") },
                                { id: "spline", value: _("Spline") },
                                { id: "splineArea", value: _("Spline Area") },
                            ],
                        },
                    },
                    {
                        name: "xAxis.title",
                        view: "text",
                        label: _("X axis title"),
                        batch: "axis",
                    },
                    {
                        name: "yAxis.title",
                        view: "text",
                        label: _("Y axis title"),
                        batch: "axis",
                    },
                    {
                        name: "scaleColor",
                        view: "colorpicker",
                        editable: true,
                        label: _("Scale color"),
                        suggest: {
                            type: "colorboard",
                            body: {
                                width: 150,
                                height: 150,
                                view: "colorboard",
                                palette: this.app.getService("local").getPalette(),
                            },
                        },
                    },
                    {
                        name: "scale",
                        view: "checkbox",
                        checkValue: "logarithmic",
                        uncheckValue: "linear",
                        labelWidth: 0,
                        labelRight: _("Logarithmic scale"),
                    },
                    {
                        name: "yAxis.lineShape",
                        view: "checkbox",
                        batch: "radar",
                        checkValue: "arc",
                        labelWidth: 0,
                        labelRight: _("Circled lines"),
                    },
                    {
                        name: "lines",
                        view: "checkbox",
                        labelWidth: 0,
                        labelRight: _("Lines"),
                    },
                ],
                on: {
                    onChange: function (value, oldValue, source) {
                        if (source == "user") {
                            _this.innerChange = true;
                            _this.State.chart = Object.assign({}, _this.getRoot().getValues());
                            _this.handleVisibility();
                            delete _this.innerChange;
                        }
                    },
                },
            };
        };
        ChartSettings.prototype.init = function () {
            var _this = this;
            this.State = this.getParam("state", true);
            this.on(this.State.$changes, "chart", function (chart) {
                if (!_this.innerChange) {
                    _this.getRoot().setValues(chart);
                    _this.handleVisibility();
                }
            });
        };
        ChartSettings.prototype.handleVisibility = function () {
            var form = this.getRoot();
            if (this.State.chart.type == "radar")
                form.showBatch("radar");
            else
                form.showBatch("axis");
        };
        return ChartSettings;
    }(JetView));

    var TableSettings = (function (_super) {
        __extends(TableSettings, _super);
        function TableSettings() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        TableSettings.prototype.config = function () {
            var _this = this;
            var _ = this.app.getService("locale")._;
            return {
                view: "form",
                padding: 10,
                elements: [
                    {
                        name: "cleanRows",
                        localId: "cleanRows",
                        view: "checkbox",
                        labelWidth: 0,
                        labelRight: _("Clean rows"),
                    },
                    {
                        view: "label",
                        height: 20,
                        label: _("Highlight"),
                    },
                    {
                        cols: [
                            {
                                name: "minX",
                                view: "checkbox",
                                labelWidth: 0,
                                labelRight: _("Min X"),
                            },
                            {
                                name: "maxX",
                                view: "checkbox",
                                labelWidth: 0,
                                labelRight: _("Max X"),
                            },
                            {
                                name: "minY",
                                view: "checkbox",
                                labelWidth: 0,
                                labelRight: _("Min Y"),
                            },
                            {
                                name: "maxY",
                                view: "checkbox",
                                labelWidth: 0,
                                labelRight: _("Max Y"),
                            },
                        ],
                    },
                    {
                        view: "label",
                        height: 20,
                        label: _("Footer"),
                    },
                    {
                        view: "radio",
                        name: "footer",
                        options: [
                            { id: 1, value: _("Off") },
                            { id: 2, value: _("On") },
                            { id: 3, value: _("Sum Only") },
                        ],
                        value: 1,
                    },
                ],
                on: {
                    onChange: function (value, oldValue, source) {
                        if (source == "user") {
                            var out = _this.OutValues(_this.getRoot().getValues());
                            _this.innerChange = true;
                            _this.State.datatable = Object.assign({}, out);
                            delete _this.innerChange;
                        }
                    },
                },
            };
        };
        TableSettings.prototype.init = function () {
            var _this = this;
            this.State = this.getParam("state", true);
            this.on(this.State.$changes, "datatable", function (datatable) {
                if (!_this.innerChange)
                    _this.getRoot().setValues(_this.InValues(datatable));
            });
            this.on(this.State.$changes, "mode", function (mode) {
                if (mode == "table")
                    _this.$$("cleanRows").show();
                else
                    _this.$$("cleanRows").hide();
            });
        };
        TableSettings.prototype.InValues = function (values) {
            values = webix.copy(values);
            if (values.footer)
                values.footer = values.footer == "sumOnly" ? 3 : 2;
            else
                values.footer = 1;
            return values;
        };
        TableSettings.prototype.OutValues = function (values) {
            switch (values.footer) {
                case "1":
                    delete values.footer;
                    break;
                case "2":
                    values.footer = true;
                    break;
                case "3":
                    values.footer = "sumOnly";
                    break;
            }
            return values;
        };
        return TableSettings;
    }(JetView));

    var ConfigView = (function (_super) {
        __extends(ConfigView, _super);
        function ConfigView() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        ConfigView.prototype.config = function () {
            var _this = this;
            var _ = this.app.getService("locale")._;
            this.Config = this.app.config;
            this.State = this.app.getState();
            this.Compact = this.getParam("compact", true);
            var toolbar = {
                type: "form",
                borderless: true,
                padding: {
                    left: 16,
                    right: 14,
                    top: 8,
                    bottom: 4,
                },
                cols: [
                    {},
                    {
                        view: "button",
                        label: _("Done"),
                        hotkey: "esc",
                        autowidth: true,
                        css: "webix_primary",
                        click: function () { return _this.ToggleForm(); },
                    },
                ],
            };
            var structure = {
                borderless: true,
                view: "scrollview",
                scroll: "y",
                body: {
                    view: "accordion",
                    css: "webix_pivot_configuration",
                    localId: "settings",
                    multi: true,
                    type: "space",
                    padding: {
                        left: 16,
                        right: 16,
                        top: 4,
                        bottom: 16,
                    },
                    margin: 20,
                    rows: [
                        this.GroupConfig(_("Rows"), "pt-rows", {
                            name: "rows",
                            $subview: new Property(this.app, "", {
                                field: "rows",
                                plusLabel: _("Add row"),
                            }),
                        }, "table"),
                        this.GroupConfig(_("Columns"), "pt-columns", {
                            name: "columns",
                            $subview: new Property(this.app, "", {
                                field: "columns",
                                plusLabel: _("Add column"),
                            }),
                        }, "table"),
                        this.GroupConfig(_("Values"), "pt-values", {
                            name: "values",
                            $subview: ValuesProperty,
                        }),
                        this.GroupConfig(_("Group By"), "pt-group", {
                            name: "groupBy",
                            $subview: GroupProperty,
                        }, "chart"),
                        this.GroupConfig(_("Filters"), "pt-filter", {
                            name: "filters",
                            $subview: new Property(this.app, "", {
                                field: "filters",
                                plusLabel: _("Add filter"),
                            }),
                        }),
                        this.GroupConfig(_("Chart"), "pt-chart", {
                            $subview: ChartSettings,
                        }, "chart"),
                        this.GroupConfig(_("Table"), "wxi-columns", {
                            $subview: TableSettings,
                        }, "table"),
                        {},
                    ],
                },
            };
            return {
                margin: 0,
                rows: [toolbar, structure],
            };
        };
        ConfigView.prototype.init = function () {
            var _this = this;
            this.on(this.State.$changes, "readonly", function (_v, o) {
                if (!webix.isUndefined(o))
                    _this.ToggleForm();
            });
        };
        ConfigView.prototype.ready = function () {
            var _this = this;
            this.on(this.app, "property:change", function (field, value) {
                _this.HandleFieldChange(field, value);
            });
            this.on(this.State.$changes, "structure", function () {
                if (!_this.innerChange)
                    _this.SetValues();
            });
            this.on(this.State.$changes, "mode", function (mode, oldMode) {
                var isChart = mode == "chart";
                _this.$$("settings").showBatch(isChart ? "chart" : "table");
                if (oldMode && (isChart || oldMode == "chart"))
                    _this.SetValues();
            });
        };
        ConfigView.prototype.ToggleForm = function () {
            this.State.config = !this.State.config;
        };
        ConfigView.prototype.SetValues = function () {
            var _this = this;
            var structure = this.State.structure;
            var inputs = ["rows", "columns", "values", "filters", "groupBy"];
            inputs.forEach(function (input) {
                var value = structure[input] || _this.State[input];
                if (value) {
                    var view = _this.getSubView(input);
                    view.SetValue(value);
                }
            });
        };
        ConfigView.prototype.HandleFieldChange = function (field, value) {
            var structure = webix.copy(this.State.structure);
            if (field == "filters")
                value = this.CorrectFilters(structure, value);
            else
                this.CorrectInputs(structure, field, value);
            structure[field] = value;
            this.innerChange = true;
            this.app.setStructure(structure);
            delete this.innerChange;
        };
        ConfigView.prototype.GroupConfig = function (name, icon, config, batch) {
            return {
                batch: batch,
                header: "\n\t\t\t\t<span class=\"webix_icon webix_pivot_config_icon " + icon + "\"></span>\n\t\t\t\t<span class=\"webix_pivot_config_label\">" + name + "</span>\n\t\t\t",
                body: config,
                borderless: true,
            };
        };
        ConfigView.prototype.GetCorrections = function () {
            return {
                rows: ["columns", "values", "groupBy"],
                columns: ["rows", "values"],
                values: ["rows", "columns", "groupBy"],
                groupBy: ["rows", "values"],
            };
        };
        ConfigView.prototype.CorrectFilters = function (structure, value) {
            var _loop_1 = function (i) {
                var active = structure.filters.find(function (filter) {
                    if (filter.name == value[i])
                        return true;
                });
                value[i] = { name: value[i] };
                if (active && !active.external)
                    value[i].value = active.value;
            };
            for (var i = 0; i < value.length; i++) {
                _loop_1(i);
            }
            var external = structure.filters.filter(function (filter) { return filter.external; });
            value = value.concat(external);
            return value;
        };
        ConfigView.prototype.CorrectInputs = function (structure, field, value) {
            var _this = this;
            var inputs = this.GetCorrections()[field];
            if (inputs) {
                if (typeof value == "string")
                    value = [value];
                value = value.map(function (v) { return (v.name ? v.name : v); });
                inputs.forEach(function (input) {
                    var view = _this.getSubView(input);
                    var values = view.GetValue();
                    if (typeof values == "string") {
                        if (value.find(function (v) { return v == values; }))
                            values = "";
                    }
                    else
                        values = values.filter(function (v) {
                            if (v.name)
                                v = v.name;
                            return value.indexOf(v) == -1;
                        });
                    structure[input] = values;
                    view.SetValue(values);
                });
            }
        };
        return ConfigView;
    }(JetView));

    var Popup = (function (_super) {
        __extends(Popup, _super);
        function Popup() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Popup.prototype.config = function () {
            return {
                view: "window",
                fullscreen: true,
                head: false,
                body: { $subview: true },
            };
        };
        return Popup;
    }(JetView));

    var FilterView = (function (_super) {
        __extends(FilterView, _super);
        function FilterView() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        FilterView.prototype.config = function () {
            var _this = this;
            this.Local = this.app.getService("local");
            return {
                view: "popup",
                css: "webix_pivot_filter_popup",
                body: {
                    view: "filter",
                    field: "value",
                    on: {
                        onChange: function (config) {
                            if (config == "user") {
                                var state = _this.app.getState();
                                var structure = webix.copy(state.structure);
                                var value_1;
                                structure.filters = structure.filters.filter(function (filter) {
                                    var exists = filter.name == _this.field;
                                    var inner = exists && !filter.external;
                                    if (inner)
                                        value_1 = filter.value = _this.filter.getValue();
                                    return !exists || inner;
                                });
                                state.structure = structure;
                                _this.app.callEvent("filter:change", [_this.field, value_1]);
                            }
                        },
                    },
                },
            };
        };
        FilterView.prototype.Show = function (pos, filterObj) {
            var _this = this;
            var popup = this.getRoot();
            var filter = (this.filter = popup.getBody());
            this.field = filterObj.name;
            var list = filter.getChildViews()[2];
            var field = this.Local.getField(this.field);
            var values = webix.copy(this.Local.collectFieldValues(this.field));
            list.clearAll();
            list.parse(values);
            list.define({
                template: function (item) {
                    var value = item.value;
                    if (field.type == "date")
                        value = new Date(value);
                    return field.predicate
                        ? _this.app.config.predicates[field.predicate](value)
                        : value;
                },
            });
            filter.define({ mode: field.type });
            filter.config.value = "";
            filter.setValue(webix.copy(filterObj.value || {}));
            popup.show(pos);
        };
        return FilterView;
    }(JetView));

    var ModeView = (function (_super) {
        __extends(ModeView, _super);
        function ModeView() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        ModeView.prototype.config = function () {
            var _this = this;
            var _ = this.app.getService("locale")._;
            this.Compact = this.getParam("compact");
            var askin = webix.skin.$active;
            var mini = webix.skin.$name == "mini" || webix.skin.$name == "compact";
            var config = {
                height: askin.toolbarHeight,
                cols: [
                    {
                        view: "segmented",
                        localId: "modes",
                        align: "middle",
                        inputHeight: askin.inputHeight - askin.inputPadding * (mini ? 0 : 2),
                        optionWidth: 80,
                        width: 244,
                        options: [
                            { id: "table", value: _("Table") },
                            { id: "tree", value: _("Tree") },
                            { id: "chart", value: _("Chart") },
                        ],
                        on: {
                            onChange: function (v, o, c) {
                                if (c == "user")
                                    _this.SetMode(v);
                            },
                        },
                    },
                    { width: askin.dataPadding },
                ],
            };
            if (this.Compact) {
                config.css = "webix_pivot_footer";
                config.cols[1].width = 0;
                config.cols.unshift({});
            }
            return config;
        };
        ModeView.prototype.init = function () {
            var _this = this;
            this.State = this.getParam("state");
            this.on(this.State.$changes, "mode", function (mode) {
                _this.$$("modes").setValue(mode);
            });
        };
        ModeView.prototype.SetMode = function (value) {
            this.State.mode = value;
        };
        return ModeView;
    }(JetView));

    var ToolbarView = (function (_super) {
        __extends(ToolbarView, _super);
        function ToolbarView() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        ToolbarView.prototype.config = function () {
            var _this = this;
            var _ = this.app.getService("locale")._;
            this.Compact = this.getParam("compact");
            this.State = this.getParam("state");
            var config;
            if (this.Compact) {
                config = {
                    view: "icon",
                    icon: "pt-settings",
                    inputHeight: webix.skin.$active.buttonHeight,
                    on: {
                        onItemClick: function () { return _this.ToggleConfig(); },
                    },
                };
            }
            else {
                var label_1 = _("Configure Pivot");
                var css = "webix_template webix_pivot_measure_size";
                var width = 20 + 8 + webix.html.getTextSize(label_1, css).width;
                config = {
                    view: "template",
                    borderless: true,
                    width: width,
                    template: function () {
                        return "\n\t\t\t\t\t\t<span>" + label_1 + "</span>\n\t\t\t\t\t\t<span class=\"pt-settings webix_pivot_toolbar_icon\"></span>";
                    },
                    onClick: {
                        webix_pivot_settings: function () { return _this.ToggleConfig(); },
                    },
                };
            }
            config.localId = "config";
            config.css = "webix_pivot_settings";
            config.tooltip = _("Click to configure");
            var result = {
                css: "webix_pivot_toolbar",
                margin: this.Compact ? 12 : 0,
                padding: {
                    left: this.Compact ? webix.skin.$active.inputPadding : 0,
                },
                height: webix.skin.$active.toolbarHeight,
                cols: [config, this.GetFilters()],
            };
            if (!this.Compact)
                result.cols.push(ModeView);
            return result;
        };
        ToolbarView.prototype.init = function () {
            var _this = this;
            this.filterPopup = this.ui(FilterView);
            this.on(this.State.$changes, "fields", function (fields) {
                if (fields.length)
                    webix.ui(_this.GetFilters(), _this.$$("filters"));
            });
            this.on(this.State.$changes, "structure", function (structure, old) {
                if (old && _this.FiltersChanged(structure, old))
                    webix.ui(_this.GetFilters(), _this.$$("filters"));
            });
            this.on(this.State.$changes, "readonly", function (val) {
                _this.ToggleReadonly(val);
            });
        };
        ToolbarView.prototype.FiltersChanged = function (structure, oldStructure) {
            if (structure.filters.length == oldStructure.filters.length) {
                for (var i = 0; i < structure.filters.length; i++) {
                    var filter = structure.filters[i];
                    var old = oldStructure.filters[i];
                    if (filter.name != old.name || filter.external != old.external)
                        return true;
                    if (JSON.stringify(filter.value) != JSON.stringify(old.value))
                        return true;
                }
            }
            else
                return true;
            return false;
        };
        ToolbarView.prototype.ToggleConfig = function () {
            this.State.config = !this.State.config;
        };
        ToolbarView.prototype.ToggleReadonly = function (val) {
            if (val)
                this.$$("config").hide();
            else
                this.$$("config").show();
        };
        ToolbarView.prototype.GetFilters = function () {
            var _this = this;
            var structure = this.State.structure;
            var filters = [];
            if (this.State.fields.length)
                structure.filters.forEach(function (filter) {
                    if (!filter.external)
                        filters.push(_this.FilterConfig(filter));
                });
            var askin = webix.skin.$active;
            var padding = (askin.toolbarHeight - askin.buttonHeight) / 2;
            return {
                view: "scrollview",
                borderless: true,
                scroll: "x",
                body: {
                    margin: 8,
                    padding: {
                        left: this.Compact ? 0 : 8,
                        top: padding + askin.inputPadding,
                        bottom: padding + askin.inputPadding,
                    },
                    localId: "filters",
                    cols: filters,
                },
            };
        };
        ToolbarView.prototype.FilterConfig = function (filter) {
            var _this = this;
            var label = this.app.getService("local").getField(filter.name).value;
            var css = "webix_template webix_pivot_measure_size";
            var width = (this.Compact ? 0 : 20 + 8) + webix.html.getTextSize(label, css).width;
            return {
                view: "template",
                borderless: true,
                width: width,
                css: "webix_pivot_filter",
                template: function () {
                    var value = filter.value;
                    var activeCss = value && (value.includes || value.condition.filter)
                        ? "webix_pivot_active_filter"
                        : "";
                    var icon = !_this.Compact
                        ? "<span class='pt-filter webix_pivot_toolbar_icon'></span>"
                        : "";
                    return "<div class=\"webix_pivot_filter_inner " + activeCss + "\">\n\t\t\t\t\t<span>" + label + "</span>\n\t\t\t\t\t" + icon + "\n\t\t\t\t</div>";
                },
                onClick: {
                    webix_pivot_filter: function () {
                        this.$scope.filterPopup.Show(this.$view, filter);
                    },
                },
            };
        };
        return ToolbarView;
    }(JetView));

    webix.protoUI({
        name: "r-layout",
        sizeTrigger: function (width, handler, value) {
            this._compactValue = value;
            this._compactWidth = width;
            this._compactHandler = handler;
            this._checkTrigger(this.$view.width, value);
        },
        _checkTrigger: function (x, value) {
            if (this._compactWidth) {
                if ((x <= this._compactWidth && !value) ||
                    (x > this._compactWidth && value)) {
                    this._compactWidth = null;
                    this._compactHandler(!value);
                    return false;
                }
            }
            return true;
        },
        $setSize: function (x, y) {
            if (this._checkTrigger(x, this._compactValue))
                return webix.ui.layout.prototype.$setSize.call(this, x, y);
        },
    }, webix.ui.layout);

    var MainView = (function (_super) {
        __extends(MainView, _super);
        function MainView() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        MainView.prototype.config = function () {
            var fCompact = this.getParam("forceCompact");
            if (!webix.isUndefined(fCompact))
                this.setParam("compact", fCompact);
            this.Compact = this.getParam("compact");
            var rows = [
                ToolbarView,
                {
                    view: webix.isUndefined(fCompact) ? "r-layout" : "layout",
                    localId: "main",
                    cols: [{ $subview: true }],
                },
            ];
            if (this.Compact) {
                rows.push(ModeView, {
                    $subview: true,
                    name: "edit",
                    popup: true,
                });
            }
            else {
                rows[1].cols.push({
                    view: "proxy",
                    width: 420,
                    localId: "edit",
                    css: "webix_pivot_config_container webix_shadow_medium",
                    borderless: true,
                    hidden: true,
                    body: { $subview: true, name: "edit" },
                });
            }
            return { margin: 0, rows: rows };
        };
        MainView.prototype.init = function () {
            var _this = this;
            var state = this.getParam("state");
            var main = this.$$("main");
            if (main.sizeTrigger)
                main.sizeTrigger(this.app.config.compactWidth, function (mode) { return _this.SetCompactMode(mode); }, !!this.Compact);
            this.on(state.$changes, "mode", function (mode) {
                _this.show("./" + (mode == "chart" ? "chart" : "table"));
            });
            this.on(state.$changes, "config", function (val) {
                if (val)
                    _this.ShowConfig();
                else
                    _this.HideConfig();
            });
        };
        MainView.prototype.ShowConfig = function () {
            if (this.Compact) {
                this.show("config.popup/config", {
                    target: "edit",
                });
            }
            else {
                this.$$("edit").show();
                this.show("config", {
                    target: "edit",
                });
            }
        };
        MainView.prototype.HideConfig = function () {
            this.show("_blank", { target: "edit" });
            if (!this.Compact)
                this.$$("edit").hide();
        };
        MainView.prototype.SetCompactMode = function (mode) {
            var _this = this;
            webix.delay(function () {
                _this.setParam("compact", mode);
                if (!mode)
                    webix.fullscreen.exit();
                _this.refresh();
            });
        };
        return MainView;
    }(JetView));

    var TableView = (function (_super) {
        __extends(TableView, _super);
        function TableView() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        TableView.prototype.config = function () {
            this.Config = this.app.config;
            this.Local = this.app.getService("local");
            var state = (this.State = this.getParam("state", true));
            var table = {
                view: "treetable",
                $mainView: true,
                localId: "data",
                css: "webix_data_border webix_header_border",
                select: true,
                leftSplit: state.mode == "table" ? state.structure.rows.length : 1,
                resizeColumn: true,
                borderless: true,
                columns: [],
                footer: state.datatable.footer,
            };
            webix.extend(table, state.datatable, true);
            return table;
        };
        TableView.prototype.init = function () {
            var _this = this;
            this.LoadData();
            this.on(this.State.$changes, "structure", function (structure, old) {
                if (old)
                    _this.UpdateStructure();
            });
            this.on(this.State.$changes, "datatable", function (val, o) {
                if (o)
                    _this.refresh();
            });
            this.on(this.State.$changes, "mode", function (val, o) {
                if (o && o != "chart")
                    _this.refresh();
            });
        };
        TableView.prototype.LoadData = function () {
            var _this = this;
            return this.Local.getData().then(function (data) {
                _this.UpdateTable(data);
            });
        };
        TableView.prototype.UpdateStructure = function () {
            var data = this.Local.getPivotData();
            this.UpdateTable(data);
        };
        TableView.prototype.UpdateTable = function (data) {
            var table = this.$$("data");
            table.clearAll();
            if (this.State.mode == "table")
                table.config.leftSplit = this.State.structure.rows.length;
            table.refreshColumns(this.SetColumns(data.header, data.total, data.marks));
            table.parse(data.data);
        };
        TableView.prototype.SetColumns = function (columns, totals, marks) {
            var _ = this.app.getService("locale")._;
            var left = this.State.mode == "table" ? this.State.structure.rows.length : 1;
            for (var i = 0; i < columns.length; i++) {
                if (!i) {
                    this.SetFirstColumn(columns[i], _);
                }
                else {
                    if (i >= left)
                        columns[i].sort = "int";
                    else if (this.State.mode == "table")
                        columns[i].width = 200;
                    if (!columns[i].format && i >= left)
                        columns[i].format = this.CellFormat;
                    if (marks)
                        columns[i].cssFormat = function (v, row, rid, cid) {
                            var col = marks[rid - 1];
                            var css = col ? col[cid - 1] : null;
                            return css ? css.join(" ") : "";
                        };
                    var header = columns[i].header;
                    for (var j = 0; j < header.length; j++) {
                        var h = header[j];
                        if (h) {
                            if (!j && h.name == "total") {
                                h.text = _("Total");
                            }
                            else if (j == header.length - 1) {
                                h.text = this.HeaderTemplate(h, _);
                            }
                        }
                    }
                    if (totals.length) {
                        columns[i].footer = this.CellFormat(totals[i]);
                    }
                }
            }
            return columns;
        };
        TableView.prototype.SetFirstColumn = function (column, _) {
            if (this.State.mode == "tree") {
                column.header = "";
                column.width = 300;
                column.template = function (obj, common) {
                    return common.treetable(obj, common) + obj[1];
                };
            }
            else {
                column.header = column.header[0].text;
                column.width = 200;
            }
            if (this.State.datatable.footer)
                column.footer = _("Total");
        };
        TableView.prototype.HeaderTemplate = function (line, _) {
            var _this = this;
            if (line.operation && line.text != line.operation) {
                var text = line.text.split(",");
                text = text.map(function (t) { return _this.Local.getField(t).value; }).join(", ");
                return text + " <span class=\"webix_pivot_operation\">" + _(line.operation) + "</span>";
            }
            else
                return this.Local.fixMath(line.text);
        };
        TableView.prototype.CellFormat = function (value) {
            if (!value)
                value = value === 0 ? "0" : "";
            return value ? parseFloat(value).toFixed(3) : value;
        };
        return TableView;
    }(JetView));

    var views = { JetView: JetView };
    views["chart"] = ChartView;
    views["config"] = ConfigView;
    views["config/popup"] = Popup;
    views["config/properties/chart"] = ChartSettings;
    views["config/properties/group"] = GroupProperty;
    views["config/properties"] = Property;
    views["config/properties/table"] = TableSettings;
    views["config/properties/values"] = ValuesProperty;
    views["filter"] = FilterView;
    views["main"] = MainView;
    views["mode"] = ModeView;
    views["table"] = TableView;
    views["toolbar"] = ToolbarView;

    var en = {
        Done: "Done",
        Table: "Table",
        Tree: "Tree",
        Chart: "Chart",
        "Click to configure": "Click to configure",
        "Configure Pivot": "Configure Pivot",
        Total: "Total",
        Columns: "Columns",
        "Add column": "Add column",
        Rows: "Rows",
        "Add row": "Add row",
        "Clean rows": "Clean rows",
        Filters: "Filters",
        "Add filter": "Add filter",
        "Group By": "Group By",
        "Chart type": "Chart type",
        "Logarithmic scale": "Logarithmic scale",
        "X axis title": "X axis title",
        "Y axis title": "Y axis title",
        "Scale color": "Scale color",
        "Circled lines": "Circled lines",
        Lines: "Lines",
        Line: "Line",
        Radar: "Radar",
        Bar: "Bar",
        Area: "Area",
        Spline: "Spline",
        "Spline Area": "Spline Area",
        Values: "Values",
        "Add value": "Add value",
        "Field not defined": "Field not defined",
        Highlight: "Highlight",
        "Min X": "Min X",
        "Max X": "Max X",
        "Min Y": "Min Y",
        "Max Y": "Max Y",
        Footer: "Footer",
        Off: "Off",
        On: "On",
        "Sum Only": "Sum Only",
        count: "count",
        max: "max",
        min: "min",
        avg: "avg",
        wavg: "wavg",
        any: "any",
        sum: "sum",
    };

    var asc = function (a, b) { return (a.key > b.key ? 1 : -1); };
    var desc = function (a, b) { return (a.key < b.key ? 1 : -1); };
    var DataDimension = (function () {
        function DataDimension(table, getValue, label, meta, sort) {
            if (sort === "desc") {
                this._sort = desc;
            }
            else if (sort === "asc") {
                this._sort = asc;
            }
            else if (sort) {
                this._sort = function (a, b) { return sort(a.key, b.key); };
            }
            this._label = label;
            this._meta = meta || null;
            this._table = table;
            this._getter = getValue;
            this._prepared = 0;
        }
        DataDimension.prototype.getIndexes = function () {
            return this._indexes;
        };
        DataDimension.prototype.getValue = function (i) {
            return this._values[i].key;
        };
        DataDimension.prototype.getSize = function () {
            return this._values.length;
        };
        DataDimension.prototype.getLabel = function () {
            return this._label;
        };
        DataDimension.prototype.getOptions = function () {
            this._prepareOptions();
            return this._values.map(function (a) { return a.key; });
        };
        DataDimension.prototype.getMeta = function () {
            return this._meta;
        };
        DataDimension.prototype.reset = function () {
            this._prepared = 0;
        };
        DataDimension.prototype.prepare = function () {
            if (this._prepared & 1)
                return;
            this._prepared = this._prepared | 1;
            this._prepareOptions();
            var _a = this, _table = _a._table, _getter = _a._getter, _keys = _a._keys;
            var fSize = _table.count();
            this._values.forEach(function (a, i) { return (a.index = i); });
            var indexes = (this._indexes = new Array(fSize));
            for (var i = 0; i < fSize; i++) {
                var key = _getter(i);
                indexes[i] = _keys.get(key).index;
            }
        };
        DataDimension.prototype._prepareOptions = function () {
            if (this._prepared & 2)
                return;
            this._prepared = this._prepared | 2;
            var _a = this, _table = _a._table, _getter = _a._getter;
            var fSize = _table.count();
            var keys = (this._keys = new Map());
            var values = (this._values = []);
            for (var i = 0; i < fSize; i++) {
                var key = _getter(i);
                var index = keys.get(key);
                if (typeof index === "undefined") {
                    keys.set(key, (values[values.length] = { key: key, index: 0 }));
                }
            }
            if (this._sort)
                values.sort(this._sort);
        };
        return DataDimension;
    }());
    var DataExport = (function () {
        function DataExport(pivot) {
            this._pivot = pivot;
        }
        DataExport.prototype.toArray = function (_a) {
            var cleanRows = _a.cleanRows, filters = _a.filters, ops = _a.ops, total = _a.total, marks = _a.marks, aggregateRows = _a.aggregateRows, aggregateColumns = _a.aggregateColumns;
            var row;
            var out = [];
            var limit = this._pivot.getLimit();
            var maxRow = limit.rows || 0;
            this._pivot.filter(filters);
            this._pivot.operations(ops, []);
            this._pivot.resetCursor();
            var count = 0;
            while ((row = this._pivot.next())) {
                out.push(row);
                count++;
                if (maxRow === count)
                    break;
            }
            var _b = this._pivot.getWidth(), scaleWidth = _b[0], width = _b[1];
            if (cleanRows)
                this._cleanRows(out, scaleWidth);
            var result = {
                data: out,
                width: width + scaleWidth,
                scaleWidth: scaleWidth,
            };
            if (total)
                result.total = this._pivot.total(result, total);
            result.allRows = this._pivot.aggregateRows(result, aggregateRows) || [];
            result.allColumns =
                this._pivot.aggregateColumns(result, aggregateColumns) || [];
            if (marks)
                result.marks = this._pivot.mark(result, marks);
            return result;
        };
        DataExport.prototype.toNested = function (_a) {
            var filters = _a.filters, ops = _a.ops, groupOps = _a.groupOps, total = _a.total, aggregateRows = _a.aggregateRows, aggregateColumns = _a.aggregateColumns, marks = _a.marks;
            this._pivot.filter(filters);
            this._pivot.operations(ops, groupOps || []);
            this._pivot.resetCursor();
            var result = this._pivot.nested();
            if (total)
                result.total = this._pivot.total(result, total);
            result.allRows = this._pivot.aggregateRows(result, aggregateRows) || [];
            result.allColumns =
                this._pivot.aggregateColumns(result, aggregateColumns) || [];
            if (marks)
                result.marks = this._pivot.mark(result, marks);
            return result;
        };
        DataExport.prototype.toXHeader = function (data, config) {
            return this._pivot.getXHeader(data, config);
        };
        DataExport.prototype._cleanRows = function (data, rowsLength) {
            var count = data.length;
            var prev = new Array(rowsLength);
            for (var j = 0; j < count; j++) {
                var row = data[j];
                for (var i = 0; i < rowsLength; i++) {
                    if (prev[i] !== row[i]) {
                        for (var j_1 = i; j_1 < rowsLength; j_1++)
                            prev[j_1] = row[j_1];
                        break;
                    }
                    row[i] = "";
                }
            }
        };
        return DataExport;
    }());
    function t(t, e) { var n = ""; var o = t.length; var r = 0, i = !1, s = !1, u = 0; for (; r < o;) {
        var o_1 = t[r];
        if (r++, '"' === o_1)
            i ? n += t.substr(u, r - u) : u = r - 1, i = !i;
        else {
            if (i)
                continue;
            var c = "," === o_1 || "/" === o_1 || "*" === o_1 || "+" === o_1 || "-" === o_1 || "(" === o_1 || ")" === o_1, f = " " === o_1 || "\t" === o_1 || " \n" === o_1 || "\r" === o_1;
            if (s) {
                if (!c && !f)
                    continue;
                {
                    var i_1 = t.substr(u, r - u - 1);
                    n += "(" === o_1 ? e.method(i_1) : e.property(i_1), s = !1;
                }
            }
            if (f)
                continue;
            if (c)
                n += o_1;
            else {
                "0" === o_1 || "1" === o_1 || "2" === o_1 || "3" === o_1 || "4" === o_1 || "5" === o_1 || "6" === o_1 || "7" === o_1 || "8" === o_1 || "9" === o_1 ? n += o_1 : (s = !0, u = r - 1);
            }
        }
    } return s && (n += e.property(t.substr(u, r - u))), n; }
    function e(e, n) { return new Function(n.propertyName, n.methodName, n.contextName, "return " + t(e, n)); }
    function optimize(table, order, code, allMath) {
        var math = getMath(table, code);
        var ctx = {
            table: table,
            order: order,
            from: 0,
            to: 0,
            array: function (i, c) {
                var size = c.to - c.from;
                var temp = new Array(size);
                var getter = cache[i];
                for (var j = 0; j < size; j++) {
                    temp[j] = getter(c.order[j + c.from]);
                }
                return temp;
            },
        };
        return function (from, to) {
            ctx.from = from;
            ctx.to = to;
            return math(0, allMath, ctx);
        };
    }
    function optimizeGroup(code, allMath) {
        var math = getGroupMath(code);
        return function (v) {
            return math(v, allMath, null);
        };
    }
    var id = 0;
    var cache = [];
    function getMath(table, rule) {
        return e(rule, {
            propertyName: "d",
            methodName: "m",
            contextName: "c",
            property: function (a) {
                var i = id;
                cache[i] = table.getColumn(a).getter;
                id += 1;
                return "c.array(\"" + i + "\", c)";
            },
            method: function (a) {
                return "m." + a.toLowerCase();
            },
        });
    }
    function getGroupMath(rule) {
        return e(rule, {
            propertyName: "d",
            methodName: "m",
            contextName: "c",
            property: function () {
                return "d";
            },
            method: function (a) {
                return "m." + a.toLowerCase();
            },
        });
    }
    var and = function (a, b) { return function (c) { return a(c) && b(c); }; };
    function buildFinder(data, key, value, context) {
        var getValue = context.getter(data, key);
        if (typeof value !== "object") {
            var check_1 = context.compare["eq"](value);
            return function (i) { return check_1(getValue(i)); };
        }
        else {
            var ops = Object.keys(value);
            var result = null;
            var _loop_1 = function (i) {
                var check = context.compare[ops[i].toLowerCase()](value[ops[i]]);
                var step = function (i) { return check(getValue(i)); };
                result = result ? and(result, step) : step;
            };
            for (var i = 0; i < ops.length; i++) {
                _loop_1(i);
            }
            return result;
        }
    }
    function build(table, rule, context) {
        var keys = Object.keys(rule);
        var result = null;
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            var step = buildFinder(table, key, rule[key], context);
            result = result ? and(result, step) : step;
        }
        return result;
    }
    function filter(order, table, rule, context) {
        var filter = build(table, rule, context);
        return order.filter(function (n) { return filter(n); });
    }
    var DataPivot = (function () {
        function DataPivot(table, rows, cols, filters, config) {
            this._rows = rows;
            this._cols = cols;
            this._dims = rows.concat(cols);
            this._table = table;
            this._context = config;
            this._cursor = -1;
            this._order = this._base_order = this._sort();
            this._data = this._dims.map(function (a) { return a.getIndexes(); });
            this.filter(filters, true);
        }
        DataPivot.prototype.resetCursor = function () {
            this._cursor = 0;
            this._group = this._dims.map(function () { return null; });
            if (this._order.length) {
                if (this._rows.length)
                    this._nextRow();
                if (this._cols.length)
                    this._nextColumn();
            }
        };
        DataPivot.prototype.next = function () {
            var _a = this, _cursor = _a._cursor, _cols = _a._cols, _order = _a._order, _group = _a._group, _ops = _a._ops, _rows = _a._rows;
            if (this._cursor >= _order.length)
                return null;
            var dimsSize = _rows.length;
            var out = new Array(dimsSize + _ops.length * _cols.length);
            for (var i = 0; i < dimsSize; i++)
                out[i] = _rows[i].getValue(_group[i]);
            var to = this._rows.length
                ? this._nextRow(_cols.length > 0)
                : _order.length;
            this._fillRow(out, _cursor, to, dimsSize);
            this._cursor = to;
            return out;
        };
        DataPivot.prototype.nested = function () {
            var _a = this, _cols = _a._cols, _order = _a._order, _rows = _a._rows;
            var dimSize = _rows.length;
            var dimOutSize = dimSize > 0 ? 1 : 0;
            var levels = [{ data: [], values: [] }];
            var starts = _rows.map(function () { return 0; });
            var data = [];
            var prev = [];
            var now = [];
            var from = this._cursor;
            var count = 0;
            var limit = this._context.limit.rows;
            var width = Math.min(this._context.limit.columns, (_cols.length ? this._sizes[0] * _cols[0].getSize() : 0) + dimOutSize);
            while (this._cursor < _order.length) {
                var out = new Array(width);
                prev = now;
                now = [].concat(this._group);
                var to = this._rows.length
                    ? this._nextRow(_cols.length > 0)
                    : _order.length;
                this._fillRow(out, from, to, dimOutSize);
                if (dimSize > 0) {
                    for (var level = 0; level < dimSize; level++) {
                        if (now[level] != prev[level]) {
                            for (var j = level; j < dimSize; j++) {
                                var index = j + 1;
                                var last = index === dimSize;
                                var obj = (levels[index] = {
                                    id: last ? data.length + 1 : 0,
                                    data: last ? null : [],
                                    values: last ? out : [_rows[j].getValue(now[j])],
                                });
                                starts[index] = from;
                                levels[j].data.push(obj);
                            }
                            break;
                        }
                    }
                    out[0] = _rows[dimSize - 1].getValue(now[dimSize - 1]);
                    levels[dimSize].values = out;
                }
                else {
                    levels[0].data.push({ data: null, values: out });
                }
                data.push(out);
                count++;
                if (count >= limit)
                    break;
                this._cursor = from = to;
            }
            this._fillGroupRowInner(levels[0], 0, __spreadArrays([null], this._groupOps).slice(0, _rows.length), width);
            return { tree: levels[0].data, data: data, width: width, scaleWidth: dimOutSize };
        };
        DataPivot.prototype.getLimit = function () {
            return this._context.limit;
        };
        DataPivot.prototype.getWidth = function () {
            return [
                this._rows.length,
                this._cols.length && this._ops.length
                    ? this._cols[0].getSize() * this._sizes[0]
                    : 0,
            ];
        };
        DataPivot.prototype.getXHeader = function (result, hConfig) {
            var _a = this, _cols = _a._cols, _rows = _a._rows, _ops = _a._ops, _opInfo = _a._opInfo;
            var _b = hConfig || {}, nonEmpty = _b.nonEmpty, meta = _b.meta;
            var data = result.data;
            var isNested = result.tree;
            var line = [];
            var rpref = result.tree ? Math.min(_rows.length, 1) : _rows.length;
            var ostep = _ops.length;
            var unitsInParent = _cols.map(function (a) { return a.getSize(); });
            var length = unitsInParent.reduce(function (prev, value) { return prev * value; }, ostep);
            var fullLength = Math.min(rpref + length, this._context.limit.columns);
            var temp = length;
            var unitSizes = unitsInParent.map(function (a) { return (temp = temp / a); });
            var out = [];
            this._cols.forEach(function () { return out.push(new Array(fullLength)); });
            if (nonEmpty) {
                for (var i = 0; i < rpref; i++)
                    line.push(i);
                for (var j = rpref; j < fullLength; j += ostep) {
                    outer: for (var i = 0; i < data.length; i++) {
                        if (typeof data[i][j] !== "undefined") {
                            for (var i_2 = 0; i_2 < _ops.length; i_2++)
                                line.push(j + i_2);
                            break outer;
                        }
                    }
                }
                for (var j = 0; j < _cols.length; j++) {
                    var step = unitSizes[j];
                    var start = -1;
                    var end = 0;
                    var colspan = 0;
                    var text = void 0;
                    for (var i = rpref; i < line.length; i += ostep) {
                        var test = line[i];
                        if (test < end) {
                            colspan += ostep;
                        }
                        else {
                            if (colspan !== 0) {
                                out[j][start] = { colspan: colspan, text: text };
                            }
                            var ind = Math.floor((test - rpref) / step);
                            start = test;
                            end = (ind + 1) * step + rpref;
                            colspan = ostep;
                            text = _cols[j].getValue(ind % unitsInParent[j]);
                        }
                    }
                    if (colspan !== 0)
                        out[j][start] = { colspan: colspan, text: text };
                }
            }
            else {
                for (var i = 0; i < _cols.length; i++) {
                    var size = unitsInParent[i];
                    var step = unitSizes[i];
                    var ind = 0;
                    for (var j = rpref; j < fullLength; j += step) {
                        if (step === 1) {
                            out[i][j] = _cols[i].getValue(ind++);
                        }
                        else {
                            out[i][j] = { text: _cols[i].getValue(ind++), colspan: step };
                        }
                        if (ind >= size)
                            ind = 0;
                    }
                }
            }
            if (this._ops) {
                var opNames = new Array(fullLength);
                var step = _ops.length;
                for (var j = rpref; j < fullLength; j += step)
                    for (var z = 0; z < step; z++)
                        opNames[j + z] = _opInfo[z].label;
                out.push(opNames);
            }
            for (var i = 0; i < rpref; i++) {
                var rowspan = _cols.length + (this._ops ? 1 : 0);
                if (isNested) {
                    out[0][0] = { text: "", rowspan: rowspan };
                    break;
                }
                var text = _rows[i].getLabel();
                out[0][i] = rowspan > 1 ? { text: text, rowspan: rowspan } : text;
            }
            var res = { data: out };
            if (nonEmpty)
                res.nonEmpty = line;
            if (meta) {
                var metaLine = new Array(fullLength);
                for (var i = 0; i < rpref; i++)
                    metaLine[i] = _rows[i].getMeta();
                var step = _ops.length;
                for (var j = rpref; j < fullLength; j += step)
                    for (var z = 0; z < step; z++)
                        metaLine[j + z] = _opInfo[z].meta;
                res.meta = metaLine;
            }
            return res;
        };
        DataPivot.prototype.filter = function (rules, master) {
            if (!rules || Object.keys(rules).length === 0) {
                if (!master && this._masterRules)
                    rules = Object.assign(Object.assign({}, this._masterRules), rules);
                else {
                    this._order = this._base_order;
                    return;
                }
            }
            if (master)
                this._masterRules = rules;
            this._order = filter(this._base_order, this._table, rules, this._context);
        };
        DataPivot.prototype.operations = function (ops, groupOps) {
            var _a = this, _table = _a._table, _order = _a._order, _context = _a._context;
            ops = ops || [];
            this._ops = ops.map(function (p) { return optimize(_table, _order, typeof p === "string" ? p : p.math, _context.math); });
            this._opInfo = ops.map(function (p) {
                if (typeof p === "string") {
                    return { label: p, math: p };
                }
                else {
                    return Object.assign(Object.assign({}, p), { label: p.label || p.math });
                }
            });
            this._groupOps = groupOps.map(function (ops) {
                return ops
                    ? ops.map(function (p) { return optimizeGroup(typeof p === "string" ? p : p.math, _context.math); })
                    : null;
            });
            this._setSizes();
        };
        DataPivot.prototype.total = function (result, total) {
            var _this = this;
            var ops = total.map(function (p) { return optimizeGroup(typeof p === "string" ? p : p.math, _this._context.math); });
            if (result.tree) {
                var temp = { data: result.tree, values: [] };
                this._fillGroupRowInner(temp, 0, [ops], result.width);
                return temp.values;
            }
            else {
                return this._fillTotal(result.data, ops, result.width, result.scaleWidth);
            }
        };
        DataPivot.prototype.aggregateRows = function (result, ops) {
            var config = {};
            var exit = true;
            for (var key in ops) {
                var test = ops[key];
                config[key] = optimizeGroup(test, this._context.math);
                exit = false;
            }
            if (exit)
                return null;
            return this._filAggrRows(result.data, config, result.width, result.scaleWidth);
        };
        DataPivot.prototype.aggregateColumns = function (result, ops) {
            var config = {};
            var exit = true;
            for (var key in ops) {
                var test = ops[key];
                config[key] = optimizeGroup(test, this._context.math);
                exit = false;
            }
            if (exit)
                return null;
            return this._filAggrCols(result.data, config, result.width, result.scaleWidth);
        };
        DataPivot.prototype.mark = function (result, ops) {
            var order = [];
            for (var key in ops)
                order.push([key, ops[key]]);
            if (!order.length)
                return null;
            var out = [];
            var width = result.width;
            var obj = result.data;
            var len = obj.length;
            for (var j = 0; j < len; j++) {
                var marks = [];
                out.push(marks);
                for (var i = result.scaleWidth; i < width; i++) {
                    var value = obj[j][i];
                    if (typeof value !== "undefined") {
                        for (var z = 0; z < order.length; z++) {
                            var cm = order[z][1](value, result.allRows[i], result.allColumns[j]);
                            if (cm) {
                                if (marks[i])
                                    marks[i].push(order[z][0]);
                                else
                                    marks[i] = [order[z][0]];
                            }
                        }
                    }
                }
            }
            return out;
        };
        DataPivot.prototype._fillGroupRowInner = function (obj, level, maths, width) {
            var needNext = maths.length > level;
            var data = obj.data;
            if (needNext)
                for (var i = 0; i < obj.data.length; i++)
                    this._fillGroupRowInner(data[i], level + 1, maths, width);
            var mline = maths[level];
            if (mline) {
                var step = this._ops.length;
                var _loop_2 = function (i) {
                    var op = mline[(i - 1) % step];
                    if (op) {
                        var arr = obj.data
                            .map(function (a) { return a.values[i]; })
                            .filter(function (a) { return typeof a !== "undefined"; });
                        if (arr.length > 0)
                            obj.values[i] = op(arr);
                    }
                };
                for (var i = 1; i <= width; i++) {
                    _loop_2(i);
                }
            }
        };
        DataPivot.prototype._fillTotal = function (obj, mline, width, prefix) {
            var result = [];
            if (mline) {
                var step = this._ops.length;
                var _loop_3 = function (i) {
                    var op = mline[(i - 1) % step];
                    if (op) {
                        var arr = obj.map(function (a) { return a[i]; }).filter(function (a) { return typeof a !== "undefined"; });
                        if (arr.length > 0)
                            result[i] = op(arr);
                    }
                };
                for (var i = prefix; i < width; i++) {
                    _loop_3(i);
                }
            }
            return result;
        };
        DataPivot.prototype._filAggrRows = function (obj, mline, width, prefix) {
            var result = [];
            if (mline) {
                var _loop_4 = function (i) {
                    var arr = obj.map(function (a) { return a[i]; }).filter(function (a) { return typeof a !== "undefined"; });
                    if (arr.length > 0) {
                        var t_1 = (result[i] = {});
                        for (var key in mline) {
                            t_1[key] = mline[key](arr);
                        }
                    }
                };
                for (var i = prefix; i < width; i++) {
                    _loop_4(i);
                }
            }
            return result;
        };
        DataPivot.prototype._filAggrCols = function (obj, mline, width, prefix) {
            var result = [];
            if (mline) {
                var height = obj.length;
                for (var i = 0; i < height; i++) {
                    var arr = (prefix ? obj[i].slice(prefix) : obj[i]).filter(function (a) { return typeof a !== "undefined"; });
                    if (arr.length > 0) {
                        var t_2 = (result[i] = {});
                        for (var key in mline) {
                            t_2[key] = mline[key](arr);
                        }
                    }
                }
            }
            return result;
        };
        DataPivot.prototype._fillRow = function (out, from, to, dimsSize) {
            var _a = this, _cols = _a._cols, _group = _a._group, _ops = _a._ops, _sizes = _a._sizes, _rows = _a._rows;
            var rl = _rows.length;
            if (_ops.length) {
                if (_cols.length) {
                    var cfrom = from;
                    while (cfrom < to) {
                        var cind = 0;
                        for (var i = 0; i < _cols.length; i++)
                            cind += _sizes[i] * _group[rl + i];
                        var cto = this._nextColumn();
                        for (var i = 0; i < _ops.length; i++) {
                            out[cind + dimsSize + i] = _ops[i](cfrom, cto);
                        }
                        this._cursor = cfrom = cto;
                    }
                }
                else {
                    for (var i = 0; i < _ops.length; i++)
                        out[i + dimsSize] = _ops[i](from, to);
                }
            }
        };
        DataPivot.prototype._sort = function () {
            var _a = this, _table = _a._table, _dims = _a._dims;
            var size = Math.min(_table.count(), this._context.limit.raws);
            var order = new Array(size);
            for (var i = 0; i < size; i++) {
                order[i] = i;
            }
            var dimsSize = _dims.length;
            var dimsData = _dims.map(function (a) { return a.getIndexes(); });
            order.sort(function (a, b) {
                for (var j = 0; j < dimsSize; j++) {
                    var left = dimsData[j][a];
                    var right = dimsData[j][b];
                    if (left > right)
                        return 1;
                    if (left < right)
                        return -1;
                }
                return 0;
            });
            return order;
        };
        DataPivot.prototype._nextRow = function (silent) {
            var _a = this, _data = _a._data, _order = _a._order, _group = _a._group, _rows = _a._rows;
            var dimsSize = _rows.length;
            var ok = true;
            var to = this._cursor;
            while (true) {
                var ind = _order[to];
                for (var i = 0; i < dimsSize; i++) {
                    if (_data[i][ind] != _group[i]) {
                        if (!silent)
                            _group[i] = _data[i][ind];
                        ok = false;
                    }
                }
                if (!ok)
                    break;
                to++;
            }
            return to;
        };
        DataPivot.prototype._nextColumn = function () {
            var _a = this, _data = _a._data, _order = _a._order, _group = _a._group, _rows = _a._rows, _cols = _a._cols;
            var dimsSize = _cols.length + _rows.length;
            var ok = true;
            var to = this._cursor;
            while (true) {
                var ind = _order[to];
                for (var i = 0; i < dimsSize; i++) {
                    if (_data[i][ind] != _group[i]) {
                        _group[i] = _data[i][ind];
                        ok = false;
                    }
                }
                if (!ok)
                    break;
                to++;
            }
            return to;
        };
        DataPivot.prototype._setSizes = function () {
            var sizes = this._cols.map(function (a) { return a.getSize(); });
            var sum = this._ops.length || 1;
            for (var i = sizes.length - 1; i >= 0; i--) {
                var now = sum;
                sum *= sizes[i];
                sizes[i] = now;
            }
            this._sizes = sizes;
        };
        return DataPivot;
    }());
    var RawTable = (function () {
        function RawTable(config) {
            this._columns = config.fields;
            this.parse(config.data);
        }
        RawTable.prototype.parse = function (data) {
            this._raw = data;
            this._parse_inner();
        };
        RawTable.prototype.prepare = function () {
            if (this._prepared)
                return;
            this._prepared = true;
            var data = this._raw;
            var fields = this._columns;
            var cols = fields.filter(function (a) { return a.type === 3; });
            if (!data || !cols.length)
                return;
            var dataLength = data.length;
            var columnsLength = cols.length;
            for (var i = 0; i < dataLength; i++) {
                for (var j = 0; j < columnsLength; j++) {
                    var col = cols[j];
                    var text = col.getter(i);
                    if (typeof text === "string")
                        col.setter(i, new Date(text));
                }
            }
        };
        RawTable.prototype._parse_inner = function () {
            var _this = this;
            this._columns.forEach(function (a) {
                var key = a.id;
                a.getter = function (i) { return _this._raw[i][key]; };
                a.setter = function (i, v) { return (_this._raw[i][key] = v); };
            });
        };
        RawTable.prototype.getColumn = function (id) {
            return this._columns.find(function (a) { return a.id === id; });
        };
        RawTable.prototype.count = function () {
            return this._raw.length;
        };
        return RawTable;
    }());
    var ColumnTable = (function (_super) {
        __extends(ColumnTable, _super);
        function ColumnTable() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        ColumnTable.prototype.parse = function (data) {
            this._parse_init(data.length);
            var dataLength = data.length;
            var columnsLength = this._columns.length;
            for (var i = 0; i < dataLength; i++) {
                var obj = data[i];
                for (var j = 0; j < columnsLength; j++) {
                    var col = this._columns[j];
                    col.data[i] = obj[col.id];
                }
            }
        };
        ColumnTable.prototype._parse_init = function (n) {
            this._columns.forEach(function (a) {
                var data = (a.data = new Array(n));
                a.getter = function (i) { return data[i]; };
                a.setter = function (i, v) { return (data[i] = v); };
            });
        };
        ColumnTable.prototype.count = function () {
            return this._columns[0].data.length;
        };
        return ColumnTable;
    }(RawTable));
    var methods = {
        round: function (v) { return Math.round(v); },
        sum: function (arr) { return arr.reduce(function (acc, a) { return acc + a; }, 0); },
        min: function (arr) { return arr.reduce(function (acc, a) { return (a < acc ? a : acc); }, arr.length ? arr[0] : 0); },
        max: function (arr) { return arr.reduce(function (acc, a) { return (a > acc ? a : acc); }, arr.length ? arr[0] : 0); },
        avg: function (arr) { return arr.length ? arr.reduce(function (acc, a) { return acc + a; }, 0) / arr.length : 0; },
        wavg: function (arr, w) {
            if (!arr.length)
                return 0;
            var count = 0;
            var summ = 0;
            for (var i = arr.length - 1; i >= 0; i--) {
                count += w[i];
                summ += arr[i] * w[i];
            }
            return summ / count;
        },
        count: function (arr) { return arr.length; },
        any: function (arr) { return (arr.length ? arr[0] : null); },
    };
    var filters = {
        eq: function (v) { return function (x) { return x == v; }; },
        neq: function (v) { return function (x) { return x != v; }; },
        gt: function (v) { return function (x) { return x > v; }; },
        gte: function (v) { return function (x) { return x >= v; }; },
        lt: function (v) { return function (x) { return x < v; }; },
        lte: function (v) { return function (x) { return x <= v; }; },
        in: function (v) { return function (x) { return v[x]; }; },
        hasPrefix: function (v) { return function (x) { return x.indexOf(v) === 0; }; },
        contains: function (v) { return function (x) { return x.indexOf(v) !== -1; }; },
    };
    var predicates = {
        year: function (v) { return v.getFullYear(); },
        month: function (v) { return v.getMonth(); },
        day: function (v) { return v.getDay(); },
        hour: function (v) { return v.getHours(); },
        minute: function (v) { return v.getMinutes(); },
    };
    var Analytic = (function () {
        function Analytic(cfg) {
            var _this = this;
            this._tables = {};
            this._dimensions = {};
            this._preds = Object.assign({}, predicates);
            this._maths = Object.assign({}, methods);
            this._comps = Object.assign({}, filters);
            if (cfg && cfg.tables)
                cfg.tables.forEach(function (s) { return _this.addTable(s); });
            if (cfg && cfg.dimensions)
                cfg.dimensions.forEach(function (s) { return _this.addDimension(s); });
        }
        Analytic.prototype.addPredicate = function (name, code) {
            this._preds[name.toLowerCase()] = code;
        };
        Analytic.prototype.addMath = function (name, code) {
            this._maths[name.toLowerCase()] = code;
        };
        Analytic.prototype.addComparator = function (name, code) {
            this._comps[name.toLowerCase()] = code;
        };
        Analytic.prototype.getDimension = function (id) {
            return this._dimensions[id];
        };
        Analytic.prototype.addDimension = function (s) {
            if (this._dimensions[s.id])
                return;
            var table = this._tables[s.table];
            var getter = this._predicateGetter(table, s.rule.by);
            this._dimensions[s.id] = new DataDimension(table, getter, s.label || s.id, s.meta || s, s.sort);
        };
        Analytic.prototype.resetDimensions = function (s, preserve) {
            var _this = this;
            var prev = this._dimensions;
            this._dimensions = {};
            if (s)
                s.forEach(function (a) {
                    var used = prev[a.id];
                    if (preserve && used)
                        _this._dimensions[a.id] = used;
                    else
                        _this.addDimension(a);
                });
        };
        Analytic.prototype.addTable = function (s) {
            var driver = (s.driver || "raw") === "raw" ? RawTable : ColumnTable;
            var t = (this._tables[s.id] = new driver(s));
            if (s.prepare)
                t.prepare();
        };
        Analytic.prototype.getTable = function (id) {
            return this._tables[id];
        };
        Analytic.prototype.compact = function (table, config) {
            var _this = this;
            var rows = config.rows, cols = config.cols, filters = config.filters, limit = config.limit;
            var base = this._tables[table];
            var rDims = rows ? rows.map(function (a) { return _this._dimensions[a]; }) : [];
            var cDims = cols ? cols.map(function (a) { return _this._dimensions[a]; }) : [];
            __spreadArrays(rDims, cDims).forEach(function (a) { return a.prepare(); });
            var pivot = new DataPivot(base, rDims, cDims, filters, {
                getter: this._predicateGetter.bind(this),
                math: this._maths,
                compare: this._comps,
                limit: Object.assign({ rows: 10000, columns: 5000, raws: Infinity }, (limit || {})),
            });
            return new DataExport(pivot);
        };
        Analytic.prototype._predicateGetter = function (table, key) {
            var find = key.indexOf("(");
            if (find !== -1) {
                var fn_1 = this._preds[key.substr(0, find).toLowerCase()];
                key = key.substr(find + 1, key.length - find - 2);
                var getter_1 = table.getColumn(key).getter;
                return function (i) { return fn_1(getter_1(i)); };
            }
            else {
                return table.getColumn(key).getter;
            }
        };
        return Analytic;
    }());

    var LocalData = (function () {
        function LocalData(app) {
            this._app = app;
            this._store = {};
            this._data = [];
            this._filtersHash = {};
            this._state = app.getState();
            this._initRengine();
        }
        LocalData.prototype._setOperations = function () {
            this.operations = [
                { id: "sum" },
                { id: "min" },
                { id: "max" },
                { id: "avg" },
                { id: "wavg" },
                { id: "count" },
                { id: "any" },
            ];
            var extraOperations = this._app.config.operations;
            if (extraOperations)
                for (var name_1 in extraOperations) {
                    this._reng.addMath(name_1, extraOperations[name_1]);
                    this.operations.push({ id: name_1 });
                }
        };
        LocalData.prototype._setFilters = function () {
            var _loop_1 = function (type) {
                this_1._reng.addComparator(type, function (v) { return function (test) {
                    if (type == "date")
                        test = test.valueOf();
                    if (!v)
                        return true;
                    else if (v.includes)
                        return v.includes.indexOf(test) != -1;
                    else if (!v.condition.filter)
                        return true;
                    else
                        return webix.filters[type][v.condition.type](test, v.condition.filter);
                }; });
            };
            var this_1 = this;
            for (var type in webix.filters) {
                _loop_1(type);
            }
        };
        LocalData.prototype._setPredicates = function () {
            var predicates = this._app.config.predicates;
            if (predicates)
                for (var name_2 in predicates)
                    this._reng.addPredicate(name_2, predicates[name_2]);
        };
        LocalData.prototype.getFields = function (firstRow) {
            var fields = this._app.config.fields;
            if (!fields) {
                fields = [];
                for (var i in firstRow) {
                    var type = void 0;
                    var dataType = typeof firstRow[i];
                    switch (dataType) {
                        case "string":
                            type = "text";
                            break;
                        case "number":
                            type = dataType;
                            break;
                        default:
                            type = "date";
                    }
                    fields.push({ id: i, value: i, type: type });
                }
            }
            return fields;
        };
        LocalData.prototype.getData = function (force) {
            var _this = this;
            if (!Object.keys(this._store).length || force) {
                return this._app
                    .getService("backend")
                    .data()
                    .then(function (data) {
                    _this._filtersHash = {};
                    _this._table = _this.getTable(data);
                    _this._reng.addTable(_this._table);
                    _this._store = _this.getPivotData();
                    return _this._store;
                });
            }
            else {
                this._store = this.getPivotData();
                return webix.promise.resolve(this._store);
            }
        };
        LocalData.prototype._initRengine = function () {
            this._reng = new Analytic();
            this._setFilters();
            this._setOperations();
            this._setPredicates();
        };
        LocalData.prototype.getPivotData = function () {
            var _this = this;
            this.setDimensions();
            var filters = {};
            var _loop_2 = function (i) {
                var _a;
                var filter = this_2._state.structure.filters[i];
                var fields = this_2._state.fields;
                var field = fields.find(function (field) { return field.id == filter.name; });
                filters[filter.name] = (_a = {}, _a[field.type] = filter.value, _a);
            };
            var this_2 = this;
            for (var i = 0; i < this._state.structure.filters.length; i++) {
                _loop_2(i);
            }
            var res = this._reng.compact(this._table.id, {
                rows: this.getRows(),
                cols: this.getColumns(),
                limit: this.getLimits(),
            });
            var vals = this._state.structure.values;
            var ops = [];
            var groupOps = [];
            for (var i = 0; i < vals.length; i++) {
                var name_3 = vals[i].name;
                name_3 = webix.isArray(name_3) ? name_3.join(",") : name_3;
                var format = vals[i].format;
                var operation = vals[i].operation;
                var color = vals[i].color;
                var math = name_3 ? operation + "(" + name_3 + ")" : operation;
                ops.push({
                    math: math,
                    label: name_3,
                    meta: { operation: operation, format: format, color: color },
                });
                groupOps.push(math);
            }
            var datatable = this._state.datatable;
            var aggregateRows = {};
            var aggregateColumns = {};
            var marks = {};
            if (datatable.minY) {
                aggregateRows.min = "min(n)";
                marks.webix_min_y = function (v, rows) { return v === rows.min; };
            }
            if (datatable.maxY) {
                aggregateRows.max = "max(n)";
                marks.webix_max_y = function (v, rows) { return v === rows.max; };
            }
            if (datatable.minX) {
                aggregateColumns.min = "min(n)";
                marks.webix_min_x = function (v, rows, cols) { return v === cols.min; };
            }
            if (datatable.maxX) {
                aggregateColumns.max = "max(n)";
                marks.webix_max_x = function (v, rows, cols) { return v === cols.max; };
            }
            var total = new Array(ops.length);
            if (datatable.footer) {
                for (var i = 0; i < ops.length; i++) {
                    var operation = ops[i].meta.operation;
                    if (datatable.footer != "sumOnly" || operation == "sum") {
                        if (operation.indexOf("(") != -1)
                            operation = "sum";
                        else if (operation == "wavg")
                            operation = "avg";
                        total[i] = operation + "(group)";
                    }
                }
            }
            var result;
            var header;
            if (this._state.mode == "table") {
                result = res.toArray({
                    filters: filters,
                    ops: ops,
                    aggregateRows: aggregateRows,
                    aggregateColumns: aggregateColumns,
                    marks: marks,
                    total: total,
                    cleanRows: datatable.cleanRows,
                });
                header = this.getHeader(res, result);
                result.data = result.data.map(function (a, i) {
                    a.unshift(i + 1);
                    a.id = i + 1;
                    return a;
                });
            }
            else {
                var groupArr = [];
                for (var i = 0; i < this.getRows().length - 1; i++) {
                    groupArr.push(groupOps);
                }
                result = res.toNested({
                    filters: filters,
                    ops: ops,
                    groupOps: groupArr,
                    aggregateRows: aggregateRows,
                    aggregateColumns: aggregateColumns,
                    marks: marks,
                    total: total,
                });
                if (this._state.mode == "tree") {
                    header = this.getHeader(res, result);
                    result.tree = result.tree.map(function (a) {
                        return _this._toTree(a);
                    });
                }
                else
                    return this.getChartData(res, result, ops);
            }
            return {
                data: result.tree ? result.tree : result.data,
                header: header,
                marks: result.marks,
                total: result.total,
            };
        };
        LocalData.prototype._toTree = function (obj) {
            var _this = this;
            var item = obj.values;
            item.unshift("");
            if (obj.data) {
                item.open = true;
                item.data = obj.data.map(function (r) {
                    return _this._toTree(r);
                });
            }
            else
                item.id = obj.id;
            return item;
        };
        LocalData.prototype.getTable = function (data) {
            var fields = this.getFields(data[0]);
            this._state.fields = fields;
            this._data = data = this.prepareData(data, fields);
            var tname = "webixpivot" + webix.uid();
            return {
                id: tname,
                prepare: true,
                driver: "raw",
                fields: webix.copy(fields),
                data: data,
            };
        };
        LocalData.prototype.prepareData = function (data, fields) {
            fields = fields.filter(function (field) { return field.prepare || field.type == "date"; });
            if (fields.length) {
                data = data.map(function (item) {
                    fields.forEach(function (field) {
                        item[field.id] = field.prepare
                            ? field.prepare(item[field.id])
                            : new Date(item[field.id]);
                    });
                    return item;
                });
            }
            return data;
        };
        LocalData.prototype.collectFieldValues = function (field) {
            if (this._filtersHash[field])
                return this._filtersHash[field];
            var fieldObj = this.getField(field);
            var hash = {};
            var values = [];
            for (var i = 0; i < this._data.length; i++) {
                var value = this._data[i][field];
                if (value || value === 0) {
                    if (fieldObj.type == "date")
                        value = value.valueOf();
                    if (!hash[value]) {
                        hash[value] = true;
                        values.push({ value: value, id: value });
                    }
                }
            }
            this._filtersHash[field] = values;
            return values;
        };
        LocalData.prototype.fixMath = function (math) {
            var _ = this._app.getService("locale")._;
            var fields = this._state.fields;
            var fieldsRegex = new RegExp(fields.map(function (field) { return "\\b" + field.id + "\\b(?!\\()"; }).join("|"), "g");
            var methods = this.operations;
            var methodsRegex = new RegExp(methods.map(function (method) { return "\\b" + method.id + "\\b\\("; }).join("|"), "g");
            return math
                .replaceAll(fieldsRegex, function (id) { return fields.find(function (obj) { return obj.id == id; }).value; })
                .replaceAll(methodsRegex, function (method) { return _(method.substring(0, method.length - 1)) + "("; });
        };
        LocalData.prototype.getField = function (id) {
            return this._state.fields.find(function (obj) { return obj.id == id; });
        };
        LocalData.prototype.getColumns = function () {
            var struct = this._state.structure;
            if (this._state.mode == "chart" && struct.groupBy)
                return [struct.groupBy];
            else
                return struct.columns;
        };
        LocalData.prototype.getRows = function () {
            return this._state.mode != "chart" ? this._state.structure.rows : [];
        };
        LocalData.prototype.getLimits = function () {
            return {};
        };
        LocalData.prototype.getHeader = function (res, result) {
            var hdata = res.toXHeader(result, { meta: true, nonEmpty: true });
            var header = hdata.data;
            var rows = [];
            hdata.nonEmpty.forEach(function (i) {
                rows.push({
                    id: i + 1,
                    header: header.map(function (h) {
                        h = h[i] && h[i].text ? h[i] : { text: h[i] || "" };
                        var op = hdata.meta[i] && hdata.meta[i].operation;
                        if (op)
                            h.operation = op;
                        return h;
                    }),
                    format: hdata.meta[i] && hdata.meta[i].format,
                });
            });
            return rows;
        };
        LocalData.prototype.setDimensions = function () {
            this._reng.resetDimensions();
            var columns = this.getColumns();
            var fields = columns.concat(this.getRows() || []);
            for (var i = 0; i < fields.length; i++) {
                var field = this.getField(fields[i]);
                this._reng.addDimension({
                    id: fields[i],
                    table: this._table.id,
                    label: fields[i],
                    rule: {
                        by: field.predicate ? field.predicate + "(" + fields[i] + ")" : fields[i],
                    },
                });
            }
        };
        LocalData.prototype.getChartData = function (res, result, ops) {
            var data = [];
            var values = [];
            var axis = res.toXHeader(result).data[0];
            if (result.data.length) {
                var first = webix.copy(result.data[0]);
                var count = 0;
                while (first.length) {
                    var item = first.splice(0, ops.length);
                    if (item.length) {
                        item.push(axis[count].text || axis[count]);
                        data.push(item);
                        count += ops.length;
                    }
                    else
                        break;
                }
            }
            for (var i = 0; i < ops.length; i++) {
                values.push({
                    text: ops[i].label || ops[i].meta.operation,
                    operation: ops[i].meta.operation,
                    color: ops[i].meta.color,
                });
            }
            return { data: data, values: values };
        };
        LocalData.prototype.getPalette = function () {
            return [
                ["#e33fc7", "#a244ea", "#476cee", "#36abee", "#58dccd", "#a7ee70"],
                ["#d3ee36", "#eed236", "#ee9336", "#ee4339", "#595959", "#b85981"],
                ["#c670b8", "#9984ce", "#b9b9e2", "#b0cdfa", "#a0e4eb", "#7faf1b"],
                ["#b4d9a4", "#f2f79a", "#ffaa7d", "#d6806f", "#939393", "#d9b0d1"],
                ["#780e3b", "#684da9", "#242464", "#205793", "#5199a4", "#065c27"],
                ["#54b15a", "#ecf125", "#c65000", "#990001", "#363636", "#800f3e"],
            ];
        };
        LocalData.prototype.getValueColor = function (i) {
            var palette = this.getPalette();
            var rowIndex = i / palette[0].length;
            rowIndex = rowIndex > palette.length ? 0 : parseInt(rowIndex, 10);
            var columnIndex = i % palette[0].length;
            return palette[rowIndex][columnIndex];
        };
        return LocalData;
    }());

    var Backend = (function () {
        function Backend(app, url) {
            this.app = app;
            this._url = url;
        }
        Backend.prototype.url = function (path) {
            return this._url + (path || "");
        };
        Backend.prototype.data = function () {
            return webix.ajax(this.url()).then(function (res) { return res.json(); });
        };
        return Backend;
    }());

    var App = (function (_super) {
        __extends(App, _super);
        function App(config) {
            var _this = this;
            var mode = config.mode || "tree";
            var structure = config.structure || {};
            var chart = config.chart || {};
            webix.extend(chart, { type: "bar", scale: "linear", lines: true });
            delete chart.id;
            var datatable = config.datatable || {};
            delete datatable.id;
            var state = createState({
                mode: mode,
                structure: structure,
                readonly: config.readonly || false,
                fields: config.fields || [],
                datatable: datatable,
                chart: chart,
                config: false,
            });
            var defaults = {
                router: EmptyRouter,
                version: "9.1.0",
                debug: true,
                compactWidth: 720,
                start: "main/" + (mode == "chart" ? "chart" : "table"),
                params: { state: state, forceCompact: config.compact },
            };
            _this = _super.call(this, __assign(__assign({}, defaults), config)) || this;
            _this.setService("backend", new (_this.dynamic(Backend))(_this, _this.config.url));
            _this.setService("local", new (_this.dynamic(LocalData))(_this, config));
            structure = _this.prepareStructure(structure, true);
            _this.use(plugins.Locale, _this.config.locale || {
                lang: "en",
                webix: {
                    en: "en-US",
                },
            });
            return _this;
        }
        App.prototype.dynamic = function (obj) {
            return this.config.override ? this.config.override.get(obj) || obj : obj;
        };
        App.prototype.require = function (type, name) {
            if (type === "jet-views")
                return views[name];
            else if (type === "jet-locales")
                return locales[name];
            return null;
        };
        App.prototype.getState = function () {
            return this.config.params.state;
        };
        App.prototype.setStructure = function (structure) {
            this.getState().structure = this.prepareStructure(structure);
        };
        App.prototype.getStructure = function () {
            return this.getState().structure;
        };
        App.prototype.prepareStructure = function (structure, initial) {
            var mode = this.getState().mode;
            webix.extend(structure, {
                rows: [],
                columns: [],
                values: [],
                filters: [],
            });
            if (initial) {
                if ((mode != "chart" || !structure.groupBy) && structure.columns.length)
                    structure.groupBy = structure.columns[0];
                else if (structure.groupBy)
                    structure.columns = [structure.groupBy];
            }
            else {
                if (mode != "chart")
                    structure.groupBy = structure.columns[0];
                else {
                    if (!structure.groupBy)
                        structure.columns = [];
                    else if (structure.columns[0] !== structure.groupBy)
                        structure.columns = [structure.groupBy];
                }
            }
            var values = [];
            for (var i = 0; i < structure.values.length; i++) {
                var value = structure.values[i];
                if (webix.isArray(value.operation)) {
                    value.color =
                        (webix.isArray(value.color) ? value.color : [value.color]) || [];
                    for (var i_1 = 0; i_1 < value.operation.length; i_1++) {
                        var obj = __assign({}, value);
                        obj.operation = value.operation[i_1];
                        obj.color = value.color && value.color[i_1];
                        values.push(obj);
                    }
                }
                else
                    values.push(value);
            }
            for (var i = 0; i < values.length; i++) {
                if (!values[i].color)
                    values[i].color = this.getService("local").getValueColor(i);
            }
            structure.values = values;
            return structure;
        };
        return App;
    }(JetApp));
    webix.protoUI({
        name: "pivot",
        app: App,
        defaults: {
            borderless: false,
        },
        $init: function () {
            var _this = this;
            this.name = "pivot";
            var state = this.$app.getState();
            for (var key in state) {
                link(state, this.config, key);
            }
            this.$app.attachEvent("filter:change", function (field, value) {
                return _this.callEvent("onFilterChange", [field, value]);
            });
        },
        $exportView: function (options) {
            var exportView = this.$app.getRoot().queryView({ $mainView: true });
            return exportView.$exportView
                ? exportView.$exportView(options)
                : exportView;
        },
        getState: function () {
            return this.$app.getState();
        },
        getService: function (name) {
            return this.$app.getService(name);
        },
        setStructure: function (structure) {
            this.$app.setStructure(structure);
        },
        getStructure: function () {
            return this.$app.getStructure();
        },
    }, webix.ui.jetapp);
    var services = { Backend: Backend, LocalData: LocalData };
    var locales = { en: en };

    exports.App = App;
    exports.locales = locales;
    exports.services = services;
    exports.views = views;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
