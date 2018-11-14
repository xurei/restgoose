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
const express_1 = require("express");
const debug_1 = require("./debug");
const Hooks_1 = require("./Hooks");
const RestController_1 = require("./RestController");
const RestRegistry_1 = require("./RestRegistry");
class Restgoose {
    static initialize() {
        const models = RestRegistry_1.RestRegistry.listModels();
        const router = express_1.Router();
        for (const model of models) {
            router.use(model.config.route, this.createRestRoot(model));
        }
        return router;
    }
    /**
     * Simulates a REST call on the method one() and passes the result through the
     * postFetch middlewares.
     * NOTE : preFetch middlewares are NOT called
     */
    static getOne(modelType, req) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = RestRegistry_1.RestRegistry.getModel(modelType);
            const methods = model.config.methods || [];
            const method = methods.find(m => m.method === 'one');
            if (!method) {
                throw new Error(`On model ${modelType.name}: method one() is not specified. Cannot use getOne()`);
            }
            const result = yield Hooks_1.fetchOne(yield Hooks_1.getModel(model, req), method, req);
            return Hooks_1.postFetch(method, req, result);
        });
    }
    /**
     * Simulates a REST call on the method all() and passes the result through the
     * postFetch middlewares.
     * NOTE : preFetch middlewares are NOT called
     */
    static getAll(modelType, req) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = RestRegistry_1.RestRegistry.getModel(modelType);
            const methods = model.config.methods || [];
            const method = methods.find(m => m.method === 'all');
            if (!method) {
                throw new Error(`On model ${modelType.name}: method all() is not specified. Cannot use getAll()`);
            }
            const result = yield Hooks_1.fetchAll(yield Hooks_1.getModel(model, req), method, req);
            return Hooks_1.postFetchAll(method, req, result);
        });
    }
    static createRestRoot(model) {
        const router = express_1.Router();
        debug_1.debug(`Building routes for model ${model.type.name}`);
        const methods = model.config.methods || [];
        methods.forEach(method => {
            const route = this.ROUTES[method.method];
            const routerFn = router[route.httpMethod].bind(router);
            const controllerFn = route.fn(model, method);
            debug_1.debug(`  ${route.httpMethod.toUpperCase()} ${route.path}`);
            routerFn(route.path, controllerFn);
        });
        const methodOne = methods.find(m => m.method.toLowerCase() === 'one');
        const submodels = RestRegistry_1.RestRegistry.listSubModelsOf(model.type);
        for (let submodel of submodels) {
            if (!methodOne) {
                throw new Error(`In model '${model.type.name}' : a nested REST route cannot be defined ` +
                    `without a root 'one' route`);
            }
            // Alter the submodels so the type attribute matches the submodel and not the parent model. This is done here
            // so that all classes are initialized before we call getModelForClass() internally
            // TODO find a way out of getModelForClass() : typegoose caches it badly...
            const parentModel = submodel.type.prototype.getModelForClass(submodel.type);
            submodel = Object.assign({}, submodel);
            submodel.type = parentModel.schema.tree[submodel.property][0].ref;
            const submethods = submodel.config.methods || [];
            submethods.forEach(method => {
                const route = this.ROUTES_EMBED[method.method];
                const routerFn = router[route.httpMethod].bind(router);
                const routePath = `/:id${submodel.config.route}${route.path}`;
                const controllerFn = route.fn(model, methodOne, submodel.property, submodel, method);
                debug_1.debug(`  ${route.httpMethod.toUpperCase()} ${routePath}`);
                routerFn(routePath, controllerFn);
            });
        }
        return router;
    }
}
Restgoose.ROUTES = {
    all: { httpMethod: 'get', path: '/', fn: RestController_1.all },
    one: { httpMethod: 'get', path: '/:id', fn: RestController_1.one },
    create: { httpMethod: 'post', path: '/', fn: RestController_1.create },
    update: { httpMethod: 'patch', path: '/:id', fn: RestController_1.update },
    remove: { httpMethod: 'delete', path: '/:id', fn: RestController_1.remove },
    removeAll: { httpMethod: 'delete', path: '/', fn: RestController_1.removeAll },
    custom: { httpMethod: 'delete', path: '/:id', fn: RestController_1.remove },
};
Restgoose.ROUTES_EMBED = {
    all: { httpMethod: 'get', path: '/', fn: RestController_1.allWithin },
    create: { httpMethod: 'post', path: '/', fn: RestController_1.createWithin },
};
exports.Restgoose = Restgoose;
//# sourceMappingURL=Restgoose.js.map