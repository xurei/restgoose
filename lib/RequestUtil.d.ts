/// <reference types="mongoose" />
import { Model } from 'mongoose';
import { InstanceType, Typegoose } from 'typegoose';
import { RestRequest } from './types';
export declare function buildPayload<T extends Typegoose>(req: RestRequest, modelType: Model<InstanceType<T>>): {};
