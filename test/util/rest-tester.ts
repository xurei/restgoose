import * as chai from 'chai';
import * as chaiHttp from 'chai-http';
import { Express } from 'express';

chai.use(chaiHttp);

export interface IRestTesterConfiguration {
    app: Express;
    authToken?: string;
}

export interface IRestTesterOptions {
    headers?: object;
}

type Response = { code:number, body:any, headers:any };
type App = Express & { runMiddleware: any };

export class RestTester {
    private config: IRestTesterConfiguration;
    private app: App;

    public constructor(config: IRestTesterConfiguration) {
        this.app = config.app as App;
        if (!this.app.runMiddleware) {
            require('run-middleware')(this.app);
        }
        this.config = Object.assign({}, config);
    }

    public as(token: string): RestTester {
        return new RestTester(Object.assign({}, this.config, {
            authToken: token,
        }));
    }

    public post(route: string, payload: object, options?: IRestTesterOptions): Promise<Response> {
        options = this.applyOptions(options, options);

        return new Promise<Response>((resolve, reject) => {
            this.app.runMiddleware(route,
                Object.assign({}, options, {
                    method: 'post',
                    body: payload
                }),
                (code,body,headers) => {
                    resolve({ code,body,headers });
                }
            );
        });
    }

    public get(route: string, options?: IRestTesterOptions): Promise<Response> {
        options = this.applyOptions(options, options);

        return new Promise<Response>((resolve, reject) => {
            this.app.runMiddleware(route,
                Object.assign({}, options, {
                    method: 'get',
                }),
                (code,body,headers) => {
                    resolve({ code,body,headers });
                }
            );
        });
    }

    public put(route: string, payload: object, options?: IRestTesterOptions): Promise<Response> {
        options = this.applyOptions(options, options);

        return new Promise<Response>((resolve, reject) => {
            this.app.runMiddleware(route,
                Object.assign({}, options, {
                    method: 'put',
                    body: payload
                }),
                (code,body,headers) => {
                    resolve({ code,body,headers });
                }
            );
        });
    }

    public patch(route: string, payload: object, options?: IRestTesterOptions): Promise<Response> {
        options = this.applyOptions(options, options);

        return new Promise<Response>((resolve, reject) => {
            this.app.runMiddleware(route,
                Object.assign({}, options, {
                    method: 'patch',
                    body: payload
                }),
                (code,body,headers) => {
                    resolve({ code,body,headers });
                }
            );
        });
    }

    public delete(route: string, options?: IRestTesterOptions): Promise<Response> {
        options = this.applyOptions(options, options);

        return new Promise<Response>((resolve, reject) => {
            this.app.runMiddleware(route,
                Object.assign({}, options, {
                    method: 'delete',
                }),
                (code,body,headers) => {
                    resolve({ code,body,headers });
                }
            );
        });
    }

    private applyOptions(out: chaiHttp.Test, options?: IRestTesterOptions) {
        if (this.config.authToken) {
            out = out.set('Authorization', `Bearer ${this.config.authToken}`);
        }

        if (options && options.headers) {
            Object.keys(options.headers).forEach(header => {
                out = out.set(header, options.headers[header]);
            });
        }

        return out;
    }
}
