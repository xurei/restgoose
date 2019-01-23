import * as express from 'express';
import { Request } from 'express';
import { Typegoose } from 'typegoose';
import * as mongoose from 'mongoose';
import { Restgoose, all, create, one, remove, removeAll, rest, update, prop } from '../lib';
import * as chai from 'chai';
import * as dirtyChai from 'dirty-chai';
import 'mocha';
import { RestTester } from './util/rest-tester';
import { simpleServer } from './util/simple-server';

const mongoUri = (process.env.MONGO_URI || 'mongodb://localhost/') + 'restgoose-test-extended-model';
const connectionA = mongoose.createConnection(mongoUri);

export async function parseQuery(req: Request) {
    if (req.query && req.query.q) {
        try {
            req['filter'] = JSON.parse(req.query.q);
            return true;
        } catch (e) {
            return false;
        }
    } else {
        return true;
    }
}

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
        all({
            preFetch: parseQuery,
        }), // GET /todos
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

    @prop()
    someDate: Date;
}

// Create the minimal express with CORS and bodyParser.json
const app = simpleServer();

app.use('/dba', Restgoose.initialize());
//----------------------------------------------------------------------------------------------------------------------

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
        .then(({ status, body, headers }) => {
            //console.log(code);
            //console.log(body);
        });
    });

    describe('all()', function () {
        describe('with a faulty filter', () => {
            let fetch;
            before(() => {
                fetch = restTester.get(`/dba/items?q=${encodeURIComponent(JSON.stringify({someDate:{$gt:{$faulty:'2018-01-01'}}}))}`);
            });
            it('should return an error', function () {
                return fetch
                .then(res => {
                    const body = res.body as any;
                    const status = res.status as number;
                    console.log(body);
                    expect(status).to.eq(500);

                    return true;
                });
            });
        });

        it('should only return items from DB', function() {
            return Promise.resolve()
            .then(() => restTester.get('/dba/items'))
            .then(res => {
                const body = res.body as any;
                const status = res.status as number;
                expect(status).to.eq(200);
                expect(body).to.be.an('array');
                expect(body.map(i => i.title)).to.deep.eq(['Item 0 from DB A']);
                expect(body.map(i => i.subtitle)).to.deep.eq(['this is a subtitle']);
                expect(body.map(i => i.inner)).to.deep.eq([{innerTitle: 'my inner title'}]);
                return true;
            })
        });
    });
});
