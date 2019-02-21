import * as mongoose from 'mongoose';
import { RestRegistry } from './rest-registry';
import { Constructor, Dic } from './types';
import { Restgoose } from './restgoose';

const schemas = {};

const isPrimitive = (Type) => !!Type && ['String', 'Number', 'Boolean', 'Date', 'Decimal128'].find(n => Type.name === n);
const isArray = (Type) => !!Type && Type.name === 'Array';
const isObject = (Type) => {
    let prototype = Type.prototype;
    let name = Type.name;
    while (name) {
        if (name === 'Object') {
            return true;
        }
        prototype = Object.getPrototypeOf(prototype);
        name = prototype ? prototype.constructor.name : null;
    }
    return false;
};
const isNumber = (Type) => !!Type && Type.name === 'Number';
const isString = (Type) => !!Type && Type.name === 'String';
const isBoolean = (Type) => !!Type && Type.name === 'Boolean';
const isDate = (Type) => !!Type && Type.name === 'Date';

export class RestgooseModel {
    public buildSchema(schemaOptions?, sch?: mongoose.Schema) {
        const Schema = mongoose.Schema;
        const t = Object.getPrototypeOf(this);
        const name = this.constructor.name;

        if (!sch) {
            sch = schemaOptions ?
            new Schema({}, schemaOptions) :
            new Schema({});
        }

        const props = RestRegistry.listPropertiesOf(this.constructor as Constructor<RestgooseModel>);

        for (const prop of props) {
            //prop.
            //sch.add
            const schProp = {};
            //schProp[prop.name] = prop.type;

            const config: Dic = {
                required: prop.config.required || false,
                default: prop.config.default,
            };

            if (Array.isArray(prop.type)) {
                if (isPrimitive(prop.type[0])) {
                    config.type = prop.type;
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

        return sch;
    }
}
