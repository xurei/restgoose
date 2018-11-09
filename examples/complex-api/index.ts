import * as express from 'express';
import { Request, Response } from 'express';
import { arrayProp, prop, Ref, Typegoose } from 'typegoose';
import * as mongoose from 'mongoose';
import * as bodyParser from 'body-parser';
import { Restgoose, all, create, one, remove, removeAll, rest, update, RestError, and, or } from '../../lib';
import * as cors from 'cors';

@rest({
    route: '/subitems',
    methods: [
        one({ preFetch: and(verifyToken) }), // GET /subitems/:id
    ],
})
export class SubItem extends Typegoose {
    @prop({required: true})
    name: string;

    @prop({required: true})
    value: number;
}

@rest({
    route: '/items',
    methods: [
        all(),
        one(),
        create(),
        update(),
        remove(),
        removeAll(),
    ],
})
export class Item extends Typegoose {
    @prop({required: true})
    title: string;

    @rest({
        route: '/subitems',
        methods: [
            all({ preFetch: verifyToken }),
            create({ preFetch: verifyToken }),
        ],
    })
    @arrayProp({itemsRef: {name: SubItem}})
    subItems: Ref<SubItem>[];
}
export const ItemModel = new Item().getModelForClass(Item);
export const SubItemModel = new SubItem().getModelForClass(SubItem);

async function verifyToken(req: Request) {
    // !!! This is NOT safe !!! Just for the sake of the example
    const header = req.headers.authorization;
    if (header !== 'admin') {
        throw new RestError(401);
    }
    return true;
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
app.use(Restgoose.initialize());
let server = require('http').createServer(app);
server = server.listen(3001, function () {
    console.log('Example app listening on port 3001!')
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