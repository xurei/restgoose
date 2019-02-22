import 'reflect-metadata';
import { RestRegistry } from '../rest-registry';
import { RestgooseModel } from '../restgoose-model';
import { Constructor } from '../types';
import { PropConfiguration } from './prop';

export interface ArrayPropConfiguration<T extends RestgooseModel, S extends RestgooseModel> extends PropConfiguration<T> {
    // tslint:disable-next-line
    items: Constructor<S | Number | String | Boolean | Date>;
    ref?: boolean;
}

export function arrayProp<T extends RestgooseModel, S extends RestgooseModel>(config: ArrayPropConfiguration<T, S>) {
    return (target: T, key: string) => {
        const Type = (Reflect as any).getMetadata('design:type', target, key);
        RestRegistry.registerProperty(target.constructor as Constructor<T>, key, [config.items], config);
    };
}
