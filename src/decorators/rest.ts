import { Request } from 'express';
import { Connection } from 'mongoose';
import { SchemaOptions } from 'mongoose';
import { RestRegistry } from '../rest-registry';
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
} from '../types';
import { RestgooseModel } from '../restgoose-model';

export function rest<T extends RestgooseModel>(config: RestConfiguration<T>) {
    return (target: T | Constructor<T>, propertyKey?: string) => {
        if (!propertyKey) {
            RestRegistry.registerModel(target as Constructor<T>, config);
        }
        else {
            RestRegistry.registerSubrest(target.constructor as Constructor<T>, propertyKey, config);
        }
    };
}

function defaultMethod<T extends RestgooseModel>(name: RestMethodName, path: string, config: RestConfigurationMethod<T>):
    RestConfigurationMethodWithPath<T> {

    return Object.assign({}, config, {
        path: path,
        method: name,
    }) as RestConfigurationMethodWithPath<T>;
}

export function all<T extends RestgooseModel>(config: RestConfigurationMethod<T> = {}) {
    return defaultMethod('all', '/', config);
}

export function one<T extends RestgooseModel>(config: RestConfigurationMethod<T> = {}) {
    return defaultMethod('one', '/:id', config);
}

export function create<T extends RestgooseModel>(config: RestConfigurationMethod<T> = {}) {
    return defaultMethod('create', '/', config);
}

export function update<T extends RestgooseModel>(config: RestConfigurationMethod<T> = {}) {
    return defaultMethod('update', '/:id', config);
}

export function remove<T extends RestgooseModel>(config: RestConfigurationMethod<T> = {}) {
    return defaultMethod('remove', '/:id', config);
}

export function removeAll<T extends RestgooseModel>(config: RestConfigurationMethod<T> = {}) {
    return defaultMethod('removeAll', '/', config);
}

export function custom<T extends RestgooseModel>(httpMethod: string, path: HttpMethod, config: RestConfigurationMethod<T> = {}) {
    return defaultMethod('custom', path, config);
}

export interface RestConfiguration<T extends RestgooseModel> {
    route: string;
    schemaOptions?: SchemaOptions;
    getConnection?: (req: Request) => Promise<Connection>;
    methods?: RestConfigurationMethodWithPath<T>[];
}

export interface RestConfigurationMethod<T extends RestgooseModel> {
    preFetch?: MiddlewarePreFetch;
    fetch?: MiddlewareFetch<T>;
    postFetch?: MiddlewarePostFetch<T>;
    preSave?: MiddlewarePreSave<T>;
    persist?: MiddlewarePersist<T>;
    preSend?: MiddlewarePreSend<T>;
}

export interface RestConfigurationMethodWithPath<T extends RestgooseModel> extends RestConfigurationMethod<T> {
    path: string;
    method: RestMethodName;
}

export class RestError extends Error {
    constructor(public httpCode: number, public errorData: any = {}) {
        super('RestError');
    }
}
