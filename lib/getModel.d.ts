/// <reference types="mongoose" />
import { Typegoose, InstanceType } from 'typegoose';
import { Constructor } from './types';
import { Model, Connection } from 'mongoose';
/**
 * Get or builds the model for a specific connection
 * @param connection
 * @param model
 */
export declare function getModel<T extends Typegoose>(connection: Connection, model: Constructor<T>): Promise<Model<InstanceType<T>>>;
