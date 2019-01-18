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
        let query = null;
        if (route.indexOf('?')) {
            const tmp = route.split(/\?/, 2);
            query = tmp[1];
            route = tmp[0];
        }
        options = Object.assign({query: query}, options);
        return new Promise<Response>((resolve, reject) => {
            this.app.runMiddleware(route, options,
                (code, body, headers) => {
                    try {
                        if (body && !(body instanceof Object)) {
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
        options = this.applyOptions(options);

        return this.runMiddleware(route,
            Object.assign({}, options, {
                method: 'post',
                body: payload
            })
        );
    }

    public get(route: string, options?: IRestTesterOptions): Promise<Response> {
        options = this.applyOptions(options);

        return this.runMiddleware(route,
            Object.assign({}, options, {
                method: 'get',
            })
        );
    }

    public put(route: string, payload: object, options?: IRestTesterOptions): Promise<Response> {
        options = this.applyOptions(options);

        return this.runMiddleware(route,
            Object.assign({}, options, {
                method: 'put',
                body: payload
            })
        );
    }

    public patch(route: string, payload: object, options?: IRestTesterOptions): Promise<Response> {
        options = this.applyOptions(options);

        return this.runMiddleware(route,
            Object.assign({}, options, {
                method: 'patch',
                body: payload
            })
        );
    }

    public delete(route: string, options?: IRestTesterOptions): Promise<Response> {
        options = this.applyOptions(options);

        return this.runMiddleware(route,
            Object.assign({}, options, {
                method: 'delete',
            })
        );
    }

    private applyOptions(options: IRestTesterOptions) {
        options = Object.assign({headers:{}}, options);
        if (this.config.authToken) {
            options.headers['authorization'] = this.config.authToken;
        }
        return options;
    }
}
