import { Request } from 'express';
import { Connection, Model } from 'mongoose';
import { Typegoose } from 'typegoose';
import { RestRegistry } from './RestRegistry';
import {
    Constructor,
    HttpMethod,
    MiddlewareFetch,
    MiddlewarePersist,
    MiddlewarePostFetch,
    MiddlewarePreFetch,
    MiddlewarePreSave,
    MiddlewarePreSend,
    RestMethodName,
} from './types';

export function rest<T extends Typegoose>(config: RestConfiguration<T>) {
    return (target: T | Constructor<T>, propertyKey?: string) => {
        if (!propertyKey) {
            target = target as Constructor<T>;
            RestRegistry.registerModel(target, config);
        }
        else {
            target = target as T;
            RestRegistry.registerSubModel(target.constructor as Constructor<T>, propertyKey, config);
        }
    };
}

function defaultMethod<T extends Typegoose>(name: RestMethodName, path: string, config: RestConfigurationMethod<T>):
    RestConfigurationMethodWithPath<T> {

    return Object.assign({}, config, {
        path: path,
        method: name,
    }) as RestConfigurationMethodWithPath<T>;
}

export function all<T extends Typegoose>(config: RestConfigurationMethod<T> = {}) {
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

export interface RestConfiguration<T extends Typegoose> {
    route: string;
    getConnection?: (req: Request) => Promise<Connection>;
    methods?: RestConfigurationMethodWithPath<T>[];
}

export interface RestConfigurationMethod<T extends Typegoose> {
    preFetch?: MiddlewarePreFetch;
    fetch?: MiddlewareFetch<T>;
    postFetch?: MiddlewarePostFetch<T>;
    preSave?: MiddlewarePreSave<T>;
    persist?: MiddlewarePersist<T>;
    preSend?: MiddlewarePreSend<T>;
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
