import { Request } from 'express';
import { RestgooseModel } from './restgoose-model';
import { MiddlewarePreFetch, MiddlewarePostFetch, MiddlewarePreSave  } from './types';
import { InstanceType } from './types';

type MiddlewarePrePost<T extends RestgooseModel> = MiddlewarePreFetch | MiddlewarePostFetch<T> | MiddlewarePreSave<T>;

/**
 * Compose several middlewares with a logical OR operation.
 * In case of a rejection (i.e. a throw or a returned null) from the previous middleware, the next is executed.
 * Otherwise, the returned value is passed through.
 * If all the middlewares are rejected, the error thrown from the last one will be passed through.
 */
export function or<T extends RestgooseModel>(...fns: MiddlewarePrePost<T>[]): MiddlewarePrePost<T> {
    return async (req: Request, entity: T = null, oldEntity?: T): Promise<T> => {
        /*let promises: Promise<InstanceType<T>> = Promise.reject(null);
        fns.forEach(fn => {
            promises = promises.then(
                v => v ? v : fn(req, entity, oldEntity),
                () => fn(req, entity, oldEntity),
            );
        });*/
        let lastError = null;

        for (let i=0; i< fns.length; ++i) {
            try {
                const out = (await fns[i](req, entity, oldEntity)) as T;
                return Promise.resolve(out);
            }
            catch (e) {
                lastError = e;
            }
        }

        throw lastError;
    };
}

/**
 * Compose several middlewares with a logical AND operation.
 * All middlewares must pass for the entity to be returned.
 * If any middleware is rejected, the error thrown is passed through.
 */
export function and<T extends RestgooseModel>(...fns: MiddlewarePrePost<T>[]): MiddlewarePrePost<T> {
    return ((req: Request, entity: InstanceType<T> = null, oldEntity?: InstanceType<T>): Promise<InstanceType<T>> => {
        let promises: Promise<any> = Promise.resolve(entity);
        fns.forEach(m => {
            promises = promises.then(entity => {
                return m(req, entity, oldEntity);
            });
        });
        return promises;
    }) as MiddlewarePrePost<T>;
}

/**
 * Converts a MiddlewarePostFetch function to a filtering one. It returns the entity if the function didn't throw, or
 * null if the function has thrown an error.
 * Use it  with the 'all' method so you can use one middleware for both getting all the items
 * (with asFilter) and getting only one (without it, throwing errors).
 */
export function asFilter<T extends RestgooseModel>(fn: MiddlewarePrePost<T>): MiddlewarePrePost<T> {
    return (req: Request, entity?: InstanceType<T>, oldEntity?: InstanceType<T>): Promise<InstanceType<T>> => {
        return Promise.resolve()
        .then(() => fn(req, entity, oldEntity))
        .catch(() => {
            return null;
        });
    };
}
