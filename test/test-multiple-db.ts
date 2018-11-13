import * as express from 'express';
import { Typegoose } from 'typegoose';
import * as mongoose from 'mongoose';
import * as bodyParser from 'body-parser';
import { Restgoose, all, create, one, remove, removeAll, rest, update, prop } from '../src';
import * as cors from 'cors';

const connectionA = mongoose.createConnection('mongodb://localhost/restgoose-test-multiple-db-a');
const connectionB = mongoose.createConnection('mongodb://localhost/restgoose-test-multiple-db-b');

@rest({
    /*getModel: async (req: express.Request, model: Constructor<Item>) => {
        return model.prototype.getModelForClass({ existingConnection: connectionA });
    },*/
    getConnection: async(req: express.Request) => {
        const clientName = req.baseUrl.split('/')[1];
        console.log(clientName);
        return clientName === 'dba' ? connectionA : connectionB;
    },
    route: '/items',
    methods: [
        all(), // GET /todos
        one(), // GET /todos/:id
        create(), // POST /todos
        update(), // PATCH /todos/:id
        remove(), // DELETE /todos/:id
        removeAll(), // DELETE /todos
    ],
})
export class Item extends Typegoose {
    @prop({required: true})
    title: string;
}

//export const ItemModel = new Item().getModelForClass(Item);

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

app.use('/dba', Restgoose.initialize());
app.use('/dbb', Restgoose.initialize());
//----------------------------------------------------------------------------------------------------------------------

import * as chai from 'chai';
import * as dirtyChai from 'dirty-chai';
import 'mocha';
import { RestTester } from './util/rest-tester';

chai.use(dirtyChai);

const expect = chai.expect;

const restTester = new RestTester({
    app: app
});

describe('Multiple DB', function() {
    it('prepare', function() {
        return Promise.resolve()
        // deletes everything
        .then(() => restTester.delete('/dba/items'))
        .then(() => restTester.delete('/dbb/items'))
        .then(() => restTester.post('/dba/items', { title: 'Item 0 from DB A' }))
        .then(() => restTester.post('/dbb/items', { title: 'Item 0 from DB B' }))
    });

    describe('calling on DB A', function () {
        it('should only return items from DB A', function() {
            return Promise.resolve()
            .then(() => restTester.get('/dba/items'))
            .then(({ code, body, headers }) => {
                expect(code).to.eq(200);
                expect(body).to.be.an('array');
                expect(body.map(i => i.title)).to.deep.eq(['Item 0 from DB A']);
                return true;
            })
        });
    });

    describe('calling on DB B', function () {
        it('should only return items from DB B', function() {
            return Promise.resolve()
            .then(() => restTester.get('/dbb/items'))
            .then(({ code, body, headers }) => {
                expect(code).to.eq(200);
                expect(body).to.be.an('array');
                expect(body.map(i => i.title)).to.deep.eq(['Item 0 from DB B']);
                return true;
            })
        });
    });
});