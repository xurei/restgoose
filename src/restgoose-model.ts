import * as mongoose from 'mongoose';
import { ArrayPropConfiguration } from './decorators/array-prop';
import { RestRegistry } from './rest-registry';
import { isArray, isObject, isObjectLitteral, isPrimitive } from './type-checks';
import { Constructor, Dic } from './types';

const schemas = {};

export class RestgooseModel {
    public buildSchema(schemaOptions?) {
        const name = this.constructor.name;
        if (schemas[name]) {
            return schemas[name];
        }

        let sch: mongoose.Schema;
        const parentCtor = Object.getPrototypeOf(this);
        if (parentCtor && parentCtor.constructor.name !== 'RestgooseModel' && parentCtor.constructor.name !== 'Object') {
            const parentSchema = parentCtor.buildSchema(schemaOptions);
            sch = parentSchema.clone();
        }
        else {
            sch = schemaOptions ? new mongoose.Schema({}, schemaOptions) : new mongoose.Schema({});
        }

        const props = RestRegistry.listPropertiesOf(this.constructor as Constructor<RestgooseModel>);
        for (const prop of props) {
            if (!prop.config) {
                // TODO create a specific error class for Restgoose init errors
                throw new Error(`In ${name}: Property '${prop.name}' is missing a configuration. You probably forgot to add @prop() on it.`);
            }

            const config: Dic = {
                required: prop.config.required || false,
                index: prop.config.index || false,
                unique: prop.config.unique || false,
                default: prop.config.default,
            };
            if (prop.config.validate) {
                config.validate = prop.config.validate;
            }
            if (prop.config.enum) {
                if (typeof(prop.config.enum) === 'object') {
                    config.enum = Object.keys(prop.config.enum).map(k => prop.config.enum[k]);
                }
                else {
                    throw new Error(`In ${name}: Option 'enum' must be an array, object litteral, or enum type`);
                }
            }

            if (Array.isArray(prop.type)) {
                if (isPrimitive(prop.type[0])) {
                    config.type = prop.type;
                }
                else if ((prop.config as ArrayPropConfiguration<any, any>).ref === true) {
                    config.type = [mongoose.Schema.Types.ObjectId];
                }
                else {
                    const Type = prop.type[0] as Constructor<RestgooseModel>;
                    const subSchema = Type.prototype.buildSchema(); //No schemaOptions ??
                    config.type = [subSchema];
                }
            }
            else if (!isPrimitive(prop.type) && !isArray(prop.type) && isObject(prop.type)) {
                if (isObjectLitteral(prop.type)) {
                    config.type = Object;
                }
                else {
                    const Type = prop.type as Constructor<RestgooseModel>;
                    if (!Type.prototype.buildSchema) {
                        throw new Error(`In ${name} - ${prop.name}: ${Type} does not seem to be a restgoose type`);
                    }
                    config.type = Type.prototype.buildSchema(); //No schemaOptions ??
                }
            }
            else {
                config.type = prop.type;
            }

            const s = {};
            s[prop.name] = config;
            sch.add(s);
        }

        const hooks = RestRegistry.listHooksOf(this.constructor as Constructor<RestgooseModel>);
        for (const hook of hooks) {
            const hookType = hook.type;
            switch (hookType) {
                case 'pre': {
                    sch.pre(hook.action, hook.method);
                    break;
                }
                case 'post': {

                    break;
                }
            }
        }

        /*const indices = Reflect.getMetadata('typegoose:indices', t) || [];
        for (const index of indices) {
            sch.index(index.fields, index.options);
        }*/

        schemas[name] = sch;
        return sch;
    }
}
