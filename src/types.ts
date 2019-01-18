import { Request } from 'express';
import { Model } from 'mongoose';
import { InstanceType, Typegoose } from 'typegoose';

export type Constructor<T> = new(...args: any[]) => T;

export type Promisable<T> = T | Promise<T>;
export type Middleware = (req: Request, ...args: any[]) => Promisable<any>;
export type Doc<T> = T | InstanceType<T>;

export interface MiddlewarePreFetch extends Middleware {
    (req: Request): Promise<boolean>;
}

export type MiddlewareFetch<T extends Typegoose> = (req: Request, modelType?: Model<InstanceType<T>>) => Promise<Doc<T> | Doc<T>[]>;

export interface MiddlewarePostFetch<T extends Typegoose> extends Middleware {
    (req: Request, entity: Doc<T>): Promisable<Doc<T>>;
}

export interface MiddlewarePreSave<T extends Typegoose> extends Middleware {
    (req: Request, entity: Doc<T>, oldEntity?: Doc<T>): Promisable<Doc<T>>;
}

export type MiddlewarePersistDeleteAll<T extends Typegoose> = (entities: Doc<T>[]) => Promise<boolean>;
export type MiddlewarePersistDeleteOne<T extends Typegoose> = (entity: Doc<T>) => Promise<boolean>;
export type MiddlewarePersistSave<T extends Typegoose> = (entity: Doc<T>) => Promise<Doc<T>>;
export type MiddlewarePersist<T extends Typegoose> = MiddlewarePersistDeleteAll<T> | MiddlewarePersistDeleteOne<T> | MiddlewarePersistSave<T>;

export interface MiddlewarePreSend<T extends Typegoose> extends Middleware {
    (req: Request, entity: Doc<T>): Promisable<Doc<T>>;
}

export type HttpMethod = 'OPTIONS' | 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'TRACE' | 'CONNECT' | 'PATCH';

export type RestMethodName = 'all' | 'one' | 'create' | 'update' | 'remove' | 'removeAll' | 'custom';

export type RestRequest = Request & {
    filter?: object;
};
