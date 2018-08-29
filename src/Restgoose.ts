import { Router } from 'express';
import { Typegoose } from 'typegoose';
import { debug } from './debug';
import { all, allWithin, create, createWithin, one, remove, removeAll, update } from './RestController';
import { getAll, getOne } from './RestController';
import { RestModelEntry, RestRegistry } from './RestRegistry';
import { Constructor, RestRequest } from './types';

export class Restgoose {
    private static ROUTES = {
        all: { httpMethod: 'get', path: '/', fn: all },
        one: { httpMethod: 'get', path: '/:id', fn: one },
        create: { httpMethod: 'post', path: '/', fn: create },
        update: { httpMethod: 'patch', path: '/:id', fn: update },
        remove: { httpMethod: 'delete', path: '/:id', fn: remove },
        removeAll: { httpMethod: 'delete', path: '/', fn: removeAll },
        custom: { httpMethod: 'delete', path: '/:id', fn: remove },
    };
    private static ROUTES_EMBED = {
        all: { httpMethod: 'get', path: '/', fn: allWithin },
        create: { httpMethod: 'post', path: '/', fn: createWithin },
        /*one: { httpMethod: 'get', path: '/:id', fn: RestController.one },
        create: { httpMethod: 'post', path: '/', fn: RestController.create },
        update: { httpMethod: 'put', path: '/:id', fn: RestController.update },
        delete: { httpMethod: 'delete', path: '/:id', fn: RestController.remove },
        remove: { httpMethod: 'delete', path: '/:id', fn: RestController.remove },*/
    };

    public static initialize(app) {
        const models = RestRegistry.listModels();
        for (const model of models) {
            app.use(model.config.route, this.createRestRoot(model));
        }
    }

    /**
     * Simulates a REST call on the method one() and passes the result through the
     * postFetch middlewares.
     * NOTE : preFetch middlewares are NOT called
     */
    public static async getOne<T extends Typegoose>(modelType: Constructor<T>, req: RestRequest): Promise<any> /* todo any */ {
        const model = RestRegistry.getModel(modelType);
        const method = model.config.methods.find(m => m.method === 'one');
        if (!method) {
            throw new Error(`On model ${modelType.name}: method one() is not specified. Cannot use getOne()`);
        }
        return getOne(model.type.prototype.getModelForClass(), method, req);
    }

    /**
     * Simulates a REST call on the method all() and passes the result through the
     * postFetch middlewares.
     * NOTE : preFetch middlewares are NOT called
     */
    public static async getAll<T extends Typegoose>(modelType: Constructor<T>, req: RestRequest): Promise<any> /* todo any */ {
        const model = RestRegistry.getModel(modelType);
        const method = model.config.methods.find(m => m.method === 'all');
        if (!method) {
            throw new Error(`On model ${modelType.name}: method all() is not specified. Cannot use getAll()`);
        }
        return getAll(model.type.prototype.getModelForClass(), method, req);
    }

    private static createRestRoot<T extends Typegoose>(model: RestModelEntry<T>): Router {
        const router = Router();
        const targetModel = model.type.prototype.getModelForClass();

        const submodels = RestRegistry.listSubModelsOf(model.type.name);
        const methodOne = model.config.methods.find(m => m.method.toLowerCase() === 'one');

        debug(`Building routes for model ${model.type.name}`);

        model.config.methods.forEach(method => {
            const route = this.ROUTES[method.method];
            const routerFn = router[route.httpMethod].bind(router);
            const controllerFn = route.fn(targetModel, method);
            debug(`  ${route.httpMethod.toUpperCase()} ${route.path}`);
            routerFn(route.path, controllerFn);
        });

        for (const submodel of submodels) {
            if (!methodOne) {
                throw new Error(`In model '${model.type.name}' : a nested REST route cannot be defined ` +
                `without a root 'one' route`);
            }

            const schema = targetModel.schema.obj[submodel.property][0];
            const targetSubModel = schema.ref.prototype.getModelForClass();
            submodel.config.methods.forEach(method => {
                const route = this.ROUTES_EMBED[method.method];
                const routerFn = router[route.httpMethod].bind(router);
                const routePath = `/:id${submodel.config.route}${route.path}`;
                const controllerFn = route.fn(targetModel, methodOne, submodel.property, targetSubModel, method);
                debug(`  ${route.httpMethod.toUpperCase()} ${routePath}`);
                routerFn(routePath, controllerFn);
            });
        }

        return router;
    }
}
