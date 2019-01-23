import * as chai from 'chai';
import { Express } from 'express';
import * as Promise from 'promise';
import chaiHttp = require('chai-http');

chai.use(chaiHttp);

export interface IRestTesterConfiguration {
    app: Express;
    baseUrl?: string;
    authToken?: string;
}

export interface IRestTesterOptions {
    headers?: object;
}

export class RestTester {
    private config: IRestTesterConfiguration;
    private app: Express;
    private requester: any;

    public constructor(config: IRestTesterConfiguration) {
        this.config = Object.assign({
            baseUrl: '',
        }, config);
        this.app = config.app;

        this.requester = chai.request(this.app).keepOpen();
        // const initPromise = request.get(buildUrl('/reset'));
    }

    public as(token: string): RestTester {
        return new RestTester(Object.assign({}, this.config, {
            authToken: token,
        }));
    }

    public post(route: string, payload: object, options?: IRestTesterOptions): Promise<Response> {
        let out = this.requester.post(`${this.config.baseUrl}${route}`);

        out = this.applyOptions(out, options);

        return new Promise<Response>((resolve, reject) => {
            out.send(payload).end((err, res: Response) => {
                if (!res) {
                    reject(err);
                } else {
                    resolve(res);
                }
            });
        });
    }

    public patch(route: string, payload: object, options?: IRestTesterOptions): Promise<Response> {
        let out = this.requester.patch(`${this.config.baseUrl}${route}`);

        out = this.applyOptions(out, options);

        return new Promise<Response>((resolve, reject) => {
            out.send(payload).end((err, res: Response) => {
                if (!res) {
                    reject(err);
                } else {
                    resolve(res);
                }
            });
        });
    }

    public put(route: string, payload: object, options?: IRestTesterOptions): Promise<Response> {
        let out = this.requester.put(`${this.config.baseUrl}${route}`);

        out = this.applyOptions(out, options);

        return new Promise<Response>((resolve, reject) => {
            out.send(payload).end((err, res: Response) => {
                if (!res) {
                    reject(err);
                } else {
                    resolve(res);
                }
            });
        });
    }

    public get(route: string, options?: IRestTesterOptions): Promise<Response> {
        let out = this.requester.get(`${this.config.baseUrl}${route}`).redirects(0);

        out = this.applyOptions(out, options);

        return new Promise<Response>((resolve, reject) => {
            out.end((err, res: Response) => {
                if (!res) {
                    reject(err);
                } else {
                    resolve(res);
                }
            });
        });
    }

    public delete(route: string, options?: IRestTesterOptions): Promise<Response> {
        let out = this.requester.delete(`${this.config.baseUrl}${route}`);

        out = this.applyOptions(out, options);

        return new Promise<Response>((resolve, reject) => {
            out.end((err, res: Response) => {
                if (!res) {
                    reject(err);
                } else {
                    resolve(res);
                }
            });
        });
    }

    private applyOptions(out, options?: IRestTesterOptions) {
        if (this.config.authToken) {
            out = out.set('authorization', this.config.authToken);
        }

        if (options && options.headers) {
            Object.keys(options.headers).forEach(header => {
                out = out.set(header, options.headers[header]);
            });
        }

        return out;
    }
}

