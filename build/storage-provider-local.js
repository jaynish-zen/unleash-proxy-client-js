"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var LocalStorageProvider = /** @class */ (function () {
    function LocalStorageProvider() {
        this.prefix = 'unleash:repository';
    }
    LocalStorageProvider.prototype.save = function (name, data) {
        try {
            var repo = JSON.stringify(data);
            var key = this.prefix + ":" + name;
            window.localStorage.setItem(key, repo);
        }
        catch (e) {
            // tslint:disable-next-line
            console.error(e);
        }
    };
    LocalStorageProvider.prototype.get = function (name) {
        try {
            var key = this.prefix + ":" + name;
            var data = window.localStorage.getItem(key);
            return data ? JSON.parse(data) : undefined;
        }
        catch (e) {
            // tslint:disable-next-line
            console.error(e);
        }
    };
    return LocalStorageProvider;
}());
exports.default = LocalStorageProvider;
//# sourceMappingURL=storage-provider-local.js.map