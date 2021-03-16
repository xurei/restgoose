import * as chai from 'chai';
import * as dirtyChai from 'dirty-chai';
import 'mocha';
import { RestTester } from './util/rest-tester';

import * as MockReq from 'mock-req';

import { simpleServer } from './util/simple-server';
import { Restgoose, RestgooseModel, prop, all, create, one, remove, removeAll, rest, update } from '../lib';

const openDatabase = (global as any).openDatabase;
const app = simpleServer();

@rest({
    route: '/object-field__items',
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
        return openDatabase('restgoose-test')
        .then(() => restTester.delete('/object-field__items'))
        .then(res => {
            expect(res.status).to.eq(204);
            return true;
        })
        .then(() => restTester.post('/object-field__items', {
            data: {
                name: 'plop',
                value: 'plup'
            }
        }))
        .then(res => {
            console.log(res.body);
            const status = res.status as number;
            expect(status).to.eq(201);
            id = res.body['_id'] || res.body['id'];
            return true;
        });
    });

    describe('create()', function () {
        describe.skip('with an invalid data value', function () {
            // Restgoose cannot validate data inside object litterals due to limitations of Typescript/Javascript. It's probably impossible to change, but worth investigation
            it('should reject', function () {
                return restTester.post('/object-field__items', {
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

        describe('then one()', function() {
            describe('with a valid data value', function () {
                it('works', function () {
                    let newId = null;
                    return restTester.post('/object-field__items', {
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
                        newId = body._id || body.id;
                        return true;
                    })
                    .then(() => restTester.get('/object-field__items/' + newId))
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
});
