import * as chai from 'chai';
import * as dirtyChai from 'dirty-chai';
import 'mocha';
import { RestTester } from './util/rest-tester';

import { arrayProp, prop, Ref, Typegoose } from 'typegoose';
import { simpleServer } from './util/simple-server';
import { Request } from 'express';
import { Restgoose, all, create, one, remove, removeAll, rest, update, and, RestError } from '../src';
import { openDatabase } from './util/open-database';

//import { app } from '../examples/complex-api';

const app = simpleServer();
openDatabase('restgoose-test-fetch-hook');

@rest({
    route: '/otheritems',
    methods: [
        all({ fetch: otherItemFetchAll }),
        one({ fetch: otherItemFetchOne }),
        create(),
        removeAll(),
    ],
})
export class OtherItem extends Typegoose {
    @prop({required: true})
    name: string;

    @prop({required: true})
    value: number;

    @prop({required: true, default: false})
    public: boolean;
}

export const OtherItemModel = new OtherItem().getModelForClass(OtherItem);

async function otherItemFetchAll(req: Request) {
    return OtherItemModel.find({ public: true });
}
async function otherItemFetchOne(req: Request) {
    return OtherItemModel.findOne({ public: true, _id: req.params.id });
}

app.use(Restgoose.initialize());
// ---------------------------------------------------------------------------------------------------------------------

chai.use(dirtyChai);

const expect = chai.expect;

const restTester = new RestTester({
    app: app
});

describe('Fetch hook', function() {
    this.timeout(20000); //20s timeout

    let itemIds = null;
    it('prepare', function() {
        return Promise.resolve()

        // deletes everything
        .then(() => restTester.delete('/otheritems'))
        .then(({ code,body,headers }) => {
            expect(code).to.eq(204);
            return true;
        })
        .then(() => restTester.get('/otheritems'))
        .then(({ code, body, headers }) => {
            expect(code).to.eq(200);
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
            itemIds = items.map(i => i.body._id);
            return true;
        })
    });

    describe('all()', function() {
        it('should only return entities with public: true', function () {
            return Promise.resolve()
            .then(() => restTester.get('/otheritems'))
            .then(({ code, body, headers }) => {
                expect(code).to.eq(200);
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
            .then(({ code, body, headers }) => {
                expect(code).to.eq(200);
                expect(body.value).to.eq(1);
                return true;
            })
            .then(() => restTester.get('/otheritems/'+itemIds[1]))
            .then(({ code, body, headers }) => {
                expect(code).to.eq(404);
                return true;
            });
        });
    });

    //TODO test an aggregate fetch (needs to add code in the example)
});
