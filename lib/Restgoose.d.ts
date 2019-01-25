import { Response } from 'express';
import { InstanceType, Typegoose } from 'typegoose';
import { Constructor, RestRequest } from './types';
export declare class Restgoose {
    private static ROUTES;
    private static ROUTES_EMBED;
    static initialize(): any;
    /**
     * Simulates a REST call on the method one() and passes the result through the
     * postFetch middlewares.
     * NOTE : preFetch middlewares are NOT called
     */
    static getOne<T extends Typegoose>(modelType: Constructor<T>, req: RestRequest): Promise<any>;
    /**
     * Passes the entity through the preSend of its one() primivite
     */
    static sendOne<T extends Typegoose>(modelType: Constructor<T>, entity: InstanceType<T>, req: RestRequest, res: Response, status?: number): Promise<any>;
    /**
     * Simulates a REST call on the method all() and passes the result through the
     * postFetch middlewares.
     * NOTE : preFetch middlewares are NOT called
     */
    static getAll<T extends Typegoose>(modelType: Constructor<T>, req: RestRequest): Promise<any>;
    private static createRestRoot;
}
