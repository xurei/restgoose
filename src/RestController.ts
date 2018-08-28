import { Response } from 'express';
import { CastError, Model } from 'mongoose';
import { InstanceType, Typegoose } from 'typegoose';
import { RestConfigurationMethod, RestError } from './rest';
import { RestRequest } from './types';

export const ERROR_FORBIDDEN_CODE: string = 'FORBIDDEN';
export const ERROR_NOT_FOUND_CODE: string = 'NOT_FOUND';
export const ERROR_READONLY_CODE: string = 'READ_ONLY';
export const ERROR_VALIDATION_CODE: string = 'BAD_DATA';
export const ERROR_VALIDATION_NAME: string = 'ValidationError';

export async function getOne<T extends Typegoose>(
    modelType: Model<InstanceType<T>>, methodConfig: RestConfigurationMethod<T>, req: RestRequest):
    Promise<InstanceType<T>> {

    const result = await modelType.findById(req.params.id);
    return await postFetchHooks(req, result, methodConfig);
}

export async function getAll<T extends Typegoose>(
    modelType: Model<InstanceType<T>>, methodConfig: RestConfigurationMethod<T>, req: RestRequest):
    Promise<InstanceType<T>[]> {

    const result = await modelType.find(req.filter) || [];
    const out = await Promise.all(result.map(async entity => {
        return postFetchHooks(req, entity, methodConfig);
    }));
    return out.filter(e => !!e);
}

export function all<T extends Typegoose>(modelType: Model<InstanceType<T>>, methodConfig: RestConfigurationMethod<T>) {
    return wrapException(async (req: RestRequest, res: Response) => {
        await prefetchHooks(req, res, methodConfig);
        const result = await getAll(modelType, methodConfig, req);
        return res.status(200).json(result);
    });
}

export function allWithin<T extends Typegoose>(
    modelType: Model<InstanceType<T>>, methodConfig: RestConfigurationMethod<T>,
    property: string, submodelType: Model<InstanceType<T>>, submethodConfig: RestConfigurationMethod<T>) {
    return wrapException(async (req: RestRequest, res: Response) => {
        await prefetchHooks(req, res, submethodConfig);

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

            const result = getAll(submodelType, submethodConfig, req);
            return res.status(200).json(result);
        }
    });
}

export function one<T extends Typegoose>(modelType: Model<InstanceType<T>>, methodConfig: RestConfigurationMethod<T>) {
    return wrapException(async (req: RestRequest, res: Response) => {
        await prefetchHooks(req, res, methodConfig);
        const result = await getOne(modelType, methodConfig, req);
        if (!result) {
            return res.status(404).json({
                code: ERROR_NOT_FOUND_CODE,
            });
        }
        else {
            return res.status(200).json(result);
        }
    });
}

export function create<T extends Typegoose>(
    modelType: Model<InstanceType<T>>, methodConfig: RestConfigurationMethod<T>) {
    return wrapException(async (req: RestRequest, res: Response) => {
        await prefetchHooks(req, res, methodConfig);
        const payload = buildPayload(req, modelType);
        const model = new modelType(payload);
        const saved = await model.save();
        const out = await postFetchHooks(req, saved, methodConfig);
        res.status(201).json(out);
    });
}

export function createWithin<T extends Typegoose>(
    modelType: Model<InstanceType<T>>, methodConfig: RestConfigurationMethod<T>,
    property: string, submodelType: Model<InstanceType<T>>, submethodConfig: RestConfigurationMethod<T>) {
    return wrapException(async (req: RestRequest, res: Response) => {
        await prefetchHooks(req, res, submethodConfig);

        const parentResult = await getOne(modelType, methodConfig, req);
        if (!parentResult) {
            return res.status(404).json({
                code: ERROR_NOT_FOUND_CODE,
            });
        }
        else {
            const payload = buildPayload(req, submodelType);
            const submodel = new submodelType(payload);
            const saved = await submodel.save();

            parentResult[property].push(saved._id);
            await parentResult.save();

            // TODO migrate to async/await
            const out = await postFetchHooks(req, saved, submethodConfig);
            return res.status(201).json(out);
        }
    });
}

export function update<T extends Typegoose>(
    modelType: Model<InstanceType<T>>, methodConfig: RestConfigurationMethod<T>) {
    return wrapException(async (req: RestRequest, res: Response) => {
        await prefetchHooks(req, res, methodConfig);
        const result = await getOne(modelType, methodConfig, req);
        if (!result) {
            return res.status(404).json({
                code: ERROR_NOT_FOUND_CODE,
            });
        }
        else {
            const payload = buildPayload(req, modelType);
            let updatedEntity = Object.assign(result, payload);
            updatedEntity = await updatedEntity.save();
            return res.status(200).json(updatedEntity);
        }
    });
}

export function remove<T extends Typegoose>(
    modelType: Model<InstanceType<T>>, methodConfig: RestConfigurationMethod<T>) {
    return wrapException(async (req: RestRequest, res: Response) => {
        await prefetchHooks(req, res, methodConfig);
        const result = await modelType.findById(req.params.id);
        const filteredResult = await postFetchHooks(req, result, methodConfig);
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
        await prefetchHooks(req, res, methodConfig);

        const result = await getAll(modelType, methodConfig, req);
        const out = await Promise.all(result.map(async entity => {
            return postFetchHooks(req, entity, methodConfig);
        }));
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

function prefetchHooks<T extends Typegoose>(
    req: RestRequest, res: Response, methodConfig: RestConfigurationMethod<T>): Promise<any> {
    let promises: Promise<any> = Promise.resolve();
    (methodConfig.preFetch || []).forEach(m => {
        promises = promises.then(() => new Promise(resolve => {
            m(req, res, resolve);
        }));
    });
    return promises;
}

function postFetchHooks<T extends Typegoose>(
    req: RestRequest, entity: T, methodConfig: RestConfigurationMethod<T>): Promise<InstanceType<T>> {
    let promises: Promise<any> = Promise.resolve(entity);
    (methodConfig.postFetch || []).forEach(m => {
        promises = promises.then(entity => entity && m(req, entity));
    });
    return promises;
}
