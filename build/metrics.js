"use strict";
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
var Metrics = /** @class */ (function () {
    function Metrics(_a) {
        var appName = _a.appName, metricsInterval = _a.metricsInterval, _b = _a.disableMetrics, disableMetrics = _b === void 0 ? false : _b, url = _a.url, clientKey = _a.clientKey;
        this.disabled = disableMetrics;
        this.metricsInterval = metricsInterval * 1000;
        this.appName = appName;
        this.url = url;
        this.started = new Date();
        this.clientKey = clientKey;
        this.resetBucket();
        if (typeof this.metricsInterval === 'number' && this.metricsInterval > 0) {
            // send first metrics after two seconds.
            this.startTimer(2000);
        }
    }
    Metrics.prototype.stop = function () {
        if (this.timer) {
            clearTimeout(this.timer);
            delete this.timer;
        }
        this.disabled = true;
    };
    Metrics.prototype.sendMetrics = function () {
        return __awaiter(this, void 0, void 0, function () {
            var url, payload;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        /* istanbul ignore next if */
                        if (this.disabled) {
                            return [2 /*return*/, false];
                        }
                        if (this.bucketIsEmpty()) {
                            this.resetBucket();
                            this.startTimer();
                            return [2 /*return*/, true];
                        }
                        url = this.url + "/client/metrics";
                        payload = this.getPayload();
                        return [4 /*yield*/, fetch(url, {
                                cache: 'no-cache',
                                method: 'POST',
                                headers: {
                                    'Authorization': this.clientKey,
                                    'Accept': 'application/json',
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify(payload),
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, true];
                }
            });
        });
    };
    Metrics.prototype.count = function (name, enabled) {
        if (this.disabled || !this.bucket) {
            return false;
        }
        this.assertBucket(name);
        this.bucket.toggles[name][enabled ? 'yes' : 'no']++;
        return true;
    };
    Metrics.prototype.assertBucket = function (name) {
        if (this.disabled || !this.bucket) {
            return false;
        }
        if (!this.bucket.toggles[name]) {
            this.bucket.toggles[name] = {
                yes: 0,
                no: 0,
            };
        }
    };
    Metrics.prototype.startTimer = function (timeout) {
        var _this = this;
        if (this.disabled) {
            return false;
        }
        this.timer = setTimeout(function () {
            _this.sendMetrics();
        }, timeout || this.metricsInterval);
        return true;
    };
    Metrics.prototype.bucketIsEmpty = function () {
        if (!this.bucket) {
            return false;
        }
        return Object.keys(this.bucket.toggles).length === 0;
    };
    Metrics.prototype.resetBucket = function () {
        var bucket = {
            start: new Date(),
            stop: null,
            toggles: {},
        };
        this.bucket = bucket;
    };
    Metrics.prototype.closeBucket = function () {
        if (this.bucket) {
            this.bucket.stop = new Date();
        }
    };
    Metrics.prototype.getPayload = function () {
        this.closeBucket();
        var payload = this.getMetricsData();
        this.resetBucket();
        return payload;
    };
    Metrics.prototype.getMetricsData = function () {
        return {
            appName: this.appName,
            instanceId: 'browser',
            bucket: this.bucket,
        };
    };
    return Metrics;
}());
exports.default = Metrics;
//# sourceMappingURL=metrics.js.map