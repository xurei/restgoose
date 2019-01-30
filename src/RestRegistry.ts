import { Typegoose } from 'typegoose';
import { RestConfiguration } from './rest';
import { Constructor } from './types';

/*
    TODO we should replace the RestRegistry maps by a set, and store all the models that way.
    the name can be used by multiple models, this will overwrite the config of some
*/

export declare interface RestModelEntry<T extends Typegoose> {
    type: Constructor<T>;
    config: RestConfiguration<T>;
    property?: string;
}

const modelsRegistryMap: Map<string, RestModelEntry<Typegoose>> = new Map<string, RestModelEntry<Typegoose>>();
const submodelsRegistryMap: Map<string, Map<string, RestModelEntry<Typegoose>>> =
    new Map<string, Map<string, RestModelEntry<Typegoose>>>();

const RestRegistry = {
    registerModel<T extends Typegoose>(modelType: Constructor<T>, config: RestConfiguration<T>) {
        modelsRegistryMap.set(modelType.name, {
            type: modelType,
            config,
        });
    },

    registerSubModel<T extends Typegoose>(modelType: Constructor<T>, propertyKey: string, config: RestConfiguration<T>) {
        if (!submodelsRegistryMap.has(modelType.name)) {
            submodelsRegistryMap.set(modelType.name, new Map<string, RestModelEntry<Typegoose>>());
        }
        submodelsRegistryMap.get(modelType.name).set(propertyKey, {
            type: modelType,
            property: propertyKey,
            config,
        });
    },

    getModel<T extends Typegoose>(modelType: Constructor<T>): RestModelEntry<Typegoose> {
        return modelsRegistryMap.get(modelType.name);
    },

    listModels(): Iterable<RestModelEntry<Typegoose>> {
        return modelsRegistryMap.values();
    },

    listSubModelsOf<T extends Typegoose>(modelType: Constructor<T>): Iterable<RestModelEntry<Typegoose>> {
        const map = submodelsRegistryMap.get(modelType.name);
        if (map) {
            return submodelsRegistryMap.get(modelType.name).values();
        }
        else {
            return [];
        }
    },
};

export { RestRegistry };
