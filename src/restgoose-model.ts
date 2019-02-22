import * as mongoose from 'mongoose';
import { ArrayPropConfiguration } from './decorators/array-prop';
import { RestRegistry } from './rest-registry';
import { Restgoose } from './restgoose';
import { isObject, isPrimitive } from './type-checks';
import { Constructor, Dic } from './types';

const schemas = {};

export class RestgooseModel {
    public buildSchema(schemaOptions?, sch?: mongoose.Schema) {
        const name = this.constructor.name;
        if (schemas[name]) {
            return schemas[name];
        }

        if (!sch) {
            sch = schemaOptions ?
            new mongoose.Schema({}, schemaOptions) :
            new mongoose.Schema({});
        }

        const props = RestRegistry.listPropertiesOf(this.constructor as Constructor<RestgooseModel>);

        for (const prop of props) {
            if (!prop.config) {
                // TODO create a specific error class for Restgoose init errors
                throw new Error(`Property '${prop.name}' is missing a configuration. You probably forgot to add @prop() on it.`);
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

            if (Array.isArray(prop.type)) {
                if (isPrimitive(prop.type[0])) {
                    config.type = prop.type;
                }
                else if ((prop.config as ArrayPropConfiguration<any, any>).ref === true) {
                    config.type = [mongoose.Schema.Types.ObjectId];
                }
                else {
                    const Type = prop.type[0] as Constructor<RestgooseModel>;
                    const subSchema = Type.prototype.buildSchema();
                    config.type = [subSchema];
                }
            }
            else if (!isPrimitive(prop.type) && isObject(prop.type)) {
                // TODO check that this works
                config.type = Object;
            }
            else {
                config.type = prop.type;
            }

            const s = {};
            s[prop.name] = config;
            sch.add(s);
        }

        //console.log(props);

        /*const indices = Reflect.getMetadata('typegoose:indices', t) || [];
        for (const index of indices) {
            sch.index(index.fields, index.options);
        }*/

        schemas[name] = sch;
        return sch;
    }
}
