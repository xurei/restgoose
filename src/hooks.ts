import { Document, Model } from 'mongoose';
import * as mongoose from 'mongoose';
import { RestConfigurationMethod } from './decorators/rest';
import { getModel as getModelForConnection } from './get-model';
import { RestModelEntry } from './rest-registry';
import { RestgooseModel } from './restgoose-model';
import {
    MiddlewarePersistDeleteAll,
    MiddlewarePersistDeleteOne,
    MiddlewarePersistSave,
    RestRequest,
} from './types';

export async function getModel<T extends RestgooseModel>(modelEntry: RestModelEntry<T>, req: RestRequest): Promise<Model<T & Document>> {
    // FIXME as any
    const connection = modelEntry.restConfig.getConnection ? await modelEntry.restConfig.getConnection(req) as any : mongoose;
    const model = modelEntry.type;

    return getModelForConnection(model, connection);
}

export async function preFetch<T extends RestgooseModel>(methodConfig: RestConfigurationMethod<T>, req: RestRequest):
    Promise<boolean> {

    return methodConfig.preFetch ?
        methodConfig.preFetch(req, null) :
        Promise.resolve(null);
}

export async function fetchAll<T extends RestgooseModel>(modelType: Model<T & Document>, methodConfig: RestConfigurationMethod<T>, req: RestRequest):
    Promise<(T & Document)[]> {

    // TODO: getAll() remove req.filter from the default behaviour ?
    const query = (
        methodConfig.fetch ?
            methodConfig.fetch(req, modelType) :
            modelType.find(req.restgoose.query, req.restgoose.projection, req.restgoose.options)
    ) as Promise<(T & Document)[]>;

    return Promise.resolve(await query || []);
}

export async function fetchCreate<T extends RestgooseModel>(modelType: Model<T & Document>, methodConfig: RestConfigurationMethod<T>, req: RestRequest):
    Promise<T & Document> {

    return methodConfig.fetch ?
        methodConfig.fetch(req, modelType) as Promise<T & Document> :
        Promise.resolve(new modelType({}));
}

export async function fetchOne<T extends RestgooseModel>(modelType: Model<T & Document>, methodConfig: RestConfigurationMethod<T>, req: RestRequest):
    Promise<T & Document> {

    return methodConfig.fetch ?
        methodConfig.fetch(req, modelType) as Promise<T & Document> :
        modelType.findById(req.params.id);
}

export async function postFetch<T extends RestgooseModel>(methodConfig: RestConfigurationMethod<T>, req: RestRequest, entity: T):
    Promise<T & Document> {

    const promise: Promise<any> = Promise.resolve(entity);

    return methodConfig.postFetch ?
        promise.then(entity => entity && methodConfig.postFetch(req, entity)) :
        promise;
}

export async function postFetchAll<T extends RestgooseModel>(methodConfig: RestConfigurationMethod<T>, req: RestRequest, entities: (T & Document)[]):
    Promise<(T & Document)[]> {

    if (methodConfig.postFetch) {
        const out = await Promise.all(entities.map(async entity => entity && methodConfig.postFetch(req, entity) as T & Document));
        return out.filter(e => !!e);
    }
    else {
        return Promise.resolve(entities);
    }
}

export async function preSave<T extends RestgooseModel>(methodConfig: RestConfigurationMethod<T>, req: RestRequest, oldEntity: T & Document,
                                                        newEntity: T & Document):
    Promise<T & Document> {

    const promise: Promise<any> = Promise.resolve(newEntity);

    return methodConfig.preSave ?
        promise.then(entity => entity && methodConfig.preSave(req, newEntity, oldEntity)) :
        promise;
}

export async function preSaveAll<T extends RestgooseModel>(methodConfig: RestConfigurationMethod<T>, req: RestRequest, oldEntities: (T & Document)[],
                                                           newEntities: (T & Document)[]):
    Promise<(T & Document)[]> {

    return methodConfig.preSave ?
        Promise.all(newEntities.map(async (newEntity, index) => methodConfig.preSave(req, newEntity, oldEntities[index]) as Promise<T & Document>)) :
        Promise.resolve(newEntities);
}

export async function persistSave<T extends RestgooseModel>(methodConfig: RestConfigurationMethod<T>, req: RestRequest, oldEntity: T & Document, entity: T & Document):
    Promise<T & Document> {

    return methodConfig.persist ?
        (methodConfig.persist as MiddlewarePersistSave<T>)(req, entity, oldEntity) as Promise<T & Document> :
        entity.save();
}

export async function persistDeleteAll<T extends RestgooseModel>(modelType: Model<T & Document>, methodConfig: RestConfigurationMethod<T>,
                                                                 req: RestRequest, entities: (T & Document)[]):
    Promise<boolean> {

    const out = entities.filter(e => !!e);

    return methodConfig.persist ?
            (methodConfig.persist as MiddlewarePersistDeleteAll<T>)(req, entities) :
            modelType.deleteMany({ _id: { $in: out.map(e => e._id) }}).then(() => true);
}

export async function persistDeleteOne<T extends RestgooseModel>(modelType: Model<T & Document>, methodConfig: RestConfigurationMethod<T>,
                                                                 req: RestRequest, entity: T & Document):
    Promise<boolean> {

    return methodConfig.persist ?
        (methodConfig.persist as MiddlewarePersistDeleteOne<T>)(req, entity) :
        modelType.deleteOne({ _id: entity._id }).then(() => true);
}

export async function preSend<T extends RestgooseModel>(methodConfig: RestConfigurationMethod<T>, req: RestRequest, oldEntity: T & Document, entity: T & Document):
    Promise<T & Document> {

    const promise: Promise<any> = Promise.resolve(entity);

    return methodConfig.preSend ?
        promise.then(entity => entity && methodConfig.preSend(req, entity, oldEntity)) :
        promise;
}

export async function preSendAll<T extends RestgooseModel>(methodConfig: RestConfigurationMethod<T>, req: RestRequest, entities: (T & Document)[]):
    Promise<(T & Document)[]> {

    return methodConfig.preSend ?
        Promise.all(entities.map(async entity => methodConfig.preSend(req, entity) as Promise<T & Document>)) :
        Promise.resolve(entities);
}
