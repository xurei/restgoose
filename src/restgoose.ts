import { Router } from 'express';
import { debug } from './debug';
import { RestError } from './decorators/rest';
import { all, allWithin, create, createWithin, one, oneWithin, remove, removeAll, update } from './rest-controller';
import { RestModelEntry, RestRegistry } from './rest-registry';
import { RestgooseConnector } from './restgoose-connector';
import { RestgooseModel } from './restgoose-model';
import { isPrimitive } from './type-checks';
import { Constructor, RestRequest } from './types';

export let restgooseConnector: RestgooseConnector;

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
        one: { httpMethod: 'get', path: '/', fn: oneWithin },
        create: { httpMethod: 'post', path: '/', fn: createWithin },
    };
    public static onError: ((req: RestRequest, error: any) => Promise<RestError>) = null;
    public static get connector(): RestgooseConnector {
        return restgooseConnector;
    }

    public static setConnector(connector?: RestgooseConnector) {
        restgooseConnector = connector;
        console.log('Connector set !');
    }

    public static initialize(modelTypes?: Constructor<RestgooseModel>[]) {
        const models = RestRegistry.listModels();
        const router = Router();
        for (const model of models) {
            if (!modelTypes || !!modelTypes.find(m => m.name === model.type.name)) {
                router.use(model.restConfig.route, this.createRestRoot(model));
            }
        }
        return router as any;
    }

    private static createRestRoot<T extends RestgooseModel>(model: RestModelEntry<T>): Router {
        const router = Router();

        debug(`Building routes for model ${model.type.name}`);

        const methods = model.restConfig.methods || [];
        methods.forEach(method => {
            const route = this.ROUTES[method.method];
            const routerFn = router[route.httpMethod].bind(router);
            const controllerFn = route.fn(model, method);
            debug(`  ${route.httpMethod.toUpperCase()} ${route.path}`);
            routerFn(route.path, controllerFn);
        });

        const methodOne = methods.find(m => m.method.toLowerCase() === 'one');
        const submodels = RestRegistry.listSubrestsOf(model.type);
        //const schema = model.type.prototype.buildSchema();
        for (let submodel of submodels) {
            if (!methodOne) {
                // TODO create a specific error class for Restgoose init errors
                throw new Error(`In model '${model.type.name}' : a nested REST route cannot be defined without a root 'one' route`);
            }

            // Alter the submodels so the type attribute matches the submodel and not the parent model. This is done here
            // so that all classes are initialized before we call buildSchema() internally
            // if (!isPrimitive(submodel.type[0])) {
            //     //const parentSchema = submodel.type[0].prototype.buildSchema();
            //     submodel = Object.assign({}, submodel);
            //     const subtype = schema.tree[submodel.name][0];
            //     if (subtype && subtype.ref) {
            //         const descriptor = Object.getOwnPropertyDescriptor(subtype, 'ref');
            //         if (descriptor.value.prototype) {
            //             // This is a referenced submodel. We set its type in the definition
            //             submodel.type = schema.tree[submodel.name][0].ref;
            //         }
            //     }
            // }

            const submethods = submodel.restConfig.methods || [];
            submethods.forEach(method => {
                const route = this.ROUTES_EMBED[method.method];
                const routerFn = router[route.httpMethod].bind(router);
                const routePath = `/:id${submodel.restConfig.route}${route.path}`;
                const controllerFn = route.fn(model, methodOne, submodel, method);
                debug(`  ${route.httpMethod.toUpperCase()} ${routePath}`);
                routerFn(routePath, controllerFn);
            });
        }

        return router;
    }
}
