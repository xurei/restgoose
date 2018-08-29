import * as chai from 'chai';
import * as dirtyChai from 'dirty-chai';
import 'mocha';
import { RestTester } from './util/rest-tester';

import { app } from '../examples/complex-api';

chai.use(dirtyChai);

const expect = chai.expect;

const restTester = new RestTester({
    app: app
});

describe('Complex API', function() {
    this.timeout(20000); //20s timeout

    let itemIds = null;
    it('prepare', function() {
        return Promise.resolve()

        // deletes everything
        .then(() => restTester.delete('/items'))
        .then(({ code,body,headers }) => {
            expect(code).to.eq(204);
            return true;
        })
        .then(() => restTester.get('/items'))
        .then(({ code, body, headers }) => {
            expect(code).to.eq(200);
            expect(body).to.deep.eq([]);
            return true;
        })

        // populates items
        .then(() => Promise.all([
            restTester.post('/items', { title: 'item1' }),
            restTester.post('/items', { title: 'item2' }),
            restTester.post('/items', { title: 'item3' }),
            restTester.post('/items', { title: 'item4' }),
            restTester.post('/items', { title: 'item5' }),
            restTester.post('/items', { title: 'item6' })
        ]))
        .then((items) => {
            itemIds = items.map(i => i.body._id);
            return true;
        })
        .then(() => restTester.get('/items'))
        .then(({ code, body, headers }) => {
            expect(code).to.eq(200);
            expect(body).to.have.length(6);
            return true;
        });
    });

    describe('/items', function() {
        describe('all() within item', function() {
            describe('without Autorization', function() {
                it('401', function () {
                    return Promise.resolve()
                    .then(() => restTester.post('/items/'+itemIds[0]+'/subitems', { name: 'val1', value: 1 }))
                    .then(({ code, body, headers }) => {
                        expect(code).to.eq(401);
                    });
                });
            });
            describe('with Autorization', function() {
                it('201', function () {
                    let subItemId = null;
                    return Promise.resolve()
                    .then(() => restTester.as('admin').post('/items/'+itemIds[0]+'/subitems', { name: 'val1', value: 1 }))
                    .then(({ code, body, headers }) => {
                        expect(code).to.eq(201);
                    })
                    .then(() => restTester.as('admin').get('/items/'+itemIds[0]))
                    .then(({ code, body, headers }) => {
                        expect(code).to.eq(200);
                        console.log(body);
                        expect(body.subItems).to.have.length(1);
                        subItemId = body.subItems[0];
                    })
                    .then(() => restTester.as('admin').get('/subitems/'+subItemId))
                    .then(({ code, body, headers }) => {
                        expect(code).to.eq(200);
                        console.log(body);
                        expect(body.name).to.eq('val1');
                        expect(body.value).to.eq(1);
                    })
                });
            });
        })
    });
});
