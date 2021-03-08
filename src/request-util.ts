import { RestRegistry } from './rest-registry';
import { RestgooseModel } from './restgoose-model';
import { Constructor, RestRequest } from './types';

export function buildPayload<T extends RestgooseModel>(req: RestRequest, modelType: Constructor<T>) {
    const payload = {};
    // FIXME as any
    const properties = RestRegistry.listPropertiesOf(modelType) as Array<any>;
    if (properties) {
        for (const prop of properties) {
            // TODO: search for RestgooseModel annotations and process them?
            if (typeof(req.body[prop.name]) !== 'undefined') {
                payload[prop.name] = req.body[prop.name];
            }
        }
    }
    return payload;
}
