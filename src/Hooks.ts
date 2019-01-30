import { Model } from 'mongoose';
import * as mongoose from 'mongoose';
import { InstanceType, Typegoose } from 'typegoose';
import { getModel as getModelForConnection } from './getModel';
import { buildPayload } from './RequestUtil';
import { RestConfigurationMethod } from './rest';
import { RestModelEntry } from './RestRegistry';
import {
    MiddlewarePersistDeleteAll,
    MiddlewarePersistDeleteOne,
    MiddlewarePersistSave,
    RestRequest,
} from './types';

export async function getModel<T extends Typegoose>(modelEntry: RestModelEntry<T>, req: RestRequest): Promise<Model<InstanceType<T>>> {
    // FIXME as any
    const connection = modelEntry.config.getConnection ? await modelEntry.config.getConnection(req) as any : mongoose;
    const model = modelEntry.type;

    return getModelForConnection(connection, model);
}

export async function preFetch<T extends Typegoose>(methodConfig: RestConfigurationMethod<T>, req: RestRequest):
    Promise<boolean> {

    return methodConfig.preFetch ?
        methodConfig.preFetch(req) :
        Promise.resolve(true);
}

export async function fetchAll<T extends Typegoose>(modelType: Model<InstanceType<T>>, methodConfig: RestConfigurationMethod<T>, req: RestRequest):
    Promise<InstanceType<T>[]> {

    // TODO: getAll() remove req.filter from the default behaviour ?
    const query = (
        methodConfig.fetch ?
            methodConfig.fetch(req, modelType) :
            modelType.find(req.restgoose.query, req.restgoose.projection, req.restgoose.options)
    ) as Promise<InstanceType<T>[]>;

    return Promise.resolve(await query || []);
}

export async function fetchCreate<T extends Typegoose>(modelType: Model<InstanceType<T>>, methodConfig: RestConfigurationMethod<T>, req: RestRequest):
    Promise<InstanceType<T>> {

    return methodConfig.fetch ?
        methodConfig.fetch(req, modelType) as Promise<InstanceType<T>> :
        Promise.resolve(new modelType(buildPayload(req, modelType)));
}

export async function fetchOne<T extends Typegoose>(modelType: Model<InstanceType<T>>, methodConfig: RestConfigurationMethod<T>, req: RestRequest):
    Promise<InstanceType<T>> {

    return methodConfig.fetch ?
        methodConfig.fetch(req, modelType) as Promise<InstanceType<T>> :
        modelType.findById(req.params.id);
}

export async function postFetch<T extends Typegoose>(methodConfig: RestConfigurationMethod<T>, req: RestRequest, entity: T):
    Promise<InstanceType<T>> {

    const promise: Promise<any> = Promise.resolve(entity);

    return methodConfig.postFetch ?
        promise.then(entity => entity && methodConfig.postFetch(req, entity)) :
        promise;
}

export async function postFetchAll<T extends Typegoose>(methodConfig: RestConfigurationMethod<T>, req: RestRequest, entities: InstanceType<T>[]):
    Promise<InstanceType<T>[]> {

    if (methodConfig.postFetch) {
        const out = await Promise.all(entities.map(async entity => entity && methodConfig.postFetch(req, entity) as InstanceType<T>));
        return out.filter(e => !!e);
    }
    else {
        return Promise.resolve(entities);
    }
}

export async function preSave<T extends Typegoose>(methodConfig: RestConfigurationMethod<T>, req: RestRequest, oldEntity: InstanceType<T>,
                                                   newEntity: InstanceType<T>):
    Promise<InstanceType<T>> {

    const promise: Promise<any> = Promise.resolve(newEntity);

    return methodConfig.preSave ?
        promise.then(entity => entity && methodConfig.preSave(req, newEntity, oldEntity)) :
        promise;
}

export async function preSaveAll<T extends Typegoose>(methodConfig: RestConfigurationMethod<T>, req: RestRequest, oldEntities: InstanceType<T>[],
                                                      newEntities: InstanceType<T>[]):
    Promise<InstanceType<T>[]> {

    return methodConfig.preSave ?
        Promise.all(newEntities.map(async (newEntity, index) => methodConfig.preSave(req, oldEntities[index], newEntity, methodConfig.preSave))) :
        Promise.resolve(newEntities);
}

export async function persistSave<T extends Typegoose>(methodConfig: RestConfigurationMethod<T>, entity: InstanceType<T>):
    Promise<InstanceType<T>> {

    return methodConfig.persist ?
        (methodConfig.persist as MiddlewarePersistSave<T>)(entity) as Promise<InstanceType<T>> :
        entity.save();
}

export async function persistDeleteAll<T extends Typegoose>(modelType: Model<InstanceType<T>>, methodConfig: RestConfigurationMethod<T>,
                                                            entities: InstanceType<T>[]):
    Promise<boolean> {

    const out = entities.filter(e => !!e);

    return methodConfig.persist ?
            (methodConfig.persist as MiddlewarePersistDeleteAll<T>)(entities) :
            modelType.deleteMany({ _id: { $in: out.map(e => e._id) }}).then(() => true);
}

export async function persistDeleteOne<T extends Typegoose>(modelType: Model<InstanceType<T>>, methodConfig: RestConfigurationMethod<T>,
                                                            entity: InstanceType<T>):
    Promise<boolean> {

    return methodConfig.persist ?
        (methodConfig.persist as MiddlewarePersistDeleteOne<T>)(entity) :
        modelType.deleteOne({ _id: entity._id }).then(() => true);
}

export async function preSend<T extends Typegoose>(methodConfig: RestConfigurationMethod<T>, req: RestRequest, entity: InstanceType<T>):
    Promise<InstanceType<T>> {

    const promise: Promise<any> = Promise.resolve(entity);

    return methodConfig.preSend ?
        promise.then(entity => entity && methodConfig.preSend(req, entity)) :
        promise;
}

export async function preSendAll<T extends Typegoose>(methodConfig: RestConfigurationMethod<T>, req: RestRequest, entities: InstanceType<T>[]):
    Promise<InstanceType<T>[]> {

    return methodConfig.preSend ?
        Promise.all(entities.map(async entity => methodConfig.preSend(req, entity, postFetch))) :
        Promise.resolve(entities);
}
