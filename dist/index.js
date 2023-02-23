"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorLabel = void 0;
var process_1 = __importDefault(require("process"));
var path_1 = __importDefault(require("path"));
var fs_1 = __importDefault(require("fs"));
exports.errorLabel = '[ERROR] express-automatic-routes:';
var validMethods = [
    'checkout',
    'copy',
    'delete',
    'get',
    'head',
    'lock',
    'merge',
    'mkactivity',
    'mkcol',
    'move',
    'm-search',
    'notify',
    'options',
    'patch',
    'post',
    'purge',
    'put',
    'report',
    'search',
    'subscribe',
    'trace',
    'unlock',
    'unsubscribe',
];
// Global config options, so we don't need to pass around these settings across recursive functions
var configOptions = {
    mount: '',
};
function scan(express, baseDir, current, log) {
    if (log === void 0) { log = false; }
    var combined = path_1.default.join(baseDir, current);
    var combinedStat = fs_1.default.statSync(combined);
    if (combinedStat.isDirectory()) {
        for (var _i = 0, _a = fs_1.default.readdirSync(combined); _i < _a.length; _i++) {
            var entry = _a[_i];
            scan(express, baseDir, path_1.default.join(current, entry), log);
        }
    }
    else if (isAcceptableFile(combined, combinedStat)) {
        autoload(express, combined, pathToUrl(current), log);
    }
}
function isAcceptableFile(file, stat) {
    return ((file.endsWith('.js') || file.endsWith('.ts')) &&
        !path_1.default.basename(file).startsWith('.') &&
        !path_1.default.basename(file).startsWith('_') &&
        !file.endsWith('.map') &&
        !file.endsWith('.test.js') &&
        !file.endsWith('.test.ts') &&
        stat.isFile());
}
function pathToUrl(filePath) {
    var url = '/' + filePath.replace('.ts', '').replace('.js', '').replace('index', '');
    if (url.length === 1)
        return url;
    return url
        .split(path_1.default.sep)
        .map(function (part) { return replaceParamsToken(part); })
        .join('/');
}
function replaceParamsToken(token) {
    var regex = /{.+}/g;
    var result;
    while ((result = regex.exec(token)) !== null) {
        token =
            token.substring(0, result.index) +
                result[0].replace('{', ':').replace('}', '') +
                token.substr(result.index + result[0].length);
    }
    return token;
}
function autoload(express, fullPath, url, log) {
    var module = loadModule(fullPath, log);
    if (typeof module !== 'function') {
        throw new Error("".concat(exports.errorLabel, " module ").concat(fullPath, " must be valid js/ts module and should export route methods definitions"));
    }
    var routes = module(express);
    var middleware = undefined;
    if (routes.middleware) {
        middleware = routes.middleware;
    }
    for (var _i = 0, _a = Object.entries(routes); _i < _a.length; _i++) {
        var _b = _a[_i], method = _b[0], route = _b[1];
        if (validMethods.includes(method)) {
            // Prepend the mount configuration to the url
            var endpointUrl = configOptions.mount + url;
            //@ts-ignore
            express[method].apply(express, __spreadArray([endpointUrl], extract(middleware, route), false));
            if (log) {
                console.info("".concat(method.toUpperCase(), " ").concat(url, " => ").concat(fullPath));
            }
        }
    }
}
function loadModule(path, log) {
    var module = require(path);
    if (typeof module === 'function') {
        return module;
    }
    if (typeof module === 'object' && 'default' in module) {
        return module.default;
    }
    return;
}
function extract(middleware, routeOptions) {
    var routeMiddleware = middleware === undefined
        ? []
        : Array.isArray(middleware)
            ? middleware
            : [middleware];
    if (typeof routeOptions === 'function') {
        return __spreadArray(__spreadArray([], routeMiddleware, true), [routeOptions], false);
    }
    else {
        routeOptions.middleware =
            routeOptions.middleware === undefined ? [] : routeOptions.middleware;
        if (Array.isArray(routeOptions.middleware)) {
            return __spreadArray(__spreadArray(__spreadArray([], routeMiddleware, true), routeOptions.middleware, true), [
                routeOptions.handler,
            ], false);
        }
        else {
            return __spreadArray(__spreadArray([], routeMiddleware, true), [routeOptions.middleware, routeOptions.handler], false);
        }
    }
}
function default_1(express, options) {
    var _a, _b;
    var log = (_a = options.log) !== null && _a !== void 0 ? _a : true;
    if (!express) {
        var message = "".concat(exports.errorLabel, " express application must be passed");
        log && console.log(message);
        throw new Error(message);
    }
    if (!options.dir) {
        var message = "".concat(exports.errorLabel, " dir must be specified");
        log && console.error(message);
        throw new Error(message);
    }
    if (typeof options.dir !== 'string') {
        var message = "".concat(exports.errorLabel, " dir must be the path of autoroutes-directory");
        log && console.error(message);
        throw new Error(message);
    }
    var dirPath;
    if (path_1.default.isAbsolute(options.dir)) {
        dirPath = options.dir;
    }
    else if (path_1.default.isAbsolute(process_1.default.argv[1])) {
        dirPath = path_1.default.join(process_1.default.argv[1], '..', options.dir);
    }
    else {
        dirPath = path_1.default.join(process_1.default.cwd(), process_1.default.argv[1], '..', options.dir);
    }
    if (!fs_1.default.existsSync(dirPath)) {
        var message = "".concat(exports.errorLabel, " dir ").concat(dirPath, " does not exists");
        log && console.error(message);
        throw new Error(message);
    }
    if (!fs_1.default.statSync(dirPath).isDirectory()) {
        var message = "".concat(exports.errorLabel, " dir ").concat(dirPath, " must be a directory");
        log && console.error(message);
        throw new Error(message);
    }
    // Save the mount option in the global config variable, so we don't need to pass it through scan and other recursive function calls
    configOptions.mount = (_b = options.mount) !== null && _b !== void 0 ? _b : '';
    try {
        scan(express, dirPath, '', options.log);
    }
    catch (error) {
        if (log) {
            if (error instanceof Error) {
                console.error(error.message);
            }
            else {
                console.error(error);
            }
        }
        throw error;
    }
}
exports.default = default_1;
//# sourceMappingURL=index.js.map