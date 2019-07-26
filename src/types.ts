import { Request } from 'express';
import { Document, Model } from 'mongoose';
import { RestgooseModel } from './restgoose-model';

export type Constructor<T> = new(...args: any[]) => T;
export interface Dic {
    [key: string]: any;
}
export type CallbackFn = (err?: Error) => void;

export type RestgooseDocument<T extends RestgooseModel> = T & Document;

export type MiddlewarePreFetch = (req: Request) => Promise<RestgooseModel> | RestgooseModel;
export type MiddlewarePostFetch<T extends RestgooseModel> = (req: Request, entity: T) => Promise<T> | T;
export type MiddlewarePreSave<T extends RestgooseModel> = (req: Request, entity: T, oldEntity?: T) => Promise<T> | T;

export type MiddlewareFetch<T extends RestgooseModel> = (req: Request, modelType?: Model<T & Document>) => Promise<T | T[]>;

export type MiddlewarePersistDeleteAll<T extends RestgooseModel> = (req: Request, entities: T[]) => Promise<boolean>;
export type MiddlewarePersistDeleteOne<T extends RestgooseModel> = (req: Request, entity: T) => Promise<boolean>;
export type MiddlewarePersistSave<T extends RestgooseModel> = (req: Request, entity: T) => Promise<T>;
export type MiddlewarePersist<T extends RestgooseModel> = MiddlewarePersistDeleteAll<T> | MiddlewarePersistDeleteOne<T> | MiddlewarePersistSave<T>;

export type HttpMethod = 'OPTIONS' | 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'TRACE' | 'CONNECT' | 'PATCH';

export type RestMethodName = 'all' | 'one' | 'create' | 'update' | 'remove' | 'removeAll' | 'custom';

export type RestRequest = Request & {
    restgoose?: {
        query?: Dic;
        projection?: Dic;
        options?: Dic;
    };
};
