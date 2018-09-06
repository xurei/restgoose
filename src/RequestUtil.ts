import { Model } from 'mongoose';
import { InstanceType, Typegoose } from 'typegoose';
import { RestRequest } from './types';

export function buildPayload<T extends Typegoose>(req: RestRequest, modelType: Model<InstanceType<T>>) {
    const payload = {};
    const properties = Object.keys(modelType.schema.obj);
    properties.forEach((prop: string) => {
        // TODO: search for typegoose annotations and process them?
        if (req.body[prop]) {
            payload[prop] = req.body[prop];
        }
    });
    return payload;
}
