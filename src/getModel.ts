import { Typegoose, InstanceType } from 'typegoose';
import { Constructor } from './types';
import { Model, Connection } from 'mongoose';

/**
 * Get or builds the model for a specific connection
 * @param connection
 * @param model
 */
export async function getModel<T extends Typegoose>(connection: Connection, model: Constructor<T>): Promise<Model<InstanceType<T>>> {
    if (!connection.models[model.name]) {
        //const schema = model.prototype.buildSchema(model.name);
        // get schema of current model
        let schema = model.prototype.buildSchema(model.name);
        // get parents class name
        let parentCtor = Object.getPrototypeOf(model);
        // iterate trough all parents
        while (parentCtor && parentCtor.name !== 'Typegoose' && parentCtor.name !== 'Object') {
            // extend schema
            schema = model.prototype.buildSchema(parentCtor.name, undefined, schema);
            // next parent
            parentCtor = Object.getPrototypeOf(parentCtor);
        }
        return connection.model(model.name, schema);
    }

    return connection.models[model.name];
}
