import * as express from 'express';
import { Typegoose } from 'typegoose';
import * as mongoose from 'mongoose';
import * as bodyParser from 'body-parser';
import { Restgoose, all, create, one, remove, removeAll, rest, update, Ref, prop } from '../src';
import * as cors from 'cors';
import { ObjectId } from 'mongodb';

const connectionA = mongoose.createConnection('mongodb://localhost/restgoose-test-extended-model');

class InnerItem {
    innerTitle: string;
}

class ParentItem extends Typegoose {
    @prop({required: true})
    title: string;
}

@rest({
    getConnection: async(req: express.Request) => {
        return connectionA;
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
export class Item extends ParentItem {
    @prop({})
    subtitle: string;

    @prop()
    inner: InnerItem;
}

export const ItemModel = new Item().getModelForClass(Item);

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

describe('Extended model', function() {
    it('prepare', function() {
        return Promise.resolve()
        // deletes everything
        .then(() => restTester.delete('/dba/items'))
        .then(() => restTester.post('/dba/items', { title: 'Item 0 from DB A', subtitle: 'this is a subtitle', inner: {innerTitle: 'my inner title'} }))
        .then(({ code, body, headers }) => {
            console.log(code);
            console.log(body);
        });
    });

    describe('all()', function () {
        it('should only return items from DB', function() {
            return Promise.resolve()
            .then(() => restTester.get('/dba/items'))
            .then(({ code, body, headers }) => {
                expect(code).to.eq(200);
                expect(body).to.be.an('array');
                expect(body.map(i => i.title)).to.deep.eq(['Item 0 from DB A']);
                expect(body.map(i => i.subtitle)).to.deep.eq(['this is a subtitle']);
                expect(body.map(i => i.inner)).to.deep.eq([{innerTitle: 'my inner title'}]);
                return true;
            })
        });
    });
});