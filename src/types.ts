import { Request } from 'express';
import { Model, MongooseDocument } from 'mongoose';
import * as mongoose from 'mongoose';
import { RestgooseModel } from './restgoose-model';

export type InstanceType<T> = T & mongoose.Document;
export type Constructor<T> = new(...args: any[]) => T;
export interface Dic {
    [key: string]: any;
}
export type CallbackFn = (err?: Error) => void;

export type RestgooseDocument<T extends RestgooseModel> = T & MongooseDocument;

export type Promisable<T> = T | Promise<T>;
export type Middleware = (req: Request, ...args: any[]) => Promisable<any>;
export type Doc<T> = T | InstanceType<T>;

export interface MiddlewarePreFetch extends Middleware {
    (req: Request): Promise<boolean>;
}

export type MiddlewareFetch<T extends RestgooseModel> = (req: Request, modelType?: Model<InstanceType<T>>) => Promise<Doc<T> | Doc<T>[]>;

export interface MiddlewarePostFetch<T extends RestgooseModel> extends Middleware {
    (req: Request, entity: Doc<T>): Promisable<Doc<T>>;
}

export interface MiddlewarePreSave<T extends RestgooseModel> extends Middleware {
    (req: Request, entity: Doc<T>, oldEntity?: Doc<T>): Promisable<Doc<T>>;
}

export type MiddlewarePersistDeleteAll<T extends RestgooseModel> = (entities: Doc<T>[]) => Promise<boolean>;
export type MiddlewarePersistDeleteOne<T extends RestgooseModel> = (entity: Doc<T>) => Promise<boolean>;
export type MiddlewarePersistSave<T extends RestgooseModel> = (entity: Doc<T>) => Promise<Doc<T>>;
export type MiddlewarePersist<T extends RestgooseModel> = MiddlewarePersistDeleteAll<T> | MiddlewarePersistDeleteOne<T> | MiddlewarePersistSave<T>;

export interface MiddlewarePreSend<T extends RestgooseModel> extends Middleware {
    (req: Request, entity: Doc<T>): Promisable<Doc<T>>;
}

export type HttpMethod = 'OPTIONS' | 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'TRACE' | 'CONNECT' | 'PATCH';

export type RestMethodName = 'all' | 'one' | 'create' | 'update' | 'remove' | 'removeAll' | 'custom';

export type RestRequest = Request & {
    restgoose?: {
        query?: Dic;
        projection?: Dic;
        options?: Dic;
    };
};
