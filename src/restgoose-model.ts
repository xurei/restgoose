import * as mongoose from 'mongoose';
import { RestRegistry } from './rest-registry';
import { Constructor } from './types';

const schemas = {};

const isPrimitive = (Type) => !!Type && ['String', 'Number', 'Boolean', 'Date', 'Decimal128'].find(n => Type.name === n);
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
            new Schema(schemas[name], schemaOptions) :
            new Schema(schemas[name]);
        } else {
            sch.add(schemas[name]);
        }

        const props = RestRegistry.listPropertiesOf(this.constructor as Constructor<RestgooseModel>);

        for (const prop of props) {
            //prop.
            //sch.add
            const schProp = {};
            schProp[prop.name] = prop.type.name;
            sch.add(schProp);
        }

        console.log(props);

        /*const indices = Reflect.getMetadata('typegoose:indices', t) || [];
        for (const index of indices) {
            sch.index(index.fields, index.options);
        }*/

        return sch;
    }
}
