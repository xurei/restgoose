import { Response, Router } from 'express';
import { InstanceType, Typegoose } from 'typegoose';
import { debug } from './debug';
import { fetchAll, fetchOne, getModel, postFetch, postFetchAll, preSend } from './Hooks';
import { all, allWithin, create, createWithin, one, remove, removeAll, update } from './RestController';
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
    };

    public static initialize(modelTypes?: Constructor<Typegoose>[]) {
        const models = RestRegistry.listModels();
        const router = Router();
        for (const model of models) {
            if (!modelTypes || !!modelTypes.find(m => m.name === model.type.name)) {
                router.use(model.config.route, this.createRestRoot(model));
            }
        }
        return router as any;
    }

    /**
     * Simulates a REST call on the method one() and passes the result through the
     * postFetch middlewares.
     * NOTE : preFetch middlewares are NOT called
     */
    public static async getOne<T extends Typegoose>(modelType: Constructor<T>, req: RestRequest): Promise<any> /* todo any */ {
        const model = RestRegistry.getModel(modelType);
        const methods = model.config.methods || [];
        const method = methods.find(m => m.method === 'one');
        if (!method) {
            throw new Error(`On model ${modelType.name}: primivite one() is not specified. Cannot use getOne()`);
        }

        const result = await fetchOne(await getModel(model, req), method, req);
        return postFetch(method, req, result);
    }

    /**
     * Passes the entity through the preSend of its one() primivite
     */
    public static async sendOne<T extends Typegoose>(
        modelType: Constructor<T>, entity: InstanceType<T>, req: RestRequest,
        res: Response, status: number = 200): Promise<any> /* TODO change any if possible */ {
        const model = RestRegistry.getModel(modelType);
        const methods = model.config.methods || [];
        const method = methods.find(m => m.method === 'one');
        if (!method) {
            throw new Error(`On model ${modelType.name}: primivite one() is not specified. Cannot use getOne()`);
        }

        const preSendResult = await preSend(method, req, entity);

        res.status(status).json(preSendResult.toJSON());
    }

    /**
     * Simulates a REST call on the method all() and passes the result through the
     * postFetch middlewares.
     * NOTE : preFetch middlewares are NOT called
     */
    public static async getAll<T extends Typegoose>(modelType: Constructor<T>, req: RestRequest): Promise<any> /* todo any */ {
        const model = RestRegistry.getModel(modelType);
        const methods = model.config.methods || [];
        const method = methods.find(m => m.method === 'all');
        if (!method) {
            throw new Error(`On model ${modelType.name}: method all() is not specified. Cannot use getAll()`);
        }

        const result = await fetchAll(await getModel(model, req), method, req);
        return postFetchAll(method, req, result);
    }

    private static createRestRoot<T extends Typegoose>(model: RestModelEntry<T>): Router {
        const router = Router();

        debug(`Building routes for model ${model.type.name}`);

        const methods = model.config.methods || [];
        methods.forEach(method => {
            const route = this.ROUTES[method.method];
            const routerFn = router[route.httpMethod].bind(router);
            const controllerFn = route.fn(model, method);
            debug(`  ${route.httpMethod.toUpperCase()} ${route.path}`);
            routerFn(route.path, controllerFn);
        });

        const methodOne = methods.find(m => m.method.toLowerCase() === 'one');
        const submodels = RestRegistry.listSubModelsOf(model.type);
        for (let submodel of submodels) {
            if (!methodOne) {
                throw new Error(`In model '${model.type.name}' : a nested REST route cannot be defined ` +
                `without a root 'one' route`);
            }

            // Alter the submodels so the type attribute matches the submodel and not the parent model. This is done here
            // so that all classes are initialized before we call getModelForClass() internally
            // TODO find a way out of buildSchema() : typegoose caches it badly...
            const parentSchema = submodel.type.prototype.buildSchema(submodel.type, submodel.type.name);
            submodel = Object.assign({}, submodel);
            submodel.type = parentSchema.tree[submodel.property][0].ref;

            const submethods = submodel.config.methods || [];
            submethods.forEach(method => {
                const route = this.ROUTES_EMBED[method.method];
                const routerFn = router[route.httpMethod].bind(router);
                const routePath = `/:id${submodel.config.route}${route.path}`;
                const controllerFn = route.fn(model, methodOne, submodel.property, submodel, method);
                debug(`  ${route.httpMethod.toUpperCase()} ${routePath}`);
                routerFn(routePath, controllerFn);
            });
        }

        return router;
    }
}
