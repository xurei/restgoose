import * as chai from 'chai';
import * as dirtyChai from 'dirty-chai';
import 'mocha';
import { RestTester } from './util/rest-tester';

import * as MockReq from 'mock-req';

import { simpleServer } from './util/simple-server';
import { Restgoose, RestgooseModel, prop, all, create, one, remove, removeAll, rest, update } from '../lib';
import { openDatabase } from './util/open-database';

const app = simpleServer();

enum FieldValues {
    A = "a",
    B = "b",
    C = 3
}

@rest({
    route: '/items',
    methods: [
        one(), // GET /todos/:id
        create(), // POST /todos
        removeAll(), // DELETE /todos
    ],
})
export class Item extends RestgooseModel {
    @prop({required: true})
    title: FieldValues;
}

app.use(Restgoose.initialize([Item]));
// ---------------------------------------------------------------------------------------------------------------------
chai.use(dirtyChai);

const expect = chai.expect;

const restTester = new RestTester({
    app: app
});

describe('Minimal TODO API', function() {
    this.timeout(20000); //20s timeout

    let id = null;

    before(function () {
        openDatabase('restgoose-test-enum-fields');
        return restTester.delete('/items')
        .then(res => {
            expect(res.status).to.eq(204);
            return true;
        })
        .then(() => restTester.post('/items', {
            title: 'a'
        }))
        .then(res => {
            const status = res.status as number;
            expect(status).to.eq(201);
            id = res.body['_id'];
            return true;
        });
    });

    describe('/items', function() {
        describe('create()', function () {
            it('works', function () {
                let newId = null;
                return restTester.post('/items', {
                    title: 'b'
                })
                .then(res => {
                    const body = res.body as any;
                    const status = res.status as number;
                    expect(status).to.eq(201);
                    expect(body.title).to.eq('b');
                    newId = body._id;
                    return true;
                })
                .then(() => restTester.get('/items/' + newId))
                .then(res => {
                    const body = res.body as any;
                    const status = res.status as number;
                    expect(status).to.eq(200);
                    expect(body.title).to.eq('b');
                    return true;
                });
            });
        });
    });
});
