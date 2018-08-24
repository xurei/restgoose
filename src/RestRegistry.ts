import { Typegoose } from 'typegoose';
import { RestConfiguration, TypegooseConstructor } from './rest';

export declare interface RestModelEntry<T extends Typegoose> {
    type: TypegooseConstructor<T>;
    config: RestConfiguration<T>;
    property?: string;
}

const modelsRegistryMap: Map<string, RestModelEntry<Typegoose>> = new Map<string, RestModelEntry<Typegoose>>();
const submodelsRegistryMap: Map<string, Map<string, RestModelEntry<Typegoose>>> =
    new Map<string, Map<string, RestModelEntry<Typegoose>>>();

const RestRegistry = {
    registerModel<T extends Typegoose>(modelType: TypegooseConstructor<T>, config: RestConfiguration<T>) {
        modelsRegistryMap.set(modelType.name, {
            type: modelType,
            config,
        });
    },

    registerSubModel<T extends Typegoose>(
        modelType: TypegooseConstructor<T>, propertyKey: string, config: RestConfiguration<T>) {
        if (!submodelsRegistryMap.has(modelType.name)) {
            submodelsRegistryMap.set(modelType.name, new Map<string, RestModelEntry<Typegoose>>());
        }
        submodelsRegistryMap.get(modelType.name).set(propertyKey, {
            type: modelType,
            property: propertyKey,
            config,
        });
    },

    listModels(): Iterable<RestModelEntry<Typegoose>> {
        return modelsRegistryMap.values();
    },

    listSubModelsOf(modelName: string): Iterable<RestModelEntry<Typegoose>> {
        const map = submodelsRegistryMap.get(modelName);
        if (map) {
            return submodelsRegistryMap.get(modelName).values();
        }
        else {
            return [];
        }
    },
};

export { RestRegistry };
