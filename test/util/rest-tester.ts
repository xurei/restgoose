import * as chai from 'chai';
import { Express } from 'express';

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

    private runMiddleware(route, options) {
        return new Promise<Response>((resolve, reject) => {
            this.app.runMiddleware(route, options,
                (code, body, headers) => {
                    try {
                        if (body) {
                            body = JSON.parse(body);
                        }
                        resolve({ code,body,headers });
                    }
                    catch(e) {
                        reject(new Error(`Could not parse json: ${body}`));
                    }
                }
            );
        });
    }

    public post(route: string, payload: object, options?: IRestTesterOptions): Promise<Response> {
        options = this.applyOptions(options, options);

        return this.runMiddleware(route,
            Object.assign({}, options, {
                method: 'post',
                body: payload
            })
        );
    }

    public get(route: string, options?: IRestTesterOptions): Promise<Response> {
        options = this.applyOptions(options, options);

        return this.runMiddleware(route,
            Object.assign({}, options, {
                method: 'get',
            })
        );
    }

    public put(route: string, payload: object, options?: IRestTesterOptions): Promise<Response> {
        options = this.applyOptions(options, options);

        return this.runMiddleware(route,
            Object.assign({}, options, {
                method: 'put',
                body: payload
            })
        );
    }

    public patch(route: string, payload: object, options?: IRestTesterOptions): Promise<Response> {
        options = this.applyOptions(options, options);

        return this.runMiddleware(route,
            Object.assign({}, options, {
                method: 'patch',
                body: payload
            })
        );
    }

    public delete(route: string, options?: IRestTesterOptions): Promise<Response> {
        options = this.applyOptions(options, options);

        return this.runMiddleware(route,
            Object.assign({}, options, {
                method: 'delete',
            })
        );
    }

    private applyOptions(out: object, options?: IRestTesterOptions) {
        if (this.config.authToken) {
            out['Authorization'] = `Bearer ${this.config.authToken}`;
        }

        if (options && options.headers) {
            Object.keys(options.headers).forEach(header => {
                out = out[header] = options.headers[header];
            });
        }

        return out;
    }
}
