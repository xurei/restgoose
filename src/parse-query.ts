import { Request } from 'express';
import { convertFields } from './convert-fields';
import { RestRequest } from './types';

export function parseQuery(req: Request): RestRequest {
    const out: RestRequest = req;
    out.restgoose = {};
    if (req.query) {
        if (req.query.q) {
            out.restgoose.query = convertFields(JSON.parse(req.query.q));
        }

        // TODO Not converting options or projection by default for security reasons; should add some config ?
        // if (req.query.options) {
        //     out.restgoose.options = convertFields(JSON.parse(req.query.options));
        // }
        // if (req.query.project) {
        //    out.restgoose.projection = convertFields(JSON.parse(req.query.project));
        // }
    }
    return out;
}
