"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var tiny_emitter_1 = require("tiny-emitter");
var metrics_1 = require("./metrics");
var storage_provider_local_1 = require("./storage-provider-local");
exports.EVENTS = {
    READY: 'ready',
    UPDATE: 'update',
};
var defaultVariant = { name: 'disabled' };
var storeKey = 'repo';
var UnleashClient = /** @class */ (function (_super) {
    __extends(UnleashClient, _super);
    function UnleashClient(_a) {
        var storageProvider = _a.storageProvider, url = _a.url, clientKey = _a.clientKey, _b = _a.refreshInterval, refreshInterval = _b === void 0 ? 30 : _b, _c = _a.metricsInterval, metricsInterval = _c === void 0 ? 30 : _c, _d = _a.disableMetrics, disableMetrics = _d === void 0 ? false : _d, _e = _a.environment, environment = _e === void 0 ? 'default' : _e, appName = _a.appName;
        var _this = _super.call(this) || this;
        _this.toggles = [];
        _this.etag = '';
        // Validations
        if (!url) {
            throw new Error('url is required');
        }
        if (!clientKey) {
            throw new Error('clientKey is required');
        }
        if (!appName) {
            throw new Error('appName is required.');
        }
        _this.url = new URL("" + url);
        _this.clientKey = clientKey;
        _this.storage = storageProvider || new storage_provider_local_1.default();
        _this.refreshInterval = refreshInterval * 1000;
        _this.context = { environment: environment, appName: appName };
        _this.toggles = _this.storage.get(storeKey) || [];
        _this.metrics = new metrics_1.default({
            appName: appName,
            metricsInterval: metricsInterval,
            disableMetrics: disableMetrics,
            url: url,
            clientKey: clientKey,
        });
        return _this;
    }
    UnleashClient.prototype.isEnabled = function (toggleName) {
        var toggle = this.toggles.find(function (t) { return t.name === toggleName; });
        var enabled = toggle ? toggle.enabled : false;
        this.metrics.count(toggleName, enabled);
        return enabled;
    };
    UnleashClient.prototype.getVariant = function (toggleName) {
        var toggle = this.toggles.find(function (t) { return t.name === toggleName; });
        if (toggle) {
            this.metrics.count(toggleName, true);
            return toggle.variant;
        }
        else {
            this.metrics.count(toggleName, false);
            return defaultVariant;
        }
    };
    UnleashClient.prototype.updateContext = function (context) {
        var staticContext = { environment: this.context.environment, appName: this.context.appName };
        this.context = __assign({}, staticContext, context);
        if (this.timerRef) {
            this.fetchToggles();
        }
    };
    UnleashClient.prototype.start = function () {
        return __awaiter(this, void 0, void 0, function () {
            var interval;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!fetch) return [3 /*break*/, 2];
                        this.stop();
                        interval = this.refreshInterval;
                        return [4 /*yield*/, this.fetchToggles()];
                    case 1:
                        _a.sent();
                        this.emit(exports.EVENTS.READY);
                        this.timerRef = setInterval(function () { return _this.fetchToggles(); }, interval);
                        return [3 /*break*/, 3];
                    case 2:
                        // tslint:disable-next-line
                        console.error('Unleash: Client does not support fetch.');
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    UnleashClient.prototype.stop = function () {
        if (this.timerRef) {
            clearInterval(this.timerRef);
            this.timerRef = undefined;
        }
    };
    UnleashClient.prototype.storeToggles = function (toggles) {
        this.toggles = toggles;
        this.emit(exports.EVENTS.UPDATE);
        this.storage.save(storeKey, toggles);
    };
    UnleashClient.prototype.fetchToggles = function () {
        return __awaiter(this, void 0, void 0, function () {
            var context_1, urlWithQuery_1, response, data, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!fetch) return [3 /*break*/, 6];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 5, , 6]);
                        context_1 = this.context;
                        urlWithQuery_1 = new URL(this.url.toString());
                        Object.keys(context_1).forEach(function (key) { return urlWithQuery_1.searchParams.append(key, context_1[key]); });
                        return [4 /*yield*/, fetch(urlWithQuery_1.toString(), {
                                cache: 'no-cache',
                                headers: {
                                    'Authorization': this.clientKey,
                                    'Accept': 'application/json',
                                    'Content-Type': 'application/json',
                                    'If-None-Match': this.etag,
                                },
                            })];
                    case 2:
                        response = _a.sent();
                        if (!(response.ok && response.status !== 304)) return [3 /*break*/, 4];
                        this.etag = response.headers.get('ETag') || '';
                        return [4 /*yield*/, response.json()];
                    case 3:
                        data = _a.sent();
                        this.storeToggles(data.toggles);
                        _a.label = 4;
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        e_1 = _a.sent();
                        // tslint:disable-next-line
                        console.error('Unleash: unable to fetch feature toggles', e_1);
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    return UnleashClient;
}(tiny_emitter_1.TinyEmitter));
exports.UnleashClient = UnleashClient;
//# sourceMappingURL=index.js.map