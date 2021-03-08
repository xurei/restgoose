import { ArrayPropConfiguration } from './decorators/array-prop';
import { PropConfiguration } from './decorators/prop';
import { RestConfiguration } from './decorators/rest';
import { RestgooseModel } from './restgoose-model';
import { Constructor } from './types';

/*
    TODO we should replace the RestRegistry maps by a set, and store all the models that way.
    the name can be used by multiple models, this will overwrite the config of some
*/

export declare interface RestModelEntry<T extends RestgooseModel> {
    type: Constructor<T>;
    restConfig: RestConfiguration<T>;
}

export declare interface RestPropEntry<T extends RestgooseModel> {
    // tslint:disable-next-line
    type: Constructor<T | Number | String | Boolean | Date>;
    config: PropConfiguration<T>;
    name: string;
    restConfig?: RestConfiguration<T>;
}

export declare interface HookEntry {
    type: 'pre' | 'post';
    action: string;
    method: (...args) => any;
}

const hooks: Map<string, HookEntry[]> =
    new Map<string, HookEntry[]>();
const models: Map<string, RestModelEntry<any>> =
    new Map<string, RestModelEntry<any>>();
const properties: Map<string, Map<string, RestPropEntry<any>>> =
    new Map<string, Map<string, RestPropEntry<any>>>();
/*const submodels: Map<string, Map<string, RestSubmodelEntry<any>>> =
    new Map<string, Map<string, RestSubmodelEntry<any>>>();*/

const RestRegistry = {
    registerModel<T extends RestgooseModel>(modelType: Constructor<T>, config: RestConfiguration<T>) {
        models.set(modelType.name, {
            type: modelType,
            restConfig: config,
        });
    },

    registerProperty<T extends RestgooseModel, S extends RestgooseModel>(modelType: Constructor<T>, propertyKey: string,
                                                                         Type: any, config: PropConfiguration<T> | ArrayPropConfiguration<T, S>) {
        if (!properties.has(modelType.name)) {
            properties.set(modelType.name, new Map<string, RestPropEntry<any>>());
        }
        const entry: RestPropEntry<T> = properties.get(modelType.name).get(propertyKey) || {
            type: Type,
            name: propertyKey,
            config: null,
        };
        entry.config = config;
        properties.get(modelType.name).set(propertyKey, entry);
    },

    registerHook<T extends RestgooseModel>(modelType: Constructor<T>, type: 'pre' | 'post', action: string, method: (...args) => any) {
        if (!hooks.has(modelType.name)) {
            hooks.set(modelType.name, []);
        }

        const hooksArray = hooks.get(modelType.name);
        hooksArray.push({
            type: type,
            action: action,
            method: method,
        });
    },

    registerSubrest<T extends RestgooseModel>(modelType: Constructor<T>, propertyKey: string, config: RestConfiguration<T>) {
        if (!properties.has(modelType.name)) {
            properties.set(modelType.name, new Map<string, RestPropEntry<any>>());
        }
        const entry: RestPropEntry<T> = properties.get(modelType.name).get(propertyKey) || {
            type: modelType,
            name: propertyKey,
            config: null,
        };
        entry.restConfig = config;
        properties.get(modelType.name).set(propertyKey, entry);
    },

    getModel<T extends RestgooseModel>(modelType: Constructor<T>): RestModelEntry<RestgooseModel> {
        return models.get(modelType.name);
    },

    getPropertyOf<T extends RestgooseModel>(modelType: Constructor<T>, name: string): RestPropEntry<any> {
        return properties.get(modelType.name).get(name);
    },

    listModels(): Iterable<RestModelEntry<RestgooseModel>> {
        return models.values();
    },

    listHooksOf<T extends RestgooseModel>(modelType: Constructor<T>): Iterable<HookEntry> {
        const map = hooks.get(modelType.name);
        return map || [];
    },

    listPropertiesOf<T extends RestgooseModel>(modelType: Constructor<T>): Iterable<RestPropEntry<RestgooseModel>> {
        const map = properties.get(modelType.name);
        if (map) {
            return map.values();
        }
        else {
            return [];
        }
    },

    listSubrestsOf<T extends RestgooseModel>(modelType: Constructor<T>): Iterable<RestPropEntry<RestgooseModel>> {
        const map = properties.get(modelType.name);
        if (map) {
            const out = [];
            for (const entry of map.values()) {
                if (entry.restConfig) {
                    out.push(entry);
                }
            }
            return out;
        }
        else {
            return [];
        }
    },
};

export { RestRegistry };
