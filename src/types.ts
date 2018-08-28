import { Request, Response } from 'express';
import { Typegoose } from 'typegoose';

export type MiddlewarePreFetch = ((req: Request, res: Response, next: () => void) => void);
export type MiddlewarePostFetch<T extends Typegoose> = ((req: Request, entity: T) => Promise<T> | T);

export type HttpMethod = 'OPTIONS' | 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'TRACE' | 'CONNECT' | 'PATCH';

export type RestMethodName = 'all' | 'one' | 'create' | 'update' | 'remove' | 'removeAll' | 'custom';

export type RestRequest = Request & {
    filter?: object;
};
