"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Compose several middlewares with a logical OR operation.
 * In case of a rejection (i.e. a throw or a returned null) from the previous middleware, the next is executed.
 * Otherwise, the returned value is passed through.
 * If all the middlewares are rejected, the error thrown from the last one will be passed through.
 */
function or(...fns) {
    return ((req, entity) => {
        let promises = Promise.reject(null);
        fns.forEach(fn => {
            promises = promises.then(v => v ? v : fn(req, entity), () => fn(req, entity));
        });
        return promises;
    });
}
exports.or = or;
/**
 * Compose several middlewares with a logical AND operation.
 * All middlewares must pass for the entity to be returned.
 * If any middleware is rejected, the error thrown is passed through.
 */
function and(...fns) {
    return ((req, entity = true) => {
        let promises = Promise.resolve(entity);
        fns.forEach(m => {
            promises = promises.then(entity => {
                return entity && m(req, entity);
            });
        });
        return promises;
    });
}
exports.and = and;
/**
 * Converts a MiddlewarePostFetch function to a filtering one. It returns the entity if the function didn't throw, or
 * null if the function has thrown an error.
 * Use it  with the 'all' method so you can use one middleware for both getting all the items
 * (with asFilter) and getting only one (without it, throwing errors).
 */
function asFilter(fn) {
    return (req, entity) => {
        return Promise.resolve()
            .then(() => fn(req, entity))
            .catch(() => {
            return null;
        });
    };
}
exports.asFilter = asFilter;
//# sourceMappingURL=middleware-composers.js.map