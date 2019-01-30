import * as chai from 'chai';
import * as dirtyChai from 'dirty-chai';
import 'mocha';
import { RestTester } from './util/rest-tester';

import { prop, arrayProp, Typegoose } from 'typegoose';
import { simpleServer } from './util/simple-server';
import { Restgoose, all, create, one, remove, removeAll, rest, update } from '../lib';
import { openDatabase } from './util/open-database';

const app = simpleServer();
openDatabase('restgoose-test-submodel-embedded');

class SubItem extends Typegoose {
    @prop({required: true})
    title: string;
}

class TrickySubItem extends Typegoose {
    @prop({required: true})
    ref: string;
}

@rest({
    route: '/items',
    methods: [
        all(),
        one(),
        create(),
    ],
})
class SubmodelEmbedded extends Typegoose {
    @prop({required: true})
    title: string;

    @rest({
        route: '/subitems',
        methods: [
            all(),
            //one(),
            create(),
        ],
    })
    @arrayProp({ items: SubItem })
    subitems: SubItem[];

    @rest({
        route: '/trickysubitems',
        methods: [
            all(),
            //one(),
            create(),
        ],
    })
    @arrayProp({ items: TrickySubItem })
    trickysubitems: TrickySubItem[];
}

app.use(Restgoose.initialize([SubmodelEmbedded]));
// ---------------------------------------------------------------------------------------------------------------------
chai.use(dirtyChai);

const expect = chai.expect;

const restTester = new RestTester({
    app: app
});

describe('Submodel - embedded', function() {
    this.timeout(20000); //20s timeout

    let item1Id;
    let item2Id;
    before(() => {
        return (
            restTester.delete('/items')
            .then(() => restTester.post('/items', {
                title: 'item1',
                subitems:[{ title: 'subitem1' }],
                trickysubitems:[{ ref: 'this-is-tricky' }],
            }))
            .then(res => {
                item1Id = res.body['_id'];
            })
            .then(() => restTester.post('/items', {
                title: 'item2',
                subitems:[{ title: 'subitem2' }],
                trickysubitems:[{ ref: 'this-one-also' }],
            }))
            .then(res => {
                item2Id = res.body['_id'];
            })
        );
    });

    describe('GET /items/:id/subitems', () => {
        it('should return the subitems', () => {
            return (
            restTester.get(`/items/${item1Id}/subitems`)
            .then(res => {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('array');
                const body = (res.body as any).map(i => { delete i._id; return i; });
                expect(body).to.deep.eq([{ title: 'subitem1' }]);
                //item1Id = res.body._id;
            })
            );
        });
    });

    describe('GET /items/:id/trickysubitems', () => {
        it('should return the subitems', () => {
            return (
            restTester.get(`/items/${item1Id}/trickysubitems`)
            .then(res => {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('array');
                const body = (res.body as any).map(i => { delete i._id; return i; });
                expect(body).to.deep.eq([{ ref: 'this-is-tricky' }]);
                //item1Id = res.body._id;
            })
            );
        });
    });

    describe('POST /items/:id/subitems', () => {
        describe('with invalid payload', () => {
            it('should return 400', () => {
                return (
                    restTester.post(`/items/${item1Id}/subitems`, {
                        wrong: 'data',
                    })
                    .then(res => {
                        expect(res).to.have.status(400);
                    })
                );
            });
        });

        describe('with valid payload', () => {
            it('should return 201 and save the new data', () => {
                return (
                restTester.post(`/items/${item1Id}/subitems`, {
                    title: 'new item!',
                    notmapped: 'field',
                })
                .then(res => {
                    expect(res).to.have.status(201);
                    expect(res.body).to.be.an('object');
                    const body = Object.assign({}, res.body);
                    delete body['_id'];
                    expect(body).to.deep.eq({ title: 'new item!' });
                    return true;
                })
                .then(() => restTester.get(`/items/${item1Id}/subitems`))
                .then(res => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an('array');
                    const body = (res.body as any).map(i => { delete i._id; return i; });
                    expect(body).to.deep.eq([{ title: 'subitem1' }, { title: 'new item!' }]);
                    //item1Id = res.body._id;
                })
                );
            });
        });
    });

    describe('POST /items/:id/trickysubitems', () => {
        describe('with invalid payload', () => {
            it('should return 400', () => {
                return (
                restTester.post(`/items/${item1Id}/trickysubitems`, {
                    wrong: 'data',
                })
                .then(res => {
                    expect(res).to.have.status(400);
                })
                );
            });
        });

        describe('with valid payload', () => {
            it('should return 201 and save the new data', () => {
                return (
                restTester.post(`/items/${item2Id}/trickysubitems`, {
                    ref: 'new item!',
                    notmapped: 'field',
                })
                .then(res => {
                    expect(res).to.have.status(201);
                    expect(res.body).to.be.an('object');
                    const body = Object.assign({}, res.body);
                    delete body['_id'];
                    expect(body).to.deep.eq({ ref: 'new item!' });
                    return true;
                })
                .then(() => restTester.get(`/items/${item2Id}/trickysubitems`))
                .then(res => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an('array');
                    const body = (res.body as any).map(i => { delete i._id; return i; });
                    expect(body).to.deep.eq([{ ref: 'this-one-also' }, { ref: 'new item!' }]);
                    //item1Id = res.body._id;
                })
                );
            });
        });
    });
});
