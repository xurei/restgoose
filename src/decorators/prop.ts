import 'reflect-metadata';
import { RestRegistry } from '../rest-registry';
import { Constructor } from '../types';
import { RestgooseModel } from '../restgoose-model';

export interface PropConfiguration<T extends RestgooseModel> {
    required?: boolean;
    default?: any;
}

export function prop<T extends RestgooseModel>(config: PropConfiguration<T> = {}) {
    return (target: T, key: string) => {
        const Type = (Reflect as any).getMetadata('design:type', target, key);
        RestRegistry.registerProperty(target.constructor as Constructor<T>, key, Type, config)
    };
}
