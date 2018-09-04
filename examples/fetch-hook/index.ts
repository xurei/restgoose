import * as express from 'express';
import { Request } from 'express';
import { InstanceType, prop, Typegoose } from 'typegoose';
import * as mongoose from 'mongoose';
import * as bodyParser from 'body-parser';
import { Restgoose, all, create, one, remove, removeAll, rest, update, RestError } from '../../lib';
import * as cors from 'cors';

@rest({
    route: '/otheritems',
    methods: [
        all({ fetch: otherItemFetchAll }),
        one({ fetch: otherItemFetchOne }),
        create(),
        removeAll(),
    ],
})
export class OtherItem extends Typegoose {
    @prop({required: true})
    name: string;

    @prop({required: true})
    value: number;

    @prop({required: true, default: false})
    public: boolean;
}

export const OtherItemModel = new OtherItem().getModelForClass(OtherItem);

async function otherItemFetchAll(req: Request) {
    return OtherItemModel.find({ public: true });
}
async function otherItemFetchOne(req: Request) {
    return OtherItemModel.findOne({ public: true, _id: req.params.id });
}

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

openDatabase();
Restgoose.initialize(app);
let server = require('http').createServer(app);
server = server.listen(3002, function () {
    console.log('Example app listening on port 3002!')
});

function openDatabase() {
    // Business as usual - connect to your database with mongoose
    const mongoHost = process.env.MONGO_URI || 'mongodb://localhost/restgoose-example';
    console.log('Mongo Host:', mongoHost);
    mongoose.connect(mongoHost)
    .catch(e => {
        console.error('MongoDB Connection Error:');
        console.error(JSON.stringify(e, null, '  '));
    });
    mongoose.connection.on('error', err => {
        console.error(`Connection error: ${err.message}`);
    });
    mongoose.connection.once('open', () => {
        console.info('Connected to database');
    });
}

export { app, server };