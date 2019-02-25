import * as chai from 'chai';
import * as dirtyChai from 'dirty-chai';
import 'mocha';
import { RestTester } from './util/rest-tester';

import * as MockReq from 'mock-req';

import { prop, Typegoose } from 'typegoose';
import { simpleServer } from './util/simple-server';
import { Restgoose, all, create, one, remove, removeAll, rest, update } from '../lib';
import { openDatabase } from './util/open-database';

const app = simpleServer();

@rest({
    route: '/todos',
    methods: [
        all(), // GET /todos
        one(), // GET /todos/:id
        create(), // POST /todos
        update(), // PATCH /todos/:id
        remove(), // DELETE /todos/:id
        removeAll(), // DELETE /todos
    ],
})
export class Todo extends Typegoose {
    @prop({required: true})
    title: string;
}

app.use(Restgoose.initialize([Todo]));
// ---------------------------------------------------------------------------------------------------------------------
chai.use(dirtyChai);

const expect = chai.expect;

const restTester = new RestTester({
    app: app
});

describe('Minimal TODO API', function() {
    this.timeout(20000); //20s timeout

    before(() => {
        return openDatabase('restgoose-test-minimal-todo');
    });

    describe('/todos', function() {
        describe('deleteAll()', function() {
            it('works', function () {
                return restTester.delete('/todos')
                .then(res => {
                    const body = res.body as any;
                    const status = res.status as number;
                    expect(status).to.eq(204);
                    return true;
                })
                .then(() => restTester.get('/todos'))
                .then(res => {
                    const body = res.body as any;
                    const status = res.status as number;
                    expect(status).to.eq(200);
                    expect(body).to.deep.eq([]);
                    return true;
                });
            });
        });

        describe('create()', function () {
            describe('with missing fields payload', function () {
                it('should reject the creation', function () {
                    return (
                        restTester.post('/todos', {})
                        .then(res => {
                            const body = res.body as any;
                            console.log(body);
                            const status = res.status as number;
                            expect(status).to.eq(400);
                        })
                    );
                });
            });

            it('works', function () {
                let newId = null;
                return restTester.post('/todos', {
                    title: 'First todo'
                })
                .then(res => {
                    const body = res.body as any;
                    const status = res.status as number;
                    expect(status).to.eq(201);
                    newId = body._id;
                    delete body._id;
                    delete body.__v;
                    expect(body).to.deep.eq({
                        title: 'First todo'
                    });
                    return true;
                })
                .then(() => restTester.get('/todos/' + newId))
                .then(res => {
                    const body = res.body as any;
                    const status = res.status as number;
                    expect(status).to.eq(200);
                    expect(body.title).to.eq('First todo');
                    return true;
                });
            });
        });

        describe('one()', function () {
            it('syntaxically incorrect id', function () {
                return Promise.resolve()
                .then(() => restTester.get('/todos/incorrect'))
                .then(res => {
                    const body = res.body as any;
                    const status = res.status as number;
                    expect(status).to.eq(404);
                    expect(body).to.deep.eq({code: 'NOT_FOUND'});
                    return true;
                })
            });
            it('non-existing entity', function () {
                return Promise.resolve()
                .then(() => restTester.get('/todos/000000000000000000000000'))

                .then(res => {
                    const body = res.body as any;
                    const status = res.status as number;
                    expect(status).to.eq(404);
                    expect(body).to.deep.eq({code: 'NOT_FOUND'});
                    return true;
                })
            });
        });

        describe('delete()', function () {
            it('works', function () {
                let newId = null;
                return Promise.resolve()
                .then(() => restTester.post('/todos', {
                    title: 'blah'
                }))

                .then(res => {
                    const body = res.body as any;
                    const status = res.status as number;
                    expect(status).to.eq(201);
                    newId = body._id;
                    return true;
                })
                .then(() => restTester.delete('/todos/'+newId))

                .then(res => {
                    const body = res.body as any;
                    const status = res.status as number;
                    expect(status).to.eq(204);
                    expect(body).to.deep.eq({});
                    return true;
                })
                .then(() => restTester.get('/todos/'+newId))

                .then(res => {
                    const body = res.body as any;
                    const status = res.status as number;
                    expect(status).to.eq(404);
                    expect(body).to.deep.eq({code: 'NOT_FOUND'});
                    return true;
                })
            });
        });

        describe('update()', function () {
            it('200', function () {
                let newId = null;
                return restTester.post('/todos', {
                    title: 'topatch'
                })

                .then(res => {
                    const body = res.body as any;
                    const status = res.status as number;
                    expect(status).to.eq(201);
                    newId = body._id;
                    return true;
                })
                .then(() => restTester.patch('/todos/'+newId, {
                    title: 'patched'
                }))
                .then(res => {
                    const body = res.body as any;
                    const status = res.status as number;
                    expect(status).to.eq(200);
                    expect(body.title).to.eq('patched');
                    return true;
                });
            });
        });

        describe('getAll()', function() {
            it('should contain the same data as all()', function() {
                let fromAll = null;
                let fromGetAll = null;

                return Promise.resolve()
                .then(() => restTester.get('/todos')) // all()
                .then(res => {
                    const body = res.body as any;
                    const status = res.status as number;
                    expect(status).to.eq(200);
                    fromAll = body;
                    return Restgoose.getAll(Todo, new MockReq());
                })
                .then((data) => {
                    fromGetAll = data.map(item => JSON.parse(JSON.stringify(item)));
                    expect(fromGetAll).to.deep.eq(fromAll);
                    return true;
                })
            });

            //TODO check all() defined
        });

        describe('getOne()', function() {
            it('should contain the same data as one()', function() {
                let fromOne = null;
                let fromGetOne = null;
                let newId = null;

                return Promise.resolve()
                .then(() => restTester.post('/todos', {
                    title: 'blah'
                }))
                .then(res => {
                    const body = res.body as any;
                    newId = body._id;
                })
                .then(() => restTester.get('/todos/'+newId)) // one()
                .then(res => {
                    const body = res.body as any;
                    const status = res.status as number;
                    expect(status).to.eq(200);
                    fromOne = body;
                    const req = new MockReq();
                    req.params = {
                        id: `${newId}`
                    };
                    return Restgoose.getOne(Todo, req);
                })
                .then((item) => {
                    fromGetOne = JSON.parse(JSON.stringify(item));
                    expect(fromGetOne).to.deep.eq(fromOne);
                    return true;
                })
            });

            //TODO check one() defined
        });

        describe('all() with filter', function() {
            it('should filter the returned documents', function () {
                return Promise.resolve()
                .then(() => restTester.get('/todos?q='+JSON.stringify({title:"blah"})))
                .then(res => {
                    const body = res.body as any;
                    const status = res.status as number;
                    expect(status).to.eq(200);
                    //TODO check the content
                });
            });
        });
    });
});
