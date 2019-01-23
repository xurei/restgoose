import { Connection, Model } from 'mongoose';
import { InstanceType, Typegoose } from 'typegoose';
import { Constructor } from './types';
/**
 * Get or builds the model for a specific connection
 * @param connection
 * @param model
 */
export declare function getModel<T extends Typegoose>(connection: Connection, model: Constructor<T>): Model<InstanceType<T>>;
