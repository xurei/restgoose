"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Get or builds the model for a specific connection
 * @param connection
 * @param model
 */
function getModel(connection, model) {
    return __awaiter(this, void 0, void 0, function* () {
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
    });
}
exports.getModel = getModel;
//# sourceMappingURL=getModel.js.map