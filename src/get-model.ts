import { Connection, connection as defaultConnection, Document, Model } from 'mongoose';
import { RestRegistry } from './rest-registry';
import { RestgooseModel } from './restgoose-model';
import { Constructor } from './types';

/**
 * Get or builds the model for a specific connection
 * @param connection
 * @param model
 */
export function getModel<T extends RestgooseModel>(model: Constructor<T>, connection?: Connection): Model<T & Document> {
    if (!connection) {
        connection = defaultConnection;
    }
    const modelEntry = RestRegistry.getModel(model);
    const schemaOptions = modelEntry && modelEntry.restConfig ? modelEntry.restConfig.schemaOptions : undefined;

    if (!connection.models[model.name]) {
        // get schema of current model
        const schema = model.prototype.buildSchema(schemaOptions);
        const newModel: Model<T & Document> = connection.model(model.name, schema);
        newModel.init();
        newModel.ensureIndexes();
        return newModel;
    }

    return connection.models[model.name];
}
