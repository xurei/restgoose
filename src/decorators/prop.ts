import 'reflect-metadata';
import { RestRegistry } from '../rest-registry';
import { RestgooseModel } from '../restgoose-model';
import { Constructor } from '../types';

export interface PropConfiguration<T extends RestgooseModel> {
    required?: boolean;
    index?: boolean;
    unique?: boolean;
    default?: any;

    validate?: (value: any) => boolean;
}

export function prop<T extends RestgooseModel>(config: PropConfiguration<T> = {}) {
    return (target: T, key: string) => {
        const Type = (Reflect as any).getMetadata('design:type', target, key);
        RestRegistry.registerProperty(target.constructor as Constructor<T>, key, Type, config);
    };
}
