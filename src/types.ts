import { Request } from 'express';
import { RestgooseModel } from './restgoose-model';

export type Constructor<T> = new(...args: any[]) => T;
export interface Dic {
    [key: string]: any;
}
export type CallbackFn = (err?: Error) => void;

export type MiddlewarePreSave<T extends RestgooseModel> = (req: Request, entity: T, oldEntity?: T) => Promise<T>;
export type MiddlewarePostFetch<T extends RestgooseModel> = MiddlewarePreSave<T> | ((req: Request, entity: T) => Promise<T>);
export type MiddlewarePreFetch<T extends RestgooseModel> = MiddlewarePostFetch<T> | ((req: Request) => Promise<RestgooseModel>);

export type MiddlewareFetch<T extends RestgooseModel> = (req: Request, modelType: Constructor<T>, useFilter: boolean) => Promise<T | T[]>;

export type MiddlewarePersistDeleteAll<T extends RestgooseModel> = (req: Request, entities: T[]) => Promise<boolean>;
export type MiddlewarePersistDeleteOne<T extends RestgooseModel> = (req: Request, entity: T) => Promise<boolean>;
export type MiddlewarePersistSave<T extends RestgooseModel> = (req: Request, entity: T, oldEntity?: T) => Promise<T>;
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
