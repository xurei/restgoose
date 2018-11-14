"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RestRegistry_1 = require("./RestRegistry");
/**
 * Get or builds the model for a specific connection
 * @param connection
 * @param model
 */
function getModel(connection, model) {
    const modelEntry = RestRegistry_1.RestRegistry.getModel(model);
    if (!connection.models[model.name]) {
        //const schema = model.prototype.buildSchema(model.name);
        // get schema of current model
        let schema = model.prototype.buildSchema(model.name, modelEntry.config.schemaOptions);
        // get parents class name
        let parentCtor = Object.getPrototypeOf(model);
        // iterate trough all parents
        while (parentCtor && parentCtor.name !== 'Typegoose' && parentCtor.name !== 'Object') {
            // extend schema
            schema = model.prototype.buildSchema(parentCtor.name, modelEntry.config.schemaOptions, schema);
            // next parent
            parentCtor = Object.getPrototypeOf(parentCtor);
        }
        return connection.model(model.name, schema);
    }
    return connection.models[model.name];
}
exports.getModel = getModel;
//# sourceMappingURL=getModel.js.map