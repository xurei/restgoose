"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const Hooks_1 = require("./Hooks");
const RequestUtil_1 = require("./RequestUtil");
const rest_1 = require("./rest");
exports.ERROR_FORBIDDEN_CODE = 'FORBIDDEN';
exports.ERROR_NOT_FOUND_CODE = 'NOT_FOUND';
exports.ERROR_READONLY_CODE = 'READ_ONLY';
exports.ERROR_VALIDATION_CODE = 'BAD_DATA';
exports.ERROR_VALIDATION_NAME = 'ValidationError';
function all(modelEntry, methodConfig) {
    return wrapException((req, res) => __awaiter(this, void 0, void 0, function* () {
        // getModel
        const modelType = yield Hooks_1.getModel(modelEntry, req);
        // preFetch
        yield Hooks_1.preFetch(methodConfig, req);
        // fetch
        const fetchResult = yield Hooks_1.fetchAll(modelType, methodConfig, req);
        // postFetch
        const postFetchResult = yield Hooks_1.postFetchAll(methodConfig, req, fetchResult);
        // preSend
        const preSendResult = yield Hooks_1.preSendAll(methodConfig, req, postFetchResult);
        return res.status(200).json(preSendResult);
    }));
}
exports.all = all;
function allWithin(modelEntry, methodConfig, property, submodelEntry, submethodConfig) {
    return wrapException((req, res) => __awaiter(this, void 0, void 0, function* () {
        // getModel - parent
        const modelType = yield Hooks_1.getModel(modelEntry, req);
        // preFetch - parent
        yield Hooks_1.preFetch(submethodConfig, req);
        // fetch - parent
        const fetchParentResult = yield Hooks_1.fetchOne(modelType, methodConfig, req);
        // postFetch - parent
        const postFetchParentResult = yield Hooks_1.postFetch(methodConfig, req, fetchParentResult);
        // Check parent
        if (!postFetchParentResult) {
            return res.status(404).json({
                code: exports.ERROR_NOT_FOUND_CODE,
            });
        }
        else {
            // Create filter from parent references
            const refs = postFetchParentResult[property];
            req = Object.assign({}, req);
            req.filter = Object.assign({}, req.filter || {}, {
                _id: { $in: refs },
            });
            // getModel - sub
            const submodelType = yield Hooks_1.getModel(submodelEntry, req);
            // fetch - sub
            const fetchSubResult = yield Hooks_1.fetchAll(submodelType, submethodConfig, req);
            // postFetch - sub
            const postFetchSubResult = yield Hooks_1.postFetchAll(submethodConfig, req, fetchSubResult);
            // preSend -sub
            const preSendSubResult = yield Hooks_1.preSendAll(methodConfig, req, postFetchSubResult);
            return res.status(200).json(preSendSubResult);
        }
    }));
}
exports.allWithin = allWithin;
function create(modelEntry, methodConfig) {
    return wrapException((req, res) => __awaiter(this, void 0, void 0, function* () {
        // getModel
        const modelType = yield Hooks_1.getModel(modelEntry, req);
        // preFetch
        yield Hooks_1.preFetch(methodConfig, req);
        // fetch
        const fetchResult = yield Hooks_1.fetchCreate(modelType, methodConfig, req);
        // postFetch
        const postFetchResult = yield Hooks_1.postFetch(methodConfig, req, fetchResult);
        // preSave
        const preSaveResult = yield Hooks_1.preSave(methodConfig, req, null, postFetchResult);
        // save
        const saveResult = yield Hooks_1.persistSave(methodConfig, preSaveResult);
        // preSend
        const preSendResult = yield Hooks_1.preSend(methodConfig, req, saveResult);
        res.status(201).json(preSendResult);
    }));
}
exports.create = create;
function createWithin(modelEntry, methodConfig, property, submodelEntry, submethodConfig) {
    return wrapException((req, res) => __awaiter(this, void 0, void 0, function* () {
        // getModel - parent
        const modelType = yield Hooks_1.getModel(modelEntry, req);
        // preFetch - parent
        yield Hooks_1.preFetch(submethodConfig, req);
        // fetch - parent
        const fetchParentResult = yield Hooks_1.fetchOne(modelType, methodConfig, req);
        // postFetch - parent
        const postFetchParentResult = yield Hooks_1.postFetch(methodConfig, req, fetchParentResult);
        // Check parent
        if (!postFetchParentResult) {
            return res.status(404).json({
                code: exports.ERROR_NOT_FOUND_CODE,
            });
        }
        else {
            // getModel - sub
            const submodelType = yield Hooks_1.getModel(submodelEntry, req);
            // fetch - sub
            const fetchSubResult = yield Hooks_1.fetchCreate(submodelType, submethodConfig, req);
            // postFetch - sub
            const postFetchSubResult = yield Hooks_1.postFetch(submethodConfig, req, fetchSubResult);
            // save - sub
            const saveSubResult = yield Hooks_1.persistSave(submethodConfig, postFetchSubResult);
            // save - parent
            postFetchParentResult[property].push(saveSubResult._id);
            yield Hooks_1.persistSave(methodConfig, postFetchParentResult);
            // preSend - sub
            const preSendSubResult = yield Hooks_1.preSend(submethodConfig, req, saveSubResult);
            return res.status(201).json(preSendSubResult);
        }
    }));
}
exports.createWithin = createWithin;
function one(modelEntry, methodConfig) {
    return wrapException((req, res) => __awaiter(this, void 0, void 0, function* () {
        // getModel
        const modelType = yield Hooks_1.getModel(modelEntry, req);
        // preFetch
        yield Hooks_1.preFetch(methodConfig, req);
        // fetch
        const fetchResult = yield Hooks_1.fetchOne(modelType, methodConfig, req);
        // postFetch
        const postFetchResult = yield Hooks_1.postFetch(methodConfig, req, fetchResult);
        // Check
        if (!postFetchResult) {
            return res.status(404).json({
                code: exports.ERROR_NOT_FOUND_CODE,
            });
        }
        else {
            // preSend
            const preSendResult = yield Hooks_1.preSend(methodConfig, req, postFetchResult);
            return res.status(200).json(preSendResult);
        }
    }));
}
exports.one = one;
function remove(modelEntry, methodConfig) {
    return wrapException((req, res) => __awaiter(this, void 0, void 0, function* () {
        // getModel
        const modelType = yield Hooks_1.getModel(modelEntry, req);
        // preFetch
        yield Hooks_1.preFetch(methodConfig, req);
        // fetch
        const fetchResult = yield Hooks_1.fetchOne(modelType, methodConfig, req);
        // postFetch
        const postFetchResult = yield Hooks_1.postFetch(methodConfig, req, fetchResult);
        // Check
        if (!postFetchResult) {
            return res.status(404).json({
                code: exports.ERROR_NOT_FOUND_CODE,
            });
        }
        else {
            // preSave
            yield Hooks_1.preSave(methodConfig, req, postFetchResult, null);
            // save
            yield Hooks_1.persistDeleteOne(modelType, methodConfig, postFetchResult);
            return res.status(204).end();
        }
    }));
}
exports.remove = remove;
function removeAll(modelEntry, methodConfig) {
    return wrapException((req, res) => __awaiter(this, void 0, void 0, function* () {
        // getModel
        const modelType = yield Hooks_1.getModel(modelEntry, req);
        // preFetch
        yield Hooks_1.preFetch(methodConfig, req);
        // fetch
        const fetchResult = yield Hooks_1.fetchAll(modelType, methodConfig, req);
        // postFetch
        const postFetchResult = yield Hooks_1.postFetchAll(methodConfig, req, fetchResult);
        // preSave
        yield Hooks_1.preSaveAll(methodConfig, req, postFetchResult, new Array(postFetchResult.length).fill(null));
        // save
        yield Hooks_1.persistDeleteAll(modelType, methodConfig, postFetchResult);
        return res.status(204).end();
    }));
}
exports.removeAll = removeAll;
function update(modelEntry, methodConfig) {
    return wrapException((req, res) => __awaiter(this, void 0, void 0, function* () {
        // getModel
        const modelType = yield Hooks_1.getModel(modelEntry, req);
        // preFetch
        yield Hooks_1.preFetch(methodConfig, req);
        // fetch
        const fetchResult = yield Hooks_1.fetchOne(modelType, methodConfig, req);
        // postFetch
        const postFetchResult = yield Hooks_1.postFetch(methodConfig, req, fetchResult);
        // Check
        if (!postFetchResult) {
            return res.status(404).json({
                code: exports.ERROR_NOT_FOUND_CODE,
            });
        }
        else {
            // merge
            const payload = RequestUtil_1.buildPayload(req, modelType);
            const prev = postFetchResult.toObject();
            const mergeResult = Object.assign(postFetchResult, payload);
            // preSave
            const preSaveResult = yield Hooks_1.preSave(methodConfig, req, prev, mergeResult);
            // save
            const saveResult = yield Hooks_1.persistSave(methodConfig, preSaveResult);
            // preSend
            const preSendResult = yield Hooks_1.preSend(methodConfig, req, saveResult);
            return res.status(200).json(preSendResult);
        }
    }));
}
exports.update = update;
// Centralize exception management
function wrapException(fn) {
    return (req, res) => __awaiter(this, void 0, void 0, function* () {
        try {
            return yield fn.bind(this)(req, res);
        }
        catch (error) {
            if (error instanceof rest_1.RestError) {
                const restError = error;
                return res.status(restError.httpCode).send(restError.errorData);
            }
            else if (error instanceof mongoose_1.CastError) {
                // tslint:disable-next-line:no-string-literal
                if (error['path'] === '_id') {
                    return res.status(404).json({
                        code: exports.ERROR_NOT_FOUND_CODE,
                    });
                }
            }
            else if (error.name === exports.ERROR_VALIDATION_NAME) {
                return res.status(400).send({ code: exports.ERROR_VALIDATION_CODE, errors: error.errors });
            }
            else {
                console.error(error);
                return res.status(500).end();
            }
        }
    });
}
//# sourceMappingURL=RestController.js.map