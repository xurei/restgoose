/// <reference types="express" />
/// <reference types="mongoose" />
import { Request } from 'express';
import { Model } from 'mongoose';
import { InstanceType, Typegoose } from 'typegoose';
export interface Constructor<T> {
    new (...args: any[]): T;
}
export declare type Promisable<T> = T | Promise<T>;
export declare type Middleware = (req: Request, ...args: any[]) => Promisable<any>;
export declare type Doc<T> = T | InstanceType<T>;
export interface MiddlewarePreFetch extends Middleware {
    (req: Request): Promise<boolean>;
}
export declare type MiddlewareFetch<T extends Typegoose> = (req: Request, modelType?: Model<InstanceType<T>>) => Promise<Doc<T> | Doc<T>[]>;
export interface MiddlewarePostFetch<T extends Typegoose> extends Middleware {
    (req: Request, entity: Doc<T>): Promisable<Doc<T>>;
}
export interface MiddlewarePreSave<T extends Typegoose> extends Middleware {
    (req: Request, entity: Doc<T>, oldEntity?: Doc<T>): Promisable<Doc<T>>;
}
export declare type MiddlewarePersistDeleteAll<T extends Typegoose> = (entities: Doc<T>[]) => Promise<boolean>;
export declare type MiddlewarePersistDeleteOne<T extends Typegoose> = (entity: Doc<T>) => Promise<boolean>;
export declare type MiddlewarePersistSave<T extends Typegoose> = (entity: Doc<T>) => Promise<Doc<T>>;
export declare type MiddlewarePersist<T extends Typegoose> = MiddlewarePersistDeleteAll<T> | MiddlewarePersistDeleteOne<T> | MiddlewarePersistSave<T>;
export interface MiddlewarePreSend<T extends Typegoose> extends Middleware {
    (req: Request, entity: Doc<T>): Promisable<Doc<T>>;
}
export declare type HttpMethod = 'OPTIONS' | 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'TRACE' | 'CONNECT' | 'PATCH';
export declare type RestMethodName = 'all' | 'one' | 'create' | 'update' | 'remove' | 'removeAll' | 'custom';
export declare type RestRequest = Request & {
    filter?: object;
};
