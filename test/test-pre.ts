import * as chai from 'chai';
import * as dirtyChai from 'dirty-chai';
import 'mocha';
import { RestTester } from './util/rest-tester';
import { Model, MongooseDocument } from 'mongoose';

import { simpleServer } from './util/simple-server';
import { Restgoose, RestgooseModel, prop, create, one, removeAll, rest, update, pre } from '../lib';
import { openDatabase } from './util/open-database';

const app = simpleServer();
openDatabase('restgoose-test-pre');

@rest({
    route: '/items',
    methods: [
        one(),
        create(),
        update(),
        removeAll(),
    ],
})
@pre('save', function (item: RestgooseDocument<PreTest>) {
    if (item.isModified('secret')) {
        item.secret = item.secret + ' secret';
    }
})
@pre('save', function (item: RestgooseDocument<PreTest>) {
    if (item.isModified('secret')) {
        item.secret = item.secret + ' and something';
    }
})
export class PreTest extends RestgooseModel {
    @prop({required: true})
    title: string;

    @prop({required: true})
    secret: string;
}

app.use(Restgoose.initialize([PreTest]));
// ---------------------------------------------------------------------------------------------------------------------
chai.use(dirtyChai);

const expect = chai.expect;

const restTester = new RestTester({
    app: app
});

describe('@pre', function() {
    this.timeout(20000); //20s timeout

    before(() => {
        return (
            restTester.delete('/items')
            .then(res => {
                const status = res.status as number;
                expect(status).to.eq(204);
                return true;
            })
        );
    });
    describe('/items', function() {
        describe('create()', function () {
            it('updates the secret field', function () {
                let newId = null;
                return restTester.post('/items', {
                    title: 'First todo',
                    secret: 'test',
                })
                .then(res => {
                    const body = res.body as any;
                    const status = res.status as number;
                    expect(status).to.eq(201);
                    newId = body._id;
                    delete body._id;
                    delete body.__v;
                    expect(body).to.deep.eq({
                        title: 'First todo',
                        secret: 'test and something secret'
                    });
                    return true;
                })
                .then(() => restTester.get('/items/' + newId))
                .then(res => {
                    const body = res.body as any;
                    const status = res.status as number;
                    expect(status).to.eq(200);
                    expect(body.title).to.eq('First todo');
                    return true;
                });
            });
        });

        describe('update()', function () {
            it('200', function () {
                let newId = null;
                return restTester.post('/items', {
                    title: 'topatch',
                    secret: 'plop'
                })
                .then(res => {
                    const body = res.body as any;
                    const status = res.status as number;
                    expect(status).to.eq(201);
                    newId = body._id;
                    return true;
                })
                .then(() => restTester.patch('/items/'+newId, {
                    secret: 'ping'
                }))
                .then(res => {
                    const body = res.body as any;
                    const status = res.status as number;
                    expect(status).to.eq(200);
                    expect(body.secret).to.eq('ping and something secret');
                    return true;
                });
            });
        });
    });
});
