import { Model } from 'mongoose';
import { InstanceType, Typegoose } from 'typegoose';
import { RestRequest } from './types';

export function buildPayload<T extends Typegoose>(req: RestRequest, modelType: Model<InstanceType<T>>) {
    const payload = {};
    // FIXME as any
    const properties = Object.keys((modelType.schema as any).tree);
    properties.forEach((prop: string) => {
        // TODO: search for typegoose annotations and process them?
        if (typeof(req.body[prop]) !== 'undefined') {
            payload[prop] = req.body[prop];
        }
    });
    return payload;
}
