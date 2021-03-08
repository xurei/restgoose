//import { Document, Model } from 'mongoose';
import { RestConfigurationMethod } from './decorators/rest';
import { RestModelEntry } from './rest-registry';
import { Restgoose, restgooseConnector } from './restgoose';
import { RestgooseModel } from './restgoose-model';
import {
    Constructor,
    MiddlewarePersistDeleteAll,
    MiddlewarePersistDeleteOne,
    MiddlewarePersistSave,
    RestRequest,
} from './types';

export async function preFetch<T extends RestgooseModel>(methodConfig: RestConfigurationMethod<T>, req: RestRequest):
    Promise<any> {

    return methodConfig.preFetch ?
        await methodConfig.preFetch(req, null) :
        null;
}

export async function fetchAll<T extends RestgooseModel>(modelType: Constructor<T>, methodConfig: RestConfigurationMethod<T>, req: RestRequest):
Promise<(T)[]> {
    // TODO: getAll() remove req.filter from the default behaviour ?
    const query = (
        methodConfig.fetch ?
            methodConfig.fetch(req, modelType, true) :
            await Restgoose.connector.find(modelType, req)
    ) as Promise<(T)[]>;

    return Promise.resolve(await query || []);
}

export async function fetchCreate<T extends RestgooseModel>(modelType: Constructor<T>, methodConfig: RestConfigurationMethod<T>, req: RestRequest): Promise<T> {
    if (methodConfig.fetch) {
        return methodConfig.fetch(req, modelType, true) as Promise<T>;
    }
    else {
        return restgooseConnector.create(modelType, req);
    }
}

export async function fetchOne<T extends RestgooseModel>(modelType: Constructor<T>, methodConfig: RestConfigurationMethod<T>, req: RestRequest,
                                                         useFilter: boolean): Promise<T> {
    const query = useFilter ? (req.restgoose || {}).query || {} : {};

    return methodConfig.fetch ?
        await methodConfig.fetch(req, modelType, useFilter) as T :
        await Restgoose.connector.findOne(modelType, req, useFilter);
}

export async function postFetch<T extends RestgooseModel>(methodConfig: RestConfigurationMethod<T>, req: RestRequest, entity: T): Promise<T> {
    const promise: Promise<any> = Promise.resolve(entity);

    return methodConfig.postFetch ?
        promise.then(entity => entity && methodConfig.postFetch(req, entity)) :
        promise;
}

export async function postFetchAll<T extends RestgooseModel>(methodConfig: RestConfigurationMethod<T>, req: RestRequest, entities: (T)[]): Promise<(T)[]> {
    if (methodConfig.postFetch) {
        const out = await Promise.all(entities.map(async entity => entity && (await methodConfig.postFetch(req, entity)) as T));
        return out.filter(e => !!e);
    }
    else {
        return entities;
    }
}

export async function preSave<T extends RestgooseModel>(methodConfig: RestConfigurationMethod<T>, req: RestRequest, oldEntity: T, newEntity: T): Promise<T> {

    const promise: Promise<any> = Promise.resolve(newEntity);

    return methodConfig.preSave ?
        await promise.then(entity => entity && methodConfig.preSave(req, newEntity, oldEntity)) :
        await promise;
}

export async function preSaveAll<T extends RestgooseModel>(methodConfig: RestConfigurationMethod<T>, req: RestRequest, oldEntities: (T)[],
                                                           newEntities: (T)[]):
    Promise<(T)[]> {

    return methodConfig.preSave ?
        await Promise.all(newEntities.map(async (newEntity, index) => methodConfig.preSave(req, newEntity, oldEntities[index]) as Promise<T>)) :
        newEntities;
}

export async function persistSave<T extends RestgooseModel>(methodConfig: RestConfigurationMethod<T>, req: RestRequest,
                                                            oldEntity: T, entity: T):
    Promise<T> {

    return methodConfig.persist ?
        await (methodConfig.persist as MiddlewarePersistSave<T>)(req, entity, oldEntity) as T :
        await Restgoose.connector.save(entity);
}

export async function persistDeleteAll<T extends RestgooseModel>(modelType: Constructor<T>, methodConfig: RestConfigurationMethod<T>,
                                                                 req: RestRequest, entities: (T)[]):
    Promise<boolean> {

    const out = entities.filter(e => !!e);

    return methodConfig.persist ?
        await (methodConfig.persist as MiddlewarePersistDeleteAll<T>)(req, entities) :
        await Restgoose.connector.delete(modelType, req);
}

export async function persistDeleteOne<T extends RestgooseModel>(modelType: Constructor<T>, methodConfig: RestConfigurationMethod<T>,
                                                                 req: RestRequest, entity: T):
    Promise<boolean> {

    return methodConfig.persist ?
        await (methodConfig.persist as MiddlewarePersistDeleteOne<T>)(req, entity) :
        await Restgoose.connector.deleteOne(modelType, req);
}

export async function preSend<T extends RestgooseModel>(methodConfig: RestConfigurationMethod<T>, req: RestRequest,
                                                        oldEntity: T, entity: T):
    Promise<T> {

    const promise: Promise<any> = Promise.resolve(entity);

    return methodConfig.preSend ?
        await promise.then(entity => entity && methodConfig.preSend(req, entity, oldEntity)) :
        await promise;
}

export async function preSendAll<T extends RestgooseModel>(methodConfig: RestConfigurationMethod<T>, req: RestRequest, entities: (T)[]):
    Promise<(T)[]> {

    return methodConfig.preSend ?
        await Promise.all(entities.map(async entity => methodConfig.preSend(req, entity) as Promise<T>)) :
        entities;
}
