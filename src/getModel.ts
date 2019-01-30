import { Connection, Model } from 'mongoose';
import { InstanceType, Typegoose } from 'typegoose';
import { RestRegistry } from './RestRegistry';
import { Constructor } from './types';

/**
 * Get or builds the model for a specific connection
 * @param connection
 * @param model
 */
export function getModel<T extends Typegoose>(connection: Connection, model: Constructor<T>): Model<InstanceType<T>> {
    const modelEntry = RestRegistry.getModel(model);
    const schemaOptions = modelEntry && modelEntry.config ? modelEntry.config.schemaOptions : undefined;

    if (!connection.models[model.name]) {
        // get schema of current model
        let schema = model.prototype.buildSchema(model, model.name, schemaOptions);
        // get parents class name
        let parentCtor = Object.getPrototypeOf(model);
        // iterate through all parents
        while (parentCtor && parentCtor.name !== 'Typegoose' && parentCtor.name !== 'Object') {
            // extend schema
            schema = model.prototype.buildSchema(parentCtor, parentCtor.name, schemaOptions, schema);
            // next parent
            parentCtor = Object.getPrototypeOf(parentCtor);
        }
        const newModel: Model<InstanceType<T>> = connection.model(model.name, schema);
        newModel.init();
        newModel.ensureIndexes();
        return newModel;
    }

    return connection.models[model.name];
}
