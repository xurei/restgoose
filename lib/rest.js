"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RestRegistry_1 = require("./RestRegistry");
function rest(config) {
    return (target, propertyKey) => {
        if (!propertyKey) {
            RestRegistry_1.RestRegistry.registerModel(target, config);
        }
        else {
            RestRegistry_1.RestRegistry.registerSubModel(target.constructor, propertyKey, config);
        }
    };
}
exports.rest = rest;
function defaultMethod(name, path, config) {
    return Object.assign({}, config, {
        path: path,
        method: name,
    });
}
function all(config = {}) {
    return defaultMethod('all', '/', config);
}
exports.all = all;
function one(config = {}) {
    return defaultMethod('one', '/:id', config);
}
exports.one = one;
function create(config = {}) {
    return defaultMethod('create', '/', config);
}
exports.create = create;
function update(config = {}) {
    return defaultMethod('update', '/:id', config);
}
exports.update = update;
function remove(config = {}) {
    return defaultMethod('remove', '/:id', config);
}
exports.remove = remove;
function removeAll(config = {}) {
    return defaultMethod('removeAll', '/', config);
}
exports.removeAll = removeAll;
function custom(httpMethod, path, config = {}) {
    return defaultMethod('custom', path, config);
}
exports.custom = custom;
class RestError extends Error {
    constructor(httpCode, errorData = {}) {
        super('RestError');
        this.httpCode = httpCode;
        this.errorData = errorData;
    }
}
exports.RestError = RestError;
//# sourceMappingURL=rest.js.map