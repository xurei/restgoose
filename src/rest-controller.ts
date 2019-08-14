import { Response } from 'express';
import { CastError, Document, Types } from 'mongoose';
import { debug } from './debug';
import { ArrayPropConfiguration } from './decorators/array-prop';
import { RestConfigurationMethod, RestError } from './decorators/rest';
import {
    fetchAll, fetchCreate, fetchOne, getModel,
    persistDeleteAll, persistDeleteOne,
    persistSave, postFetch, postFetchAll, preFetch, preSave,
    preSaveAll, preSend, preSendAll,
} from './hooks';
import { parseQuery } from './parse-query';
import { buildPayload } from './request-util';
import { RestModelEntry, RestPropEntry } from './rest-registry';
import { RestgooseModel } from './restgoose-model';
import { Constructor, Dic, RestRequest } from './types';

export const ERROR_FORBIDDEN_CODE: string = 'FORBIDDEN';
export const ERROR_NOT_FOUND_CODE: string = 'NOT_FOUND';
export const ERROR_READONLY_CODE: string = 'READ_ONLY';
export const ERROR_VALIDATION_CODE: string = 'BAD_DATA';
export const ERROR_VALIDATION_NAME: string = 'ValidationError';
export const ERROR_BAD_FORMAT_CODE: string = 'BAD_FORMAT';

export function all<T extends RestgooseModel>(modelEntry: RestModelEntry<T>, methodConfig: RestConfigurationMethod<T>) {
    return wrapException(async (req: RestRequest, res: Response) => {
        req = parseQuery(req);

        // getModel
        const modelType = await getModel(modelEntry, req);

        // preFetch
        await preFetch(methodConfig, req);

        // fetch
        const fetchResult = await fetchAll(modelType, methodConfig, req);

        // postFetch
        const postFetchResult = await postFetchAll(methodConfig, req, fetchResult);

        // preSend
        const preSendResult = await preSendAll(methodConfig, req, postFetchResult);

        return res.status(200).json(preSendResult);
    });
}

export function allWithin<T extends RestgooseModel, S extends RestgooseModel>(
    modelEntry: RestModelEntry<T>, methodConfig: RestConfigurationMethod<T>,
    propEntry: RestPropEntry<S>, submethodConfig: RestConfigurationMethod<S>) {
    return wrapException(async (req: RestRequest, res: Response) => {
        req = parseQuery(req);

        // getModel - parent
        const modelType = await getModel(modelEntry, req);

        // preFetch - parent
        await preFetch(submethodConfig, req);

        // fetch - parent
        const fetchParentResult = await fetchOne(modelType, methodConfig, req);

        // postFetch - parent
        const postFetchParentResult = await postFetch(methodConfig, req, fetchParentResult);

        // Check parent
        if (!postFetchParentResult) {
            return res.status(404).json({
                code: ERROR_NOT_FOUND_CODE,
            });
        }
        else {
            const isReferenced = (propEntry.config as ArrayPropConfiguration<T, S>).ref; //!!submodelEntry.restConfig.ref;

            let fetchSubResult;
            if (isReferenced) {
                // Create filter from parent references
                const refs = postFetchParentResult[propEntry.name];
                req = Object.assign({}, req);
                req.restgoose.query = Object.assign({}, req.restgoose.query || {}, {
                    _id: { $in: refs },
                });

                // getModel - sub
                const submodelEntry: RestModelEntry<S> = {
                    type: propEntry.type[0] as Constructor<S>,
                    restConfig: propEntry.restConfig,
                };
                const submodelType = await getModel(submodelEntry, req);

                // fetch - sub
                fetchSubResult = await fetchAll(submodelType, submethodConfig, req);
            }
            else {
                fetchSubResult = postFetchParentResult[propEntry.name];
            }

            // postFetch - sub
            const postFetchSubResult = await postFetchAll(submethodConfig, req, fetchSubResult);

            // preSend - sub
            const preSendSubResult = await preSendAll(submethodConfig, req, postFetchSubResult);

            return res.status(200).json(preSendSubResult);
        }
    });
}

export function create<T extends RestgooseModel>(modelEntry: RestModelEntry<T>, methodConfig: RestConfigurationMethod<T>) {
    return wrapException(async (req: RestRequest, res: Response) => {
        // getModel
        const modelType = await getModel(modelEntry, req);

        // preFetch
        await preFetch(methodConfig, req);

        // fetch
        const fetchResult = await fetchCreate(modelType, methodConfig, req);

        // postFetch
        const postFetchResult = await postFetch(methodConfig, req, fetchResult);

        // Check
        if (!postFetchResult) {
            return res.status(404).json({
                code: ERROR_NOT_FOUND_CODE,
            });
        }
        else {
            // merge
            const payload = buildPayload(req, modelType);
            const prev = postFetchResult.toObject();

            // updates initial doc
            updateDocument(postFetchResult, payload);

            // preSave
            const preSaveResult = await preSave(methodConfig, req, prev, postFetchResult);

            // save
            const saveResult = await persistSave(methodConfig, req, prev, preSaveResult);

            // preSend
            const preSendResult = await preSend(methodConfig, req, prev, saveResult);

            res.status(201).json(preSendResult);
        }
    });
}

export function createWithin<T extends RestgooseModel, S extends RestgooseModel>(
    modelEntry: RestModelEntry<T>, methodConfig: RestConfigurationMethod<T>,
    propEntry: RestPropEntry<S>, submethodConfig: RestConfigurationMethod<S>) {
    return wrapException(async (req: RestRequest, res: Response) => {
        // getModel - parent
        const modelType = await getModel(modelEntry, req);

        // preFetch - parent
        await preFetch(submethodConfig, req);

        // fetch - parent
        const fetchParentResult = await fetchOne(modelType, methodConfig, req);

        // postFetch - parent
        const postFetchParentResult = await postFetch(methodConfig, req, fetchParentResult);

        // Check parent
        if (!postFetchParentResult) {
            return res.status(404).json({
                code: ERROR_NOT_FOUND_CODE,
            });
        }
        else {
            const isReferenced = (propEntry.config as ArrayPropConfiguration<T, S>).ref;
            let saveSubResult;
            postFetchParentResult[propEntry.name] = postFetchParentResult[propEntry.name] || [];
            let prev = null;
            if (isReferenced) {
                // getModel - sub
                const submodelEntry: RestModelEntry<S> = {
                    type: propEntry.type[0] as Constructor<S>,
                    restConfig: propEntry.restConfig,
                };
                const submodelType = await getModel(submodelEntry, req);

                // fetch - sub
                const fetchSubResult = await fetchCreate(submodelType, submethodConfig, req);

                // postFetch - sub
                const postFetchSubResult = await postFetch(submethodConfig, req, fetchSubResult);

                // merge
                const payload = buildPayload(req, submodelType);
                prev = postFetchSubResult.toObject();

                // updates initial sub doc
                updateDocument(postFetchSubResult, payload);

                // preSave
                const preSaveSubResult = await preSave(submethodConfig, req, prev, postFetchSubResult);

                // save - sub
                saveSubResult = await persistSave(submethodConfig, req, prev, preSaveSubResult);

                // save - parent
                postFetchParentResult[propEntry.name].push(saveSubResult._id);
                await persistSave(methodConfig, req, prev, postFetchParentResult);
            }
            else {
                // save - parent
                postFetchParentResult[propEntry.name].push(req.body);
                const parentSaveResult = await persistSave(methodConfig, req, postFetchParentResult, postFetchParentResult);
                saveSubResult = parentSaveResult[propEntry.name][parentSaveResult[propEntry.name].length - 1];
            }

            // preSend - sub
            const preSendSubResult = await preSend(submethodConfig, req, prev, saveSubResult);

            return res.status(201).json(preSendSubResult);
        }
    });
}

export function one<T extends RestgooseModel>(modelEntry: RestModelEntry<T>, methodConfig: RestConfigurationMethod<T>) {
    return wrapException(async (req: RestRequest, res: Response) => {
        // getModel
        const modelType = await getModel(modelEntry, req);

        // preFetch
        await preFetch(methodConfig, req);

        // fetch
        const fetchResult = await fetchOne(modelType, methodConfig, req);

        // postFetch
        const postFetchResult = await postFetch(methodConfig, req, fetchResult);

        // Check
        if (!postFetchResult) {
            return res.status(404).json({
                code: ERROR_NOT_FOUND_CODE,
            });
        }
        else {
            // preSend
            const preSendResult = await preSend(methodConfig, req, null, postFetchResult);

            return res.status(200).json(preSendResult);
        }
    });
}

export function oneWithin<T extends RestgooseModel, S extends RestgooseModel>(
modelEntry: RestModelEntry<T>, methodConfig: RestConfigurationMethod<T>,
propEntry: RestPropEntry<S>, submethodConfig: RestConfigurationMethod<S>) {
    return wrapException(async (req: RestRequest, res: Response) => {
        req = parseQuery(req);

        // getModel - parent
        const modelType = await getModel(modelEntry, req);

        // preFetch - parent
        await preFetch(submethodConfig, req);

        // fetch - parent
        const fetchParentResult = await fetchOne(modelType, methodConfig, req);

        // postFetch - parent
        const postFetchParentResult = await postFetch(methodConfig, req, fetchParentResult);

        // Check parent
        if (!postFetchParentResult) {
            return res.status(404).json({
                code: ERROR_NOT_FOUND_CODE,
            });
        }
        else {
            const isReferenced = (propEntry.config as ArrayPropConfiguration<T, S>).ref; //!!submodelEntry.restConfig.ref;

            if (isReferenced) {
                // Create filter from parent references
                const refs = postFetchParentResult[propEntry.name];

                const entityExists = refs.contains(req.params.id);

                if (entityExists) {
                    return one({
                        type: propEntry.type as Constructor<S>,
                        restConfig: propEntry.restConfig,
                    }, submethodConfig);
                }
            }
            else {
                const fetchSubResult = postFetchParentResult[propEntry.name].find(item => item._id === req.params.id);

                // postFetch - sub
                const postFetchSubResult = await postFetch(submethodConfig, req, fetchSubResult);

                // preSend - sub
                const preSendSubResult = await preSend(submethodConfig, req, null, postFetchSubResult);

                return res.status(200).json(preSendSubResult);
            }
        }
    });
}

export function remove<T extends RestgooseModel>(modelEntry: RestModelEntry<T>, methodConfig: RestConfigurationMethod<T>) {
    return wrapException(async (req: RestRequest, res: Response) => {
        // getModel
        const modelType = await getModel(modelEntry, req);

        // preFetch
        await preFetch(methodConfig, req);

        // fetch
        const fetchResult = await fetchOne(modelType, methodConfig, req);

        // postFetch
        const postFetchResult = await postFetch(methodConfig, req, fetchResult);

        // Check
        if (!postFetchResult) {
            return res.status(404).json({
                code: ERROR_NOT_FOUND_CODE,
            });
        }
        else {
            // preSave
            await preSave(methodConfig, req, postFetchResult, null);

            // save
            await persistDeleteOne(modelType, methodConfig, req, postFetchResult);

            return res.status(204).end();
        }
    });
}

export function removeAll<T extends RestgooseModel>(modelEntry: RestModelEntry<T>, methodConfig: RestConfigurationMethod<T>) {
    return wrapException(async (req: RestRequest, res: Response) => {
        req = parseQuery(req);

        // getModel
        const modelType = await getModel(modelEntry, req);

        // preFetch
        await preFetch(methodConfig, req);

        // fetch
        const fetchResult = await fetchAll(modelType, methodConfig, req);

        // postFetch
        const postFetchResult = await postFetchAll(methodConfig, req, fetchResult);

        // preSave
        await preSaveAll(methodConfig, req, postFetchResult, new Array(postFetchResult.length).fill(null));

        // save
        await persistDeleteAll(modelType, methodConfig, req, postFetchResult);

        return res.status(204).end();
    });
}

export function update<T extends RestgooseModel>(modelEntry: RestModelEntry<T>, methodConfig: RestConfigurationMethod<T>) {
    return wrapException(async (req: RestRequest, res: Response) => {
        // getModel
        const modelType = await getModel(modelEntry, req);

        // preFetch
        await preFetch(methodConfig, req);

        // fetch
        const fetchResult = await fetchOne(modelType, methodConfig, req);

        // postFetch
        const postFetchResult = await postFetch(methodConfig, req, fetchResult);

        // Check
        if (!postFetchResult) {
            return res.status(404).json({
                code: ERROR_NOT_FOUND_CODE,
            });
        }
        else {
            // merge
            const payload = buildPayload(req, modelType);
            const prev = postFetchResult.toObject();
            //const mergeResult = Object.assign({}, postFetchResult, payload);

            // updates doc
            updateDocument(postFetchResult, payload);

            // preSave
            const preSaveResult = await preSave(methodConfig, req, prev, postFetchResult);

            // save
            const saveResult = await persistSave(methodConfig, req, prev, preSaveResult);

            // preSend
            const preSendResult = await preSend(methodConfig, req, prev, saveResult);

            return res.status(200).json(preSendResult);
        }
    });
}

/**
 * Deeply updates a mongoose document with a JSON object
 */
function updateDocument<T extends RestgooseModel>(entity: T & Document, payload: Dic) {
    for (const key in payload) {
        if (entity[key] instanceof Types.Subdocument) {
            updateDocument(entity[key], payload[key]);
        }
        else {
            entity[key] = payload[key];
        }
    }
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
                error = error as CastError;
                // tslint:disable-next-line:no-string-literal
                if (error.path === '_id') {
                    return res.status(404).json({
                        code: ERROR_NOT_FOUND_CODE,
                    });
                }
                else {
                    debug(error);
                    return res.status(400).json({
                        code: ERROR_BAD_FORMAT_CODE,
                        field: error.path,
                    });
                }
            }
            else if (error.name === ERROR_VALIDATION_NAME) {
                debug(error);
                return res.status(400).json({ code: ERROR_VALIDATION_CODE, errors: error.errors });
            }
            else {
                debug(error);
                return res.status(500).end();
            }
        }
    };
}
