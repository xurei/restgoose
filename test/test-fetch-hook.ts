import * as chai from 'chai';
import * as dirtyChai from 'dirty-chai';
import 'mocha';
import { RestTester } from './util/rest-tester';

import { prop, Typegoose } from 'typegoose';
import { simpleServer } from './util/simple-server';
import { Request } from 'express';
import { Restgoose, all, create, one, removeAll, rest, getModel } from '../lib';
import { Constructor } from '../lib/types';
import { openDatabase } from './util/open-database';
const sinon = require('sinon');

const app = simpleServer();

async function otherItemFetchAll(req: Request) {
    return FetchHookModel.find({ public: true });
}
async function otherItemFetchOne(req: Request) {
    return FetchHookModel.findOne({ public: true, _id: req.params.id });
}
async function _otherItemFetchCreate<T extends Typegoose>(req: Request, modelType: Constructor<T>) {
    return new modelType({public: false, value: 0, name: req.body.name});
}
const otherItemFetchCreate = sinon.spy(_otherItemFetchCreate);

@rest({
    route: '/otheritems',
    methods: [
        all({ fetch: otherItemFetchAll }),
        one({ fetch: otherItemFetchOne }),
        create(),
        removeAll(),
    ],
})
export class FetchHook extends Typegoose {
    @prop({required: true})
    name: string;

    @prop({required: true})
    value: number;

    @prop({required: true, default: false})
    public: boolean;
}

@rest({
    route: '/otheritems2',
    methods: [
        all(),
        one(),
        create({ fetch: otherItemFetchCreate }),
        removeAll(),
    ],
})
export class FetchHook2 extends Typegoose {
    @prop({required: true})
    name: string;

    @prop({required: true})
    value: number;

    @prop({required: true, default: false})
    public: boolean;
}

export const FetchHookModel = getModel(FetchHook);

app.use(Restgoose.initialize([FetchHook, FetchHook2]));
// ---------------------------------------------------------------------------------------------------------------------

chai.use(dirtyChai);

const expect = chai.expect;

const restTester = new RestTester({
    app: app
});

describe('Fetch hook', function() {
    this.timeout(20000); //20s timeout

    before(() => {
        return openDatabase('restgoose-test-fetch-hook');
    });

    let itemIds = null;
    it('prepare', function() {
        console.log('BEFORE');
        return Promise.resolve()
        // deletes everything
        .then(() => restTester.delete('/otheritems'))
        .then(res => {
            const body = res.body as any;
            const status = res.status as number;
            expect(status).to.eq(204);
            return true;
        })
        .then(() => restTester.get('/otheritems'))
        .then(res => {
            const body = res.body as any;
            const status = res.status as number;
            expect(status).to.eq(200);
            expect(body).to.deep.eq([]);
            return true;
        })
        // populates items
        .then(() => Promise.all([
            restTester.post('/otheritems', { name: 'item1', value: 1, public: true }),
            restTester.post('/otheritems', { name: 'item2', value: 2, public: false }),
            restTester.post('/otheritems', { name: 'item3', value: 3, public: true }),
            restTester.post('/otheritems', { name: 'item4', value: 4, public: true }),
            restTester.post('/otheritems', { name: 'item5', value: 5, public: false }),
            restTester.post('/otheritems', { name: 'item6', value: 6, public: true }),
        ]))
        .then((items) => {
            itemIds = items.map(i => (i.body as any)._id);
            return true;
        })
    });

    describe('all()', function() {
        it('should only return entities with public: true', function () {
            return Promise.resolve()
            .then(() => restTester.get('/otheritems'))
            .then(res => {
                const body = res.body as any;
                const status = res.status as number;
                expect(status).to.eq(200);
                expect(body).to.have.length(4);
                expect(body.map(i => i.value).sort()).to.deep.eq([ 1, 3, 4, 6 ]);
                return true;
            });
        });
    });

    describe('one()', function() {
        it('should only return entities with public: true', function () {
            return Promise.resolve()
            .then(() => restTester.get('/otheritems/'+itemIds[0]))
            .then(res => {
                const body = res.body as any;
                const status = res.status as number;
                expect(status).to.eq(200);
                expect(body.value).to.eq(1);
                return true;
            })
            .then(() => restTester.get('/otheritems/'+itemIds[1]))
            .then(res => {
                const body = res.body as any;
                const status = res.status as number;
                expect(status).to.eq(404);
                return true;
            });
        });
    });

    describe('create()', function() {
        it('should create the new item with the custom method defined', function () {
            return Promise.resolve()
            .then(() => restTester.post('/otheritems2', {
                name: 'test'
            }))
            .then(res => {
                const body = res.body as any;
                const status = res.status as number;
                console.log(body);
                expect(status).to.eq(201);
                delete body._id;
                expect(body).to.deep.eq({
                    __v: 0,
                    name: 'test',
                    public: false,
                    value: 0,
                });
                expect(otherItemFetchCreate.callCount).to.eq(1);
                return true;
            });
        });
    });

    //TODO test an aggregate fetch (needs to add code in the example)
});
