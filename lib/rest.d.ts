/// <reference types="mongoose" />
/// <reference types="express" />
import { Request } from 'express';
import { Connection } from 'mongoose';
import { Typegoose } from 'typegoose';
import { SchemaOptions } from 'mongoose';
import { Constructor, HttpMethod, MiddlewareFetch, MiddlewarePersist, MiddlewarePostFetch, MiddlewarePreFetch, MiddlewarePreSave, MiddlewarePreSend, RestMethodName } from './types';
export declare function rest<T extends Typegoose>(config: RestConfiguration<T>): (target: T | Constructor<T>, propertyKey?: string) => void;
export declare function all<T extends Typegoose>(config?: RestConfigurationMethod<T>): RestConfigurationMethodWithPath<T>;
export declare function one<T extends Typegoose>(config?: RestConfigurationMethod<T>): RestConfigurationMethodWithPath<T>;
export declare function create<T extends Typegoose>(config?: RestConfigurationMethod<T>): RestConfigurationMethodWithPath<T>;
export declare function update<T extends Typegoose>(config?: RestConfigurationMethod<T>): RestConfigurationMethodWithPath<T>;
export declare function remove<T extends Typegoose>(config?: RestConfigurationMethod<T>): RestConfigurationMethodWithPath<T>;
export declare function removeAll<T extends Typegoose>(config?: RestConfigurationMethod<T>): RestConfigurationMethodWithPath<T>;
export declare function custom<T extends Typegoose>(httpMethod: string, path: HttpMethod, config?: RestConfigurationMethod<T>): RestConfigurationMethodWithPath<T>;
export interface RestConfiguration<T extends Typegoose> {
    route: string;
    schemaOptions?: SchemaOptions;
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
export declare class RestError extends Error {
    httpCode: number;
    errorData: any;
    constructor(httpCode: number, errorData?: any);
}
