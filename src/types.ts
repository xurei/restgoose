import { Request, Response } from 'express';
import { Query } from 'mongoose';
import { InstanceType, Typegoose } from 'typegoose';

export interface Constructor<T> {
    new(...args: any[]): T;
}

export type MiddlewarePreFetchExpress = ((req: Request, res: Response, next: () => void) => void);
export type MiddlewarePreFetchPromise = ((req: Request) => Promise<void>);
export type MiddlewarePreFetch = MiddlewarePreFetchExpress | MiddlewarePreFetchPromise;
export type MiddlewareBuildQuery<T extends Typegoose> = (req: Request) => Promise<Query<InstanceType<T>>> | Query<InstanceType<T>>;
export type MiddlewarePostFetch<T extends Typegoose> = (req: Request, entity: T) => Promise<T> | T;

export type HttpMethod = 'OPTIONS' | 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'TRACE' | 'CONNECT' | 'PATCH';

export type RestMethodName = 'all' | 'one' | 'create' | 'update' | 'remove' | 'removeAll' | 'custom';

export type RestRequest = Request & {
    filter?: object;
};
