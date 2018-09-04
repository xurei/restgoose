import { Response } from 'express';
import { CastError, Model } from 'mongoose';
import { InstanceType, Typegoose } from 'typegoose';
import { RestConfigurationMethod, RestError } from './rest';
import { MiddlewarePostFetch, MiddlewarePreFetch, RestRequest } from './types';

export const ERROR_FORBIDDEN_CODE: string = 'FORBIDDEN';
export const ERROR_NOT_FOUND_CODE: string = 'NOT_FOUND';
export const ERROR_READONLY_CODE: string = 'READ_ONLY';
export const ERROR_VALIDATION_CODE: string = 'BAD_DATA';
export const ERROR_VALIDATION_NAME: string = 'ValidationError';

export async function getOne<T extends Typegoose>(
    modelType: Model<InstanceType<T>>, methodConfig: RestConfigurationMethod<T>, req: RestRequest):
    Promise<InstanceType<T>> {

    const query = (
        methodConfig.fetch ? methodConfig.fetch(req) : modelType.findById(req.params.id)
    ) as Promise<InstanceType<T>>;

    const result: InstanceType<T> = await query;
    return await postFetchHooks(req, result, methodConfig.postFetch);
}

export async function getAll<T extends Typegoose>(
    modelType: Model<InstanceType<T>>, methodConfig: RestConfigurationMethod<T>, req: RestRequest):
    Promise<InstanceType<T>[]> {

    //TODO getAll() remove req.filter from the default behaviour ?
    const query = (
        methodConfig.fetch ? methodConfig.fetch(req) : modelType.find(req.filter)
    ) as Promise<InstanceType<T>[]>;

    const result: InstanceType<T>[] = await query || [];
    const out = await postFetchHooksAll(req, result, methodConfig.postFetch);
    return out.filter(e => !!e);
}

export function all<T extends Typegoose>(modelType: Model<InstanceType<T>>, methodConfig: RestConfigurationMethod<T>) {
    return wrapException(async (req: RestRequest, res: Response) => {
        await prefetchHooks(req, methodConfig.preFetch);
        const result = await getAll(modelType, methodConfig, req);
        const out = await postFetchHooksAll(req, result, methodConfig.preSend);
        return res.status(200).json(out);
    });
}

export function allWithin<T extends Typegoose>(
    modelType: Model<InstanceType<T>>, methodConfig: RestConfigurationMethod<T>,
    property: string, submodelType: Model<InstanceType<T>>, submethodConfig: RestConfigurationMethod<T>) {
    return wrapException(async (req: RestRequest, res: Response) => {
        await prefetchHooks(req, submethodConfig.preFetch);

        const parentResult = await getOne(modelType, methodConfig, req);
        if (!parentResult) {
            return res.status(404).json({
                code: ERROR_NOT_FOUND_CODE,
            });
        }
        else {
            const refs = parentResult[property];

            req = Object.assign({}, req);
            req.filter = Object.assign({}, req.filter || {}, {
                _id: { $in: refs },
            });

            const result = await getAll(submodelType, submethodConfig, req);
            const out = await postFetchHooksAll(req, result, methodConfig.preSend);
            return res.status(200).json(out);
        }
    });
}

export function one<T extends Typegoose>(modelType: Model<InstanceType<T>>, methodConfig: RestConfigurationMethod<T>) {
    return wrapException(async (req: RestRequest, res: Response) => {
        await prefetchHooks(req, methodConfig.preFetch);
        const result = await getOne(modelType, methodConfig, req);
        if (!result) {
            return res.status(404).json({
                code: ERROR_NOT_FOUND_CODE,
            });
        }
        else {
            const out = await postFetchHooks(req, result, methodConfig.preSend);
            return res.status(200).json(out);
        }
    });
}

export function create<T extends Typegoose>(
    modelType: Model<InstanceType<T>>, methodConfig: RestConfigurationMethod<T>) {
    return wrapException(async (req: RestRequest, res: Response) => {
        await prefetchHooks(req, methodConfig.preFetch);

        const model = (
            methodConfig.fetch
            ? await (methodConfig.fetch(req) as Promise<InstanceType<T>>)
            : new modelType(buildPayload(req, modelType))
        );
        const modelToSave = await postFetchHooks(req, model, methodConfig.postFetch);
        const modelSaved = await modelToSave.save();
        const out = await postFetchHooks(req, modelSaved, methodConfig.preSend);
        res.status(201).json(out);
    });
}

export function createWithin<T extends Typegoose>(
    modelType: Model<InstanceType<T>>, methodConfig: RestConfigurationMethod<T>,
    property: string, submodelType: Model<InstanceType<T>>, submethodConfig: RestConfigurationMethod<T>) {
    return wrapException(async (req: RestRequest, res: Response) => {
        await prefetchHooks(req, submethodConfig.preFetch);

        const parentResult = await getOne(modelType, methodConfig, req);
        if (!parentResult) {
            return res.status(404).json({
                code: ERROR_NOT_FOUND_CODE,
            });
        }
        else {
            const submodel = (
                submethodConfig.fetch
                ? await (submethodConfig.fetch(req) as Promise<InstanceType<T>>)
                : new submodelType(buildPayload(req, submodelType))
            );
            const submodelToSave = await postFetchHooks(req, submodel, submethodConfig.postFetch);
            const submodelSaved = await submodelToSave.save();

            parentResult[property].push(submodelSaved._id);
            await parentResult.save();
            const out = await postFetchHooks(req, submodelSaved, submethodConfig.preSend);
            return res.status(201).json(out);
        }
    });
}

export function update<T extends Typegoose>(
    modelType: Model<InstanceType<T>>, methodConfig: RestConfigurationMethod<T>) {
    return wrapException(async (req: RestRequest, res: Response) => {
        await prefetchHooks(req, methodConfig.preFetch);
        const result = await getOne(modelType, methodConfig, req);
        if (!result) {
            return res.status(404).json({
                code: ERROR_NOT_FOUND_CODE,
            });
        }
        else {
            const payload = buildPayload(req, modelType);
            const updatedEntity = Object.assign(result, payload);
            const saved = await updatedEntity.save();
            const out = await postFetchHooks(req, saved, methodConfig.preSend);
            return res.status(200).json(out);
        }
    });
}

export function remove<T extends Typegoose>(
    modelType: Model<InstanceType<T>>, methodConfig: RestConfigurationMethod<T>) {
    return wrapException(async (req: RestRequest, res: Response) => {
        await prefetchHooks(req, methodConfig.preFetch);
        const result = await modelType.findById(req.params.id);
        const filteredResult = await postFetchHooks(req, result, methodConfig.postFetch);
        if (!filteredResult) {
            return res.status(404).json({
                code: ERROR_NOT_FOUND_CODE,
            });
        }
        else {
            await modelType.deleteOne({ _id: req.params.id });
            return res.status(204).end();
        }
    });
}

export function removeAll<T extends Typegoose>(modelType: Model<InstanceType<T>>, methodConfig: RestConfigurationMethod<T>) {
    return wrapException(async (req: RestRequest, res: Response) => {
        await prefetchHooks(req, methodConfig.preFetch);

        const result = await getAll(modelType, methodConfig, req);
        const out = await postFetchHooksAll(req, result, methodConfig.postFetch);
        out.filter(e => !!e);
        await modelType.deleteMany({ _id: { $in: out.map(e => e._id) }});
        return res.status(204).end();
    });
}

function buildPayload<T extends Typegoose>(req: RestRequest, modelType: Model<InstanceType<T>>) {
    const payload = {};
    const properties = Object.keys(modelType.schema.obj);
    properties.forEach((prop: string) => {
        // TODO search for typegoose annotations and process them
        if (req.body[prop]) {
            payload[prop] = req.body[prop];
        }
    });
    return payload;
}

// Centralize exception management
function wrapException(fn: (req: RestRequest, res: Response) => void): (req: RestRequest, res: Response) => any {
    return async (req: RestRequest, res: Response) => {
        try {
            return await fn.bind(this)(req, res);
        }
        catch (error) {
            if (error instanceof RestError) {
                const restError = error as RestError;
                return res.status(restError.httpCode).send(restError.errorData);
            }
            else if (error instanceof CastError) {
                // tslint:disable-next-line:no-string-literal
                if (error['path'] === '_id') {
                    return res.status(404).json({
                        code: ERROR_NOT_FOUND_CODE,
                    });
                }
            }
            else if (error.name === ERROR_VALIDATION_NAME) {
                return res.status(400).send({ code: ERROR_VALIDATION_CODE, errors: error.errors });
            }
            else {
                console.error(error);
                return res.status(500).end();
            }
        }
    };
}

function prefetchHooks<T extends Typegoose>(req: RestRequest, preFetch: MiddlewarePreFetch): Promise<boolean> {
    if (preFetch) {
        return preFetch(req);
    }
    else {
        return Promise.resolve(true);
    }
}

function postFetchHooks<T extends Typegoose>(
    req: RestRequest, entity: T, postFetch: MiddlewarePostFetch<T>): Promise<InstanceType<T>> {
    let promises: Promise<any> = Promise.resolve(entity);
    if (postFetch) {
        promises = promises.then(entity => entity && postFetch(req, entity));
    }
    return promises;
}

function postFetchHooksAll<T extends Typegoose>(
    req: RestRequest, entities: T[], postFetch: MiddlewarePostFetch<T>): Promise<InstanceType<T>[]> {
    return Promise.all(entities.map(async entity => postFetchHooks(req, entity, postFetch)));
}
