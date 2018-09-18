import { Request } from 'express';
import { InstanceType, Typegoose } from 'typegoose';
import { Middleware, MiddlewarePostFetch } from './types';

/**
 * Compose several middlewares with a logical OR operation.
 * In case of a rejection (i.e. a throw or a returned null) from the previous middleware, the next is executed.
 * Otherwise, the returned value is passed through.
 * If all the middlewares are rejected, the error thrown from the last one will be passed through.
 */
export function or<T extends Typegoose, F extends Middleware>(...fns: F[]): F {
    return ((req: Request, entity: T): Promise<InstanceType<T>> => {
        let promises: Promise<InstanceType<T>> = Promise.reject(null);
        fns.forEach(fn => {
            promises = promises.then(
                v => v ? v : fn(req, entity),
                () => fn(req, entity),
            );
        });
        return promises;
    }) as F;
}

/**
 * Compose several middlewares with a logical AND operation.
 * All middlewares must pass for the entity to be returned.
 * If any middleware is rejected, the error thrown is passed through.
 */
export function and<T extends Typegoose, F extends Middleware>(...fns: F[]): F {
    return ((req: Request, entity: T | boolean = true): Promise<InstanceType<T>> => {
        let promises: Promise<any> = Promise.resolve(entity);
        fns.forEach(m => {
            promises = promises.then(entity => {
                return entity && m(req, entity);
            });
        });
        return promises;
    }) as F;
}

/**
 * Converts a MiddlewarePostFetch function to a filtering one. It returns the entity if the function didn't throw, or
 * null if the function has thrown an error.
 * Use it  with the 'all' method so you can use one middleware for both getting all the items
 * (with asFilter) and getting only one (without it, throwing errors).
 */
export function asFilter<T extends Typegoose>(fn: MiddlewarePostFetch<T>): MiddlewarePostFetch<T> {
    return (req: Request, entity: T): Promise<InstanceType<T>> => {
        return Promise.resolve()
        .then(() => fn(req, entity))
        .catch(() => {
            return null;
        });
    };
}
