import * as chai from 'chai';
import * as chaiHttp from 'chai-http';

chai.use(chaiHttp);

export interface IRestTesterConfiguration {
    baseUrl: string;
    authToken?: string;
}

export interface IRestTesterOptions {
    headers?: object;
}

export class RestTester {
    private config: IRestTesterConfiguration;

    public constructor(config: IRestTesterConfiguration) {
        this.config = Object.assign({}, config);
        // const initPromise = request.get(buildUrl('/reset'));
    }

    public as(token: string): RestTester {
        return new RestTester(Object.assign({}, this.config, {
            authToken: token,
        }));
    }

    public post(route: string, payload: object, options?: IRestTesterOptions): Promise<Response> {
        let out = chai.request(this.config.baseUrl).post(route);

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
        let out = chai.request(this.config.baseUrl).put(route);

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
        let out = chai.request(this.config.baseUrl).get(route);

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
        let out = chai.request(this.config.baseUrl).delete(route);

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
