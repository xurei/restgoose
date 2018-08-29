import { Request } from 'express';
import { Typegoose } from 'typegoose';
import { parseQuery } from './middlewares/parseQuery';
import { RestRegistry } from './RestRegistry';
import {
    Constructor,
    HttpMethod,
    MiddlewareFetch,
    MiddlewarePostFetch,
    MiddlewarePreFetch,
    RestMethodName,
} from './types';

export function rest<T extends Typegoose, E extends Constructor<T>>(config: RestConfiguration<T>) {
    return (target: E | T, propertyKey?: string) => {
        if (!propertyKey) {
            RestRegistry.registerModel(target as E, config);
        }
        else {
            RestRegistry.registerSubModel(target.constructor as Constructor<T>, propertyKey, config);
        }
    };
}

function defaultMethod<T extends Typegoose>(name: RestMethodName, path: string, config: RestConfigurationMethod<T>):
    RestConfigurationMethodWithPath<T> {

    return Object.assign({
        prefetch: [],
        postFetch: [],
        preSend: [],
    }, config, {
        path: path,
        method: name,
    }) as RestConfigurationMethodWithPath<T>;
}

export function all<T extends Typegoose>(config: RestConfigurationMethod<T> = {}) {
    config = Object.assign({}, config, {
        prefetch: [parseQuery].concat(config.preFetch || []),
    });
    return defaultMethod('all', '/', config);
}

export function one<T extends Typegoose>(config: RestConfigurationMethod<T> = {}) {
    return defaultMethod('one', '/:id', config);
}

export function create<T extends Typegoose>(config: RestConfigurationMethod<T> = {}) {
    return defaultMethod('create', '/', config);
}

export function update<T extends Typegoose>(config: RestConfigurationMethod<T> = {}) {
    return defaultMethod('update', '/:id', config);
}

export function remove<T extends Typegoose>(config: RestConfigurationMethod<T> = {}) {
    return defaultMethod('remove', '/:id', config);
}

export function removeAll<T extends Typegoose>(config: RestConfigurationMethod<T> = {}) {
    return defaultMethod('removeAll', '/', config);
}

export function custom<T extends Typegoose>(httpMethod: string, path: HttpMethod, config: RestConfigurationMethod<T> = {}) {
    return defaultMethod('custom', path, config);
}

/**
 * Converts a MiddlewarePostFetch function to a filtering one. It returns the entity if the function didn't throw, or
 * null if the function has thrown an error.
 * This is typically used for the 'all' method, allowing to use one function for both getting all the items
 * (with asFilter) and getting only one (without it, throwing errors)
 */
export function asFilter<T extends Typegoose>(fn: MiddlewarePostFetch<T>): MiddlewarePostFetch<T> {
    return <R extends Request>(req: R, entity: T): Promise<T> => {
        return Promise.resolve()
            .then(() => fn(req, entity))
            .catch(e => {
                return null;
            });
    };
}

export interface RestConfiguration<T extends Typegoose> {
    route: string;
    methods?: RestConfigurationMethodWithPath<T>[];
}

export interface RestConfigurationMethod<T extends Typegoose> {
    preFetch?: MiddlewarePreFetch[];
    fetch?: MiddlewareFetch<T>;
    postFetch?: MiddlewarePostFetch<T>[];
    preSend?: MiddlewarePostFetch<T>[];
}

export interface RestConfigurationMethodWithPath<T extends Typegoose> extends RestConfigurationMethod<T> {
    path: string;
    method: RestMethodName;
}

export class RestError extends Error {
    constructor(public httpCode: number, public errorData: any = {}) {
        super('RestError');
    }
}
