import { Request } from 'express';
import { InstanceType, Typegoose } from 'typegoose';

export interface Constructor<T> {
    new(...args: any[]): T;
}

export type Promisable<T> = T | Promise<T>;
export type Middleware = (req: Request, ...args: any[]) => Promisable<any>;

export interface MiddlewarePreFetch extends Middleware {
    (req: Request): Promise<boolean>;
}

export type MiddlewareFetchOne<T extends Typegoose> = (req: Request) => Promise<InstanceType<T>>;
export type MiddlewareFetchAll<T extends Typegoose> = (req: Request) => Promise<InstanceType<T>[]>;
export type MiddlewareFetch<T extends Typegoose> = MiddlewareFetchOne<T> | MiddlewareFetchAll<T>;

export interface MiddlewarePostFetch<T extends Typegoose> extends Middleware {
    (req: Request, entity: T): Promisable<T>;
}

export interface MiddlewarePreSave<T extends Typegoose> extends Middleware {
    (req: Request, oldEntity: T, newEntity: T): Promisable<T>;
}

export type MiddlewarePersistDeleteAll<T extends Typegoose> = (entities: InstanceType<T>[]) => Promise<boolean>;
export type MiddlewarePersistDeleteOne<T extends Typegoose> = (entity: InstanceType<T>) => Promise<boolean>;
export type MiddlewarePersistSave<T extends Typegoose> = (entity: InstanceType<T>) => Promise<InstanceType<T>>;
export type MiddlewarePersist<T extends Typegoose> = MiddlewarePersistDeleteAll<T> | MiddlewarePersistDeleteOne<T> | MiddlewarePersistSave<T>;

export interface MiddlewarePreSend<T extends Typegoose> extends Middleware {
    (req: Request, entity: T): Promisable<T>;
}

export type HttpMethod = 'OPTIONS' | 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'TRACE' | 'CONNECT' | 'PATCH';

export type RestMethodName = 'all' | 'one' | 'create' | 'update' | 'remove' | 'removeAll' | 'custom';

export type RestRequest = Request & {
    filter?: object;
};
