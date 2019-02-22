import { Model } from 'mongoose';
import { RestgooseModel } from './restgoose-model';
import { RestRequest } from './types';
import { InstanceType } from './types';

export function buildPayload<T extends RestgooseModel>(req: RestRequest, modelType: Model<InstanceType<T>>) {
    const payload = {};
    // FIXME as any
    const properties = Object.keys((modelType.schema as any).tree);
    properties.forEach((prop: string) => {
        // TODO: search for RestgooseModel annotations and process them?
        if (typeof(req.body[prop]) !== 'undefined') {
            payload[prop] = req.body[prop];
        }
    });
    return payload;
}
