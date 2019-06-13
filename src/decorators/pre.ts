import { Document } from 'mongoose';
import { RestRegistry } from '../rest-registry';
import { RestgooseModel } from '../restgoose-model';
import { CallbackFn, RestgooseDocument } from '../types';

type DocumentMethod = 'init' | 'validate' | 'save' | 'remove';
type QueryMethod = 'count' | 'find' | 'findOne' | 'findOneAndRemove' | 'findOneAndUpdate' | 'update' | 'updateOne' | 'updateMany';
type ModelMethod = 'insertMany';

type DocumentPreFn<T extends RestgooseModel> = (doc: RestgooseDocument<T>, next?: CallbackFn) => void;

interface PreHooks {
    pre<T extends RestgooseModel>(method: QueryMethod | ModelMethod | DocumentMethod, fn: DocumentPreFn<T>): ClassDecorator;
}

const hooks: PreHooks = {
    pre<T extends RestgooseModel>(...args) {
        const action = args[0] as string;
        const fn = args[1] as DocumentPreFn<T>;
        return (constructor: any) => {
            RestRegistry.registerHook(constructor, 'pre', action, function () {
                const doc = this as T & Document;
                return fn(doc);
            });
        };
    },
};

export const pre = hooks.pre;
