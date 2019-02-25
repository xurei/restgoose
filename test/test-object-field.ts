import * as chai from 'chai';
import * as dirtyChai from 'dirty-chai';
import 'mocha';
import { RestTester } from './util/rest-tester';

import * as MockReq from 'mock-req';

import { simpleServer } from './util/simple-server';
import { Restgoose, RestgooseModel, prop, all, create, one, remove, removeAll, rest, update } from '../lib';
import { openDatabase } from './util/open-database';

const app = simpleServer();

@rest({
    route: '/items',
    methods: [
        one(), // GET /todos/:id
        create(), // POST /todos
        removeAll(), // DELETE /todos
    ],
})
export class ObjectField extends RestgooseModel {
    @prop({required: true})
    data: {
        name: string;
        value: string;
    };
}

app.use(Restgoose.initialize([ObjectField]));
// ---------------------------------------------------------------------------------------------------------------------
chai.use(dirtyChai);

const expect = chai.expect;

const restTester = new RestTester({
    app: app
});

describe('Field: Object', function() {
    this.timeout(20000); //20s timeout

    let id = null;

    before(function () {
        return openDatabase('restgoose-test-object-field')
        .then(() => restTester.delete('/items'))
        .then(res => {
            expect(res.status).to.eq(204);
            return true;
        })
        .then(() => restTester.post('/items', {
            data: {
                name: 'plop',
                value: 'plup'
            }
        }))
        .then(res => {
            console.log(res.body);
            const status = res.status as number;
            expect(status).to.eq(201);
            id = res.body['_id'];
            return true;
        });
    });

    describe('/items', function() {
        describe('create()', function () {
            describe.skip('with an data value', function () {
                // TODO Restgoose cannot validate data inside object litterals. It's probably impossible to change, but worth investigation
                it('should reject', function () {
                    return restTester.post('/items', {
                        data: {
                            missing: 'fields',
                        }
                    })
                    .then(res => {
                        console.log(res.body);
                        const status = res.status as number;
                        expect(status).to.eq(400);
                        return true;
                    })
                });
            });
            it('works', function () {
                let newId = null;
                return restTester.post('/items', {
                    data: {
                        name: 'hello',
                        value: 'world'
                    }
                })
                .then(res => {
                    const body = res.body as any;
                    const status = res.status as number;
                    expect(status).to.eq(201);
                    expect(body.data).to.deep.eq({
                        name: 'hello',
                        value: 'world'
                    });
                    newId = body._id;
                    return true;
                })
                .then(() => restTester.get('/items/' + newId))
                .then(res => {
                    const body = res.body as any;
                    const status = res.status as number;
                    expect(status).to.eq(200);
                    expect(body.data).to.deep.eq({
                        name: 'hello',
                        value: 'world'
                    });
                    return true;
                });
            });
        });
    });
});
