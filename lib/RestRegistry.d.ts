import { Typegoose } from 'typegoose';
import { RestConfiguration } from './rest';
import { Constructor } from './types';
export interface RestModelEntry<T extends Typegoose> {
    type: Constructor<T>;
    config: RestConfiguration<T>;
    property?: string;
}
declare const RestRegistry: {
    registerModel<T extends Typegoose>(modelType: Constructor<T>, config: RestConfiguration<T>): void;
    registerSubModel<T extends Typegoose>(modelType: Constructor<T>, propertyKey: string, config: RestConfiguration<T>): void;
    getModel<T extends Typegoose>(modelType: Constructor<T>): RestModelEntry<Typegoose>;
    listModels(): Iterable<RestModelEntry<Typegoose>>;
    listSubModelsOf<T extends Typegoose>(modelType: Constructor<T>): Iterable<RestModelEntry<Typegoose>>;
};
export { RestRegistry };
