import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';

export function simpleServer() {

// Create the minimal express with CORS and bodyParser.json
    const app = express();
    app.use(bodyParser.json());
    app.use(cors({
        origin: '*',
        methods: 'GET,POST,PUT,DELETE,OPTIONS',
        allowedHeaders: 'Origin,Content-Type,Accept,Authorization',
        preflightContinue: false,
        optionsSuccessStatus: 204,
    }));

    return app;
}
