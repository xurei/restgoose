import { RestConfiguration } from './decorators/rest';
import { Constructor } from './types';
import { RestgooseModel } from './restgoose-model';
import { PropConfiguration } from './decorators/prop';

/*
    TODO we should replace the RestRegistry maps by a set, and store all the models that way.
    the name can be used by multiple models, this will overwrite the config of some
*/

export declare interface RestModelEntry<T extends RestgooseModel> {
    type: Constructor<T>;
    config: RestConfiguration<T>;
}

export declare interface RestPropEntry<T extends RestgooseModel> {
    type: any;
    config: PropConfiguration<T>;
    name: string;
}

export declare interface RestSubmodelEntry<T extends RestgooseModel> {
    type: Constructor<T>;
    config: RestConfiguration<T>;
    property: string;
}

const models: Map<string, RestModelEntry<any>> =
    new Map<string, RestModelEntry<any>>();
const properties: Map<string, Map<string, RestPropEntry<any>>> =
    new Map<string, Map<string, RestPropEntry<any>>>();
const submodels: Map<string, Map<string, RestSubmodelEntry<any>>> =
    new Map<string, Map<string, RestSubmodelEntry<any>>>();

const RestRegistry = {
    registerModel<T extends RestgooseModel>(modelType: Constructor<T>, config: RestConfiguration<T>) {
        models.set(modelType.name, {
            type: modelType,
            config,
        });
    },

    registerProperty<T extends RestgooseModel>(modelType: Constructor<T>, propertyKey: string, Type: any, config: PropConfiguration<T>) {
        if (!properties.has(modelType.name)) {
            properties.set(modelType.name, new Map<string, RestPropEntry<any>>());
        }
        properties.get(modelType.name).set(propertyKey, {
            type: Type,
            name: propertyKey,
            config,
        });
    },

    registerSubmodel<T extends RestgooseModel>(modelType: Constructor<T>, propertyKey: string, config: RestConfiguration<T>) {
        if (!submodels.has(modelType.name)) {
            submodels.set(modelType.name, new Map<string, RestSubmodelEntry<any>>());
        }
        submodels.get(modelType.name).set(propertyKey, {
            type: modelType,
            property: propertyKey,
            config,
        });
    },

    getModel<T extends RestgooseModel>(modelType: Constructor<T>): RestModelEntry<RestgooseModel> {
        return models.get(modelType.name);
    },

    listModels(): Iterable<RestModelEntry<RestgooseModel>> {
        return models.values();
    },

    listPropertiesOf<T extends RestgooseModel>(modelType: Constructor<T>): Iterable<RestPropEntry<RestgooseModel>> {
        const map = properties.get(modelType.name);
        if (map) {
            return properties.get(modelType.name).values();
        }
        else {
            return [];
        }
    },

    listSubmodelsOf<T extends RestgooseModel>(modelType: Constructor<T>): Iterable<RestSubmodelEntry<RestgooseModel>> {
        const map = submodels.get(modelType.name);
        if (map) {
            return submodels.get(modelType.name).values();
        }
        else {
            return [];
        }
    },
};

export { RestRegistry };
