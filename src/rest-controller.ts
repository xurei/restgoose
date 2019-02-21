import { Response } from 'express';
import { CastError } from 'mongoose';
import { Typegoose } from 'typegoose';
import {
    fetchAll, fetchCreate, fetchOne, getModel,
    persistDeleteAll, persistDeleteOne,
    persistSave, postFetch, postFetchAll, preFetch, preSave,
    preSaveAll, preSend, preSendAll,
} from './hooks';
import { parseQuery } from './parse-query';
import { buildPayload } from './request-util';
import { RestConfigurationMethod, RestError } from './rest';
import { RestModelEntry } from './rest-registry';
import { RestRequest } from './types';

export const ERROR_FORBIDDEN_CODE: string = 'FORBIDDEN';
export const ERROR_NOT_FOUND_CODE: string = 'NOT_FOUND';
export const ERROR_READONLY_CODE: string = 'READ_ONLY';
export const ERROR_VALIDATION_CODE: string = 'BAD_DATA';
export const ERROR_VALIDATION_NAME: string = 'ValidationError';
export const ERROR_BAD_FORMAT_CODE: string = 'BAD_FORMAT';

export function all<T extends Typegoose>(modelEntry: RestModelEntry<T>, methodConfig: RestConfigurationMethod<T>) {
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

export function allWithin<T extends Typegoose>(
    modelEntry: RestModelEntry<T>, methodConfig: RestConfigurationMethod<T>, property: string,
    submodelEntry: RestModelEntry<T>, submethodConfig: RestConfigurationMethod<T>) {
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
            const isReferenced = !!submodelEntry.type;

            let fetchSubResult;
            if (isReferenced) {
                // Create filter from parent references
                const refs = postFetchParentResult[property];
                req = Object.assign({}, req);
                req.restgoose.query = Object.assign({}, req.restgoose.query || {}, {
                    _id: { $in: refs },
                });

                // getModel - sub
                const submodelType = await getModel(submodelEntry, req);

                // fetch - sub
                fetchSubResult = await fetchAll(submodelType, submethodConfig, req);
            }
            else {
                fetchSubResult = postFetchParentResult[property];
            }

            // postFetch - sub
            const postFetchSubResult = await postFetchAll(submethodConfig, req, fetchSubResult);

            // preSend - sub
            const preSendSubResult = await preSendAll(methodConfig, req, postFetchSubResult);

            return res.status(200).json(preSendSubResult);
        }
    });
}

export function create<T extends Typegoose>(modelEntry: RestModelEntry<T>, methodConfig: RestConfigurationMethod<T>) {
    return wrapException(async (req: RestRequest, res: Response) => {
        // getModel
        const modelType = await getModel(modelEntry, req);

        // preFetch
        await preFetch(methodConfig, req);

        // fetch
        const fetchResult = await fetchCreate(modelType, methodConfig, req);

        // postFetch
        const postFetchResult = await postFetch(methodConfig, req, fetchResult);

        if (!postFetchResult) {
            return res.status(404).json({
                code: ERROR_NOT_FOUND_CODE,
            });
        }
        else {
            // preSave
            const preSaveResult = await preSave(methodConfig, req, null, postFetchResult);

            // save
            const saveResult = await persistSave(methodConfig, preSaveResult);

            // preSend
            const preSendResult = await preSend(methodConfig, req, saveResult);

            res.status(201).json(preSendResult);
        }
    });
}

export function createWithin<T extends Typegoose>(
    modelEntry: RestModelEntry<T>, methodConfig: RestConfigurationMethod<T>, property: string,
    submodelEntry: RestModelEntry<T>, submethodConfig: RestConfigurationMethod<T>) {
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
            const isReferenced = !!submodelEntry.type;
            let saveSubResult;
            postFetchParentResult[property] = postFetchParentResult[property] || [];
            if (isReferenced) {
                // getModel - sub
                const submodelType = await getModel(submodelEntry, req);

                // fetch - sub
                const fetchSubResult = await fetchCreate(submodelType, submethodConfig, req);

                // postFetch - sub
                const postFetchSubResult = await postFetch(submethodConfig, req, fetchSubResult);

                // save - sub
                saveSubResult = await persistSave(submethodConfig, postFetchSubResult);

                // save - parent
                postFetchParentResult[property].push(saveSubResult._id);
                await persistSave(methodConfig, postFetchParentResult);
            }
            else {
                // save - parent
                postFetchParentResult[property].push(req.body);
                const parentSaveResult = await persistSave(methodConfig, postFetchParentResult);
                saveSubResult = parentSaveResult[property][parentSaveResult[property].length - 1];
            }

            // preSend - sub
            const preSendSubResult = await preSend(submethodConfig, req, saveSubResult);

            return res.status(201).json(preSendSubResult);
        }
    });
}

export function one<T extends Typegoose>(modelEntry: RestModelEntry<T>, methodConfig: RestConfigurationMethod<T>) {
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
            const preSendResult = await preSend(methodConfig, req, postFetchResult);

            return res.status(200).json(preSendResult);
        }
    });
}

export function remove<T extends Typegoose>(modelEntry: RestModelEntry<T>, methodConfig: RestConfigurationMethod<T>) {
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
            await persistDeleteOne(modelType, methodConfig, postFetchResult);

            return res.status(204).end();
        }
    });
}

export function removeAll<T extends Typegoose>(modelEntry: RestModelEntry<T>, methodConfig: RestConfigurationMethod<T>) {
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
        await persistDeleteAll(modelType, methodConfig, postFetchResult);

        return res.status(204).end();
    });
}

export function update<T extends Typegoose>(modelEntry: RestModelEntry<T>, methodConfig: RestConfigurationMethod<T>) {
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
            const mergeResult = Object.assign(postFetchResult, payload);

            // preSave
            const preSaveResult = await preSave(methodConfig, req, prev, mergeResult);

            // save
            const saveResult = await persistSave(methodConfig, preSaveResult);

            // preSend
            const preSendResult = await preSend(methodConfig, req, saveResult);

            return res.status(200).json(preSendResult);
        }
    });
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
                    return res.status(400).json({
                        code: ERROR_BAD_FORMAT_CODE,
                        field: error.path,
                    });
                }
            }
            else if (error.name === ERROR_VALIDATION_NAME) {
                return res.status(400).json({ code: ERROR_VALIDATION_CODE, errors: error.errors });
            }
            else {
                console.error(error);
                return res.status(500).end();
            }
        }
    };
}
