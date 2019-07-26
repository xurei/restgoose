import { Document } from 'mongoose';
import { RestRegistry } from '../rest-registry';
import { RestgooseModel } from '../restgoose-model';

type DocumentMethod = 'init' | 'validate' | 'save' | 'remove';
type ModelMethod = 'insertMany';

type ClassDecorator = (constructor: any) => void;
type HookNextFn = (err?: Error) => void;

type DocumentPostFn<T> = (this: T & Document, doc: T & Document, next?: HookNextFn) => void;
type ModelPostFn<T> = (result: any, next?: HookNextFn) => void;

type PostNumberResponse<T> = (result: number, next?: HookNextFn) => void;
type PostSingleResponse<T> = (result: T & Document, next?: HookNextFn) => void;
type PostMultipleResponse<T> = (result: (T & Document)[], next?: HookNextFn) => void;

type PostNumberWithError<T> = (error: Error, result: number, next: HookNextFn) => void;
type PostSingleWithError<T> = (error: Error, result: T & Document, next: HookNextFn) => void;
type PostMultipleWithError<T> = (error: Error, result: (T & Document)[], net: HookNextFn) => void;

type NumberMethod = 'count';
type SingleMethod = 'findOne' | 'findOneAndRemove' | 'findOneAndUpdate' | DocumentMethod;
type MultipleMethod = 'find' | 'update';

interface PostHooks {
    // I had to disable linter to allow this. I only got proper code completion separating the functions
    post<T>(method: NumberMethod, fn: PostNumberResponse<T>): ClassDecorator;
    // tslint:disable-next-line:unified-signatures
    post<T>(method: NumberMethod, fn: PostNumberWithError<T>): ClassDecorator;

    post<T>(method: SingleMethod, fn: PostSingleResponse<T>): ClassDecorator;
    // tslint:disable-next-line:unified-signatures
    post<T>(method: SingleMethod, fn: PostSingleWithError<T>): ClassDecorator;

    post<T>(method: MultipleMethod, fn: PostMultipleResponse<T>): ClassDecorator;
    // tslint:disable-next-line:unified-signatures
    post<T>(method: MultipleMethod, fn: PostMultipleWithError<T>): ClassDecorator;

    post<T>(method: ModelMethod, fn: ModelPostFn<T> | PostMultipleResponse<T>): ClassDecorator;
}

const hooks: PostHooks = {
    post<T extends RestgooseModel>(...args) {
        const action = args[0] as string;
        const fn = args[1] as DocumentPostFn<T>;
        return (constructor: any) => {
            RestRegistry.registerHook(constructor, 'pre', action, fn);
        };
    },
};

export const post = hooks.post;
