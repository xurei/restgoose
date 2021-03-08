import { Request } from 'express';
import { RestgooseModel } from './restgoose-model';
import { MiddlewarePostFetch, MiddlewarePreFetch, MiddlewarePreSave  } from './types';

type MiddlewarePrePost<T extends RestgooseModel> = MiddlewarePreFetch<T> | MiddlewarePostFetch<T> | MiddlewarePreSave<T>;

/**
 * Compose several middlewares with a logical OR operation.
 * In case of a rejection (i.e. a throw or a returned null) from the previous middleware, the next is executed.
 * Otherwise, the returned value is passed through.
 * If all the middlewares are rejected, the error thrown from the last one will be passed through.
 */
export function or<T extends RestgooseModel>(...fns: MiddlewarePrePost<T>[]): MiddlewarePrePost<T> {
    return async (req: Request, entity: T = null, oldEntity?: T): Promise<T> => {
        let lastError = null;

        for (const fn of fns) {
            try {
                const out = (await fn(req, entity, oldEntity)) as T;
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
    return ((req: Request, entity: T & Document = null, oldEntity?: T & Document): Promise<T & Document> => {
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
    return (req: Request, entity?: T & Document, oldEntity?: T & Document): Promise<T & Document> => {
        return Promise.resolve()
        .then(() => fn(req, entity, oldEntity))
        .catch(() => {
            return null;
        });
    };
}
