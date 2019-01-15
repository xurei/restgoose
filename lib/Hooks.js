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
const mongoose = require("mongoose");
const getModel_1 = require("./getModel");
const RequestUtil_1 = require("./RequestUtil");
function getModel(modelEntry, req) {
    return __awaiter(this, void 0, void 0, function* () {
        // FIXME as any
        const connection = modelEntry.config.getConnection ? yield modelEntry.config.getConnection(req) : mongoose;
        const model = modelEntry.type;
        return getModel_1.getModel(connection, model);
    });
}
exports.getModel = getModel;
function preFetch(methodConfig, req) {
    return __awaiter(this, void 0, void 0, function* () {
        return methodConfig.preFetch ?
            methodConfig.preFetch(req) :
            Promise.resolve(true);
    });
}
exports.preFetch = preFetch;
function fetchAll(modelType, methodConfig, req) {
    return __awaiter(this, void 0, void 0, function* () {
        // TODO: getAll() remove req.filter from the default behaviour ?
        const query = (methodConfig.fetch ?
            methodConfig.fetch(req, modelType) :
            modelType.find(req.filter));
        return Promise.resolve((yield query) || []);
    });
}
exports.fetchAll = fetchAll;
function fetchCreate(modelType, methodConfig, req) {
    return __awaiter(this, void 0, void 0, function* () {
        return methodConfig.fetch ?
            methodConfig.fetch(req, modelType) :
            Promise.resolve(new modelType(RequestUtil_1.buildPayload(req, modelType)));
    });
}
exports.fetchCreate = fetchCreate;
function fetchOne(modelType, methodConfig, req) {
    return __awaiter(this, void 0, void 0, function* () {
        return methodConfig.fetch ?
            methodConfig.fetch(req, modelType) :
            modelType.findById(req.params.id);
    });
}
exports.fetchOne = fetchOne;
function postFetch(methodConfig, req, entity) {
    return __awaiter(this, void 0, void 0, function* () {
        const promise = Promise.resolve(entity);
        return methodConfig.postFetch ?
            promise.then(entity => entity && methodConfig.postFetch(req, entity)) :
            promise;
    });
}
exports.postFetch = postFetch;
function postFetchAll(methodConfig, req, entities) {
    return __awaiter(this, void 0, void 0, function* () {
        if (methodConfig.postFetch) {
            const out = yield Promise.all(entities.map((entity) => __awaiter(this, void 0, void 0, function* () { return entity && methodConfig.postFetch(req, entity); })));
            return out.filter(e => !!e);
        }
        else {
            return Promise.resolve(entities);
        }
    });
}
exports.postFetchAll = postFetchAll;
function preSave(methodConfig, req, oldEntity, newEntity) {
    return __awaiter(this, void 0, void 0, function* () {
        const promise = Promise.resolve(newEntity);
        return methodConfig.preSave ?
            promise.then(entity => entity && methodConfig.preSave(req, newEntity, oldEntity)) :
            promise;
    });
}
exports.preSave = preSave;
function preSaveAll(methodConfig, req, oldEntities, newEntities) {
    return __awaiter(this, void 0, void 0, function* () {
        return methodConfig.preSave ?
            Promise.all(newEntities.map((newEntity, index) => __awaiter(this, void 0, void 0, function* () { return methodConfig.preSave(req, oldEntities[index], newEntity, methodConfig.preSave); }))) :
            Promise.resolve(newEntities);
    });
}
exports.preSaveAll = preSaveAll;
function persistSave(methodConfig, entity) {
    return __awaiter(this, void 0, void 0, function* () {
        return methodConfig.persist ?
            yield methodConfig.persist(entity) :
            entity.save();
    });
}
exports.persistSave = persistSave;
function persistDeleteAll(modelType, methodConfig, entities) {
    return __awaiter(this, void 0, void 0, function* () {
        const out = entities.filter(e => !!e);
        return methodConfig.persist ?
            methodConfig.persist(entities) :
            modelType.deleteMany({ _id: { $in: out.map(e => e._id) } }).then(() => true);
    });
}
exports.persistDeleteAll = persistDeleteAll;
function persistDeleteOne(modelType, methodConfig, entity) {
    return __awaiter(this, void 0, void 0, function* () {
        return methodConfig.persist ?
            methodConfig.persist(entity) :
            modelType.deleteOne({ _id: entity._id }).then(() => true);
    });
}
exports.persistDeleteOne = persistDeleteOne;
function preSend(methodConfig, req, entity) {
    return __awaiter(this, void 0, void 0, function* () {
        const promise = Promise.resolve(entity);
        return methodConfig.preSend ?
            promise.then(entity => entity && methodConfig.preSend(req, entity)) :
            promise;
    });
}
exports.preSend = preSend;
function preSendAll(methodConfig, req, entities) {
    return __awaiter(this, void 0, void 0, function* () {
        return methodConfig.preSend ?
            Promise.all(entities.map((entity) => __awaiter(this, void 0, void 0, function* () { return methodConfig.preSend(req, entity, postFetch); }))) :
            Promise.resolve(entities);
    });
}
exports.preSendAll = preSendAll;
//# sourceMappingURL=Hooks.js.map