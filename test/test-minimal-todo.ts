import * as chai from 'chai';
import * as dirtyChai from 'dirty-chai';
import 'mocha';
import { RestTester } from './util/rest-tester';

import { app, server } from '../examples/minimal-todo';

chai.use(dirtyChai);

const expect = chai.expect;

const restTester = new RestTester({
    app: app
});

describe('Minimal TODO API', function() {
    this.timeout(20000); //20s timeout

    describe('/todos', function() {
        it('deleteAll()', function () {
            return restTester.delete('/todos')
            .then(({ code,body,headers }) => {
                expect(code).to.eq(204);
                return true;
            })
            .then(() => restTester.get('/todos'))
            .then(({ code, body, headers }) => {
                expect(code).to.eq(200);
                expect(body).to.deep.eq([]);
                return true;
            });
        });

        it('create()', function () {
            let newId = null;
            return restTester.post('/todos', {
                title: 'First todo'
            })
            .then(({ code,body,headers }) => {
                expect(code).to.eq(201);
                newId = body._id;
                delete body._id;
                delete body.__v;
                expect(body).to.deep.eq({
                    title: 'First todo'
                });
                return true;
            })
            .then(() => restTester.get('/todos/'+newId))
            .then(({ code,body,headers }) => {
                expect(code).to.eq(200);
                expect(body.title).to.eq('First todo');
                return true;
            })
        });

        describe('one()', function () {
            it('syntaxically incorrect id', function () {
                return Promise.resolve()
                .then(() => restTester.get('/todos/incorrect'))
                .then(({ code,body,headers }) => {
                    expect(code).to.eq(404);
                    expect(body).to.deep.eq({code: 'NOT_FOUND'});
                    return true;
                })
            });
            it('non-existing entity', function () {
                return Promise.resolve()
                .then(() => restTester.get('/todos/000000000000000000000000'))
                .then(({ code,body,headers }) => {
                    expect(code).to.eq(404);
                    expect(body).to.deep.eq({code: 'NOT_FOUND'});
                    return true;
                })
            });
        });

        describe('patch()', function () {
            it('200', function () {
                let newId = null;
                return restTester.post('/todos', {
                    title: 'topatch'
                })
                .then(({ code,body,headers }) => {
                    expect(code).to.eq(201);
                    newId = body._id;
                    return true;
                })
                .then(() => restTester.patch('/todos/'+newId, {
                    title: 'patched'
                }))
                .then(({ code, body, headers }) => {
                    expect(code).to.eq(200);
                    expect(body.title).to.eq('patched');
                    return true;
                });
            });
        });
    });
});