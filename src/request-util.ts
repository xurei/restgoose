import { RestRegistry } from './rest-registry';
import { RestgooseModel } from './restgoose-model';
import { Constructor, RestRequest } from './types';

export function buildPayload<T extends RestgooseModel>(req: RestRequest, modelType: Constructor<T>) {
    const payload = {};
    // FIXME as any
    const properties = RestRegistry.listPropertiesOf(modelType) as any;
    if (properties) {
        properties.forEach((prop: string) => {
            // TODO: search for RestgooseModel annotations and process them?
            if (typeof(req.body[prop]) !== 'undefined') {
                payload[prop] = req.body[prop];
            }
        });
    }
    return payload;
}
