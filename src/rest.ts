import { Request, Response } from 'express';
import { MongooseDocument } from 'mongoose';
import { Typegoose } from 'typegoose';
import { parseQuery } from './middlewares/parseQuery';
import { RestRegistry } from './RestRegistry';

export declare interface TypegooseConstructor<T extends Typegoose> {
    new(...args: any[]): T;
}

export function rest<T extends Typegoose, E extends TypegooseConstructor<T>>(config: RestConfiguration<T>) {
    return (target: E | T, propertyKey?: string) => {
        if (!propertyKey) {
            RestRegistry.registerModel((target as E), config);
        }
        else {
            RestRegistry.registerSubModel((target.constructor) as TypegooseConstructor<T>, propertyKey, config);
        }
    };
}

function defaultMethod<T extends Typegoose>(name: MethodName, path: string, preFetch?: MiddlewarePreFetch[],
                                            postFetch?: MiddlewarePostFetch<T>[]) {
    return {
        method: name,
        path: path,
        preFetch: preFetch,
        postFetch: postFetch,
    };
}

export function all<T extends Typegoose>(preFetch?: MiddlewarePreFetch[], postFetch?: MiddlewarePostFetch<T>[]) {
    return defaultMethod('all', '/', [parseQuery].concat(preFetch || []), postFetch);
}

export function one<T extends Typegoose>(preFetch?: MiddlewarePreFetch[], postFetch?: MiddlewarePostFetch<T>[]) {
    return defaultMethod('one', '/:id', preFetch, postFetch);
}

export function create<T extends Typegoose>(preFetch?: MiddlewarePreFetch[], postFetch?: MiddlewarePostFetch<T>[]) {
    return defaultMethod('create', '/', preFetch, postFetch);
}

export function update<T extends Typegoose>(preFetch?: MiddlewarePreFetch[], postFetch?: MiddlewarePostFetch<T>[]) {
    return defaultMethod('update', '/:id', preFetch, postFetch);
}

export function remove<T extends Typegoose>(preFetch?: MiddlewarePreFetch[], postFetch?: MiddlewarePostFetch<T>[]) {
    return defaultMethod('remove', '/:id', preFetch, postFetch);
}

export function removeAll<T extends Typegoose>(preFetch?: MiddlewarePreFetch[], postFetch?: MiddlewarePostFetch<T>[]) {
    return defaultMethod('removeAll', '/', preFetch, postFetch);
}

export function custom<T extends Typegoose>(path: string, preFetch?: MiddlewarePreFetch[], postFetch?: MiddlewarePostFetch<T>[]) {
    return defaultMethod('custom', path, preFetch, postFetch);
}

/**
 * Converts a MiddlewarePostFetch function to a filtering one. It returns the entity if the function didn't throw, or
 * null if the function as thrown an error.
 * This is typically used for the 'all' method, allowing to filter the fetched entities instead of returning an error
 * on the http
 */
export function asFilter<T extends Typegoose>(fn: MiddlewarePostFetch<T>): MiddlewarePostFetch<T> {
    return <R extends Request>(req: R, entity: T): Promise<T> => {
        return Promise.resolve()
            .then(() => fn(req, entity))
            .catch(e => {
                return null;
            });
    };
}

export interface RestConfiguration<T extends Typegoose> {
    route: string;
    methods?: RestConfigurationMethod<T>[];
}

export declare type MiddlewarePreFetch = (<R extends Request, P extends Response>(req: R, res: P, next: () => void) => void);
export declare type MiddlewarePostFetch<T extends Typegoose> = (<R extends Request>(req: R, entity: T) => Promise<T> | T);

export interface RestConfigurationMethod<T extends Typegoose> {
    method: MethodName;
    preFetch?: MiddlewarePreFetch[];
    postFetch?: MiddlewarePostFetch<T>[];
}

export type MethodName = 'all' | 'one' | 'create' | 'update' | 'remove' | 'removeAll' | 'custom';

export class RestError extends Error {
    constructor(public httpCode: number, public errorData: any = {}) {
        super('RestError');
    }
}
