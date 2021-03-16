import { RestgooseModel } from './restgoose-model';
import { Constructor, RestRequest } from './types';

export interface RestgooseConnector {
    findOne: <T extends RestgooseModel> (modelType: Constructor<T>, req: RestRequest, useFilter: boolean) => Promise<T>;
    find: <T extends RestgooseModel> (modelType: Constructor<T>, req: RestRequest) => Promise<T[]>;
    deleteOne: <T extends RestgooseModel> (modelType: Constructor<T>, entity: T) => Promise<boolean>;
    delete: <T extends RestgooseModel> (modelType: Constructor<T>, entities: T[]) => Promise<boolean>;
    create: <T extends RestgooseModel> (modelType: Constructor<T>, req: RestRequest) => Promise<T>;
    save: <T extends RestgooseModel> (modelType: Constructor<T>, entity: T) => Promise<T>;
}
