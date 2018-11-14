/// <reference types="express" />
import { Response } from 'express';
import { Typegoose } from 'typegoose';
import { RestConfigurationMethod } from './rest';
import { RestModelEntry } from './RestRegistry';
import { RestRequest } from './types';
export declare const ERROR_FORBIDDEN_CODE: string;
export declare const ERROR_NOT_FOUND_CODE: string;
export declare const ERROR_READONLY_CODE: string;
export declare const ERROR_VALIDATION_CODE: string;
export declare const ERROR_VALIDATION_NAME: string;
export declare function all<T extends Typegoose>(modelEntry: RestModelEntry<T>, methodConfig: RestConfigurationMethod<T>): (req: RestRequest, res: Response) => any;
export declare function allWithin<T extends Typegoose>(modelEntry: RestModelEntry<T>, methodConfig: RestConfigurationMethod<T>, property: string, submodelEntry: RestModelEntry<T>, submethodConfig: RestConfigurationMethod<T>): (req: RestRequest, res: Response) => any;
export declare function create<T extends Typegoose>(modelEntry: RestModelEntry<T>, methodConfig: RestConfigurationMethod<T>): (req: RestRequest, res: Response) => any;
export declare function createWithin<T extends Typegoose>(modelEntry: RestModelEntry<T>, methodConfig: RestConfigurationMethod<T>, property: string, submodelEntry: RestModelEntry<T>, submethodConfig: RestConfigurationMethod<T>): (req: RestRequest, res: Response) => any;
export declare function one<T extends Typegoose>(modelEntry: RestModelEntry<T>, methodConfig: RestConfigurationMethod<T>): (req: RestRequest, res: Response) => any;
export declare function remove<T extends Typegoose>(modelEntry: RestModelEntry<T>, methodConfig: RestConfigurationMethod<T>): (req: RestRequest, res: Response) => any;
export declare function removeAll<T extends Typegoose>(modelEntry: RestModelEntry<T>, methodConfig: RestConfigurationMethod<T>): (req: RestRequest, res: Response) => any;
export declare function update<T extends Typegoose>(modelEntry: RestModelEntry<T>, methodConfig: RestConfigurationMethod<T>): (req: RestRequest, res: Response) => any;