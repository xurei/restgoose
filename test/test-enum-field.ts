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
    C = "c"
}

@rest({
    route: '/items',
    methods: [
        one(), // GET /todos/:id
        create(), // POST /todos
        removeAll(), // DELETE /todos
    ],
})
export class EnumField extends RestgooseModel {
    @prop({required: true, enum: FieldValues})
    title: FieldValues;

    @prop({required: true, enum: ['a', 'b', 'c']})
    title2: string;
}

app.use(Restgoose.initialize([EnumField]));
// ---------------------------------------------------------------------------------------------------------------------
chai.use(dirtyChai);

const expect = chai.expect;

const restTester = new RestTester({
    app: app
});

describe('Field: enum', function() {
    this.timeout(20000); //20s timeout

    let id = null;

    before(function () {
        return openDatabase('restgoose-test-enum-fields')
        .then(() => restTester.delete('/items'))
        .then(res => {
            expect(res.status).to.eq(204);
            return true;
        })
        .then(() => restTester.post('/items', {
            title: 'a', title2: 'a'
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
            describe('with an invalid enum value', function () {
                it('should reject', function () {
                    return restTester.post('/items', {
                        title: 'wrong', title2: 'b'
                    })
                    .then(res => {
                        const body = res.body as any;
                        const status = res.status as number;
                        expect(status).to.eq(400);
                        return true;
                    })
                });
            });
            describe('with an invalid enum value (2)', function () {
                it('should reject', function () {
                    return restTester.post('/items', {
                        title: 'a', title2: 'wrong'
                    })
                    .then(res => {
                        console.log(res.body);
                        const body = res.body as any;
                        const status = res.status as number;
                        expect(status).to.eq(400);
                        return true;
                    })
                });
            });
            it('works', function () {
                let newId = null;
                return restTester.post('/items', {
                    title: 'b', title2: 'c'
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
