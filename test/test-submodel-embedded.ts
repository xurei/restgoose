import * as chai from 'chai';
import * as dirtyChai from 'dirty-chai';
import 'mocha';
import { RestTester } from './util/rest-tester';
import { simpleServer } from './util/simple-server';
import { openDatabase } from './util/open-database';

import { Restgoose, RestgooseModel, prop, arrayProp, all, create, one, rest, removeAll } from '../lib';

const app = simpleServer();

class SubItem extends RestgooseModel {
    @prop({required: true})
    subtitle: string;
}

class TrickySubItem extends RestgooseModel {
    @prop({required: true})
    ref: string;
}

@rest({
    route: '/items',
    methods: [
        all(),
        one(),
        create(),
        removeAll(),
    ],
})
class SubmodelEmbedded extends RestgooseModel {
    @prop({required: true})
    title: string;

    @rest({
        route: '/subints',
        methods: [
            all(),
            create(),
        ],
    })
    @arrayProp({ items: Number })
    subints: Number[];

    @rest({
        route: '/subitems',
        methods: [
            all(),
            create(),
        ],
    })
    @arrayProp({ items: SubItem })
    subitems: SubItem[];


    @prop()
    uniqueSubitem: SubItem;

    @rest({
        route: '/trickysubitems',
        methods: [
            all(),
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
            openDatabase('restgoose-test-submodel-embedded')
            .then(() => restTester.delete('/items'))
            .then(res => {
                expect(res).to.have.status(204);
                return true;
            })
            .then(() => restTester.post('/items', {
                title: 'item1',
                subint: [23, 42, 69],
                subitems:[{ subtitle: 'subitem1' }],
                trickysubitems:[{ ref: 'this-is-tricky' }],
            }))
            .then(res => {
                expect(res).to.have.status(201);
                item1Id = res.body['_id'];
            })
            .then(() => restTester.post('/items', {
                title: 'item2',
                subint: [15, 94, 2016.12],
                subitems:[{ subtitle: 'subitem2' }],
                trickysubitems:[{ ref: 'this-one-also' }],
            }))
            .then(res => {
                expect(res).to.have.status(201);
                item2Id = res.body['_id'];
                return true;
            })
            .then(() => restTester.get(`/items/${item1Id}`))
            .then(res => {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('object');
            })
            .catch(e => {
                console.error(e);
                throw e;
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
                    expect(body).to.deep.eq([{ subtitle: 'subitem1' }]);
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
                        console.log(res.body);
                        expect(res).to.have.status(400);
                    })
                );
            });
        });

        describe('with valid payload', () => {
            it('should return 201 and save the new data', () => {
                return (
                    restTester.post(`/items/${item1Id}/subitems`, {
                        subtitle: 'new item!',
                        notmapped: 'field',
                    })
                    .then(res => {
                        console.log(res.body);
                        expect(res).to.have.status(201);
                        expect(res.body).to.be.an('object');
                        const body: any = Object.assign({}, res.body);
                        expect(body.subtitle).to.eq('new item!');
                        return true;
                    })
                    .then(() => restTester.get(`/items/${item1Id}/subitems`))
                    .then(res => {
                        expect(res).to.have.status(200);
                        expect(res.body).to.be.an('array');
                        const body = (res.body as any).map(i => { delete i._id; return i; });
                        expect(body).to.deep.eq([{ subtitle: 'subitem1' }, { subtitle: 'new item!' }]);
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
