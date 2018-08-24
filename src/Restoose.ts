import { Router } from 'express';
import { Typegoose } from 'typegoose';
import { all, allWithin, create, createWithin, one, remove, update } from './RestController';
import { RestModelEntry, RestRegistry } from './RestRegistry';

export class Restoose {
    private static ROUTES = {
        all: { httpMethod: 'get', path: '/', fn: all },
        one: { httpMethod: 'get', path: '/:id', fn: one },
        create: { httpMethod: 'post', path: '/', fn: create },
        update: { httpMethod: 'put', path: '/:id', fn: update },
        remove: { httpMethod: 'delete', path: '/:id', fn: remove },
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

    private static createRestRoot<T extends Typegoose>(model: RestModelEntry<T>): Router {
        const router = Router();
        const targetModel = model.type.prototype.getModelForClass();

        const submodels = RestRegistry.listSubModelsOf(model.type.name);
        const methodOne = model.config.methods.find(m => m.method.toLowerCase() === 'one');

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
                routerFn(routePath, route.fn(targetModel, methodOne, submodel.property, targetSubModel, method));
            });
        }

        model.config.methods.forEach(method => {
            const route = this.ROUTES[method.method];
            const routerFn = router[route.httpMethod].bind(router);
            routerFn(route.path, route.fn(targetModel, method));
        });
        return router;
    }
}
