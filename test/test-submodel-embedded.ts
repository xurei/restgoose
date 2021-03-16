import * as chai from 'chai';
import * as dirtyChai from 'dirty-chai';
import * as chaiSubset from 'chai-subset';
import 'mocha';
import { RestTester } from './util/rest-tester';
import { simpleServer } from './util/simple-server';

import { Restgoose, RestgooseModel, prop, arrayProp, all, create, update, one, rest, removeAll } from '../lib';

const openDatabase = (global as any).openDatabase;
const app = simpleServer();

class SubItem extends RestgooseModel {
    @prop({required: true})
    subtitle: string;

    @prop()
    type: {
        name: string;
        options: any[];
    }
}

class TrickySubItem extends RestgooseModel {
    @prop({required: true})
    ref: string;
}

@rest({
    route: '/submodel-embedded__items',
    methods: [
        all(),
        one(),
        create(),
        update(),
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
chai.use(chaiSubset);

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
            openDatabase('restgoose-test')
            .then(() => restTester.delete('/submodel-embedded__items'))
            .then(res => {
                expect(res).to.have.status(204);
                return true;
            })
            .then(() => restTester.post('/submodel-embedded__items', {
                title: 'item1',
                subints: [23, 42, 69],
                subitems:[{ subtitle: 'subitem1' }],
                trickysubitems:[{ ref: 'this-is-tricky' }],
            }))
            .then(res => {
                expect(res).to.have.status(201);
                item1Id = res.body['_id'] || res.body['id'];
                (expect(res.body).to as any).containSubset({
                    title: 'item1',
                    subints: [23, 42, 69],
                    subitems:[{ subtitle: 'subitem1' }],
                    trickysubitems:[{ ref: 'this-is-tricky' }],
                });
            })
            .then(() => restTester.post('/submodel-embedded__items', {
                title: 'item2',
                subints: [15, 94, 2016.12],
                subitems:[{ subtitle: 'subitem2' }],
                trickysubitems:[{ ref: 'this-one-also' }],
            }))
            .then(res => {
                expect(res).to.have.status(201);
                item2Id = res.body['_id'] || res.body['id'];
                return true;
            })
            .then(() => restTester.get(`/submodel-embedded__items/${item1Id}`))
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

    describe('GET /submodel-embedded__items/:id/subitems', () => {
        it('should return the subitems', () => {
            return (
                restTester.get(`/submodel-embedded__items/${item1Id}/subitems`)
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

    describe('GET /submodel-embedded__items/:id/subints', () => {
        it('should return the subints', () => {
            return (
                restTester.get(`/submodel-embedded__items/${item1Id}/subints`)
                .then(res => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an('array');
                    const body = (res.body as any).map(i => { delete i._id; return i; });
                    expect(body).to.deep.eq([23, 42, 69]);
                    //item1Id = res.body._id;
                })
            );
        });
    });

    describe('GET /submodel-embedded__items/:id/trickysubitems', () => {
        it('should return the subitems', () => {
            return (
                restTester.get(`/submodel-embedded__items/${item1Id}/trickysubitems`)
                .then(res => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an('array');
                    const body = (res.body as any).map(i => { delete i._id; delete i.id; return i; });
                    expect(body).to.deep.eq([{ ref: 'this-is-tricky' }]);
                    //item1Id = res.body._id;
                })
            );
        });
    });

    describe('POST /submodel-embedded__items/:id/subitems', () => {
        describe('with invalid payload', () => {
            it('should return 400', () => {
                return (
                    restTester.post(`/submodel-embedded__items/${item1Id}/subitems`, {
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
                    restTester.post(`/submodel-embedded__items/${item1Id}/subitems`, {
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
                    .then(() => restTester.get(`/submodel-embedded__items/${item1Id}/subitems`))
                    .then(res => {
                        expect(res).to.have.status(200);
                        expect(res.body).to.be.an('array');
                        const body = (res.body as any).map(i => { delete i._id; delete i.id; return i; });
                        expect(body).to.deep.eq([{ subtitle: 'subitem1' }, { subtitle: 'new item!' }]);
                        //item1Id = res.body._id;
                    })
                );
            });
        });
    });

    describe('POST /submodel-embedded__items/:id/trickysubitems', () => {
        describe('with invalid payload', () => {
            it('should return 400', () => {
                return (
                    restTester.post(`/submodel-embedded__items/${item1Id}/trickysubitems`, {
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
                    restTester.post(`/submodel-embedded__items/${item2Id}/trickysubitems`, {
                        ref: 'new item!',
                        notmapped: 'field',
                    })
                    .then(res => {
                        expect(res).to.have.status(201);
                        expect(res.body).to.be.an('object');
                        const body = Object.assign({}, res.body);
                        delete body['_id'];
                        delete body['id'];
                        expect(body).to.deep.eq({ ref: 'new item!' });
                        return true;
                    })
                    .then(() => restTester.get(`/submodel-embedded__items/${item2Id}/trickysubitems`))
                    .then(res => {
                        expect(res).to.have.status(200);
                        expect(res.body).to.be.an('array');
                        const body = (res.body as any).map(i => { delete i._id; delete i.id; return i; });
                        expect(body).to.deep.eq([{ ref: 'this-one-also' }, { ref: 'new item!' }]);
                        //item1Id = res.body._id;
                    })
                );
            });
        });
    });

    describe('PATCH /submodel-embedded__items/:id', () => {
        it('should update the subitems', () => {
            return (
                restTester.patch(`/submodel-embedded__items/${item1Id}`, {
                    subitems: [
                        {
                            subtitle: 'first!',
                            bla: null,
                            type: { name: 'range', options: ['oui', 'non'] },
                        },
                        {
                            subtitle: 'second... :-('
                        },
                    ]
                })
                .then(res => {
                    expect(res).to.have.status(200);
                    const body = res.body as any;
                    expect(body.subitems).to.be.an('array');
                    const subitems = body.subitems.map(i => { delete i._id; delete i.id; return i; });
                    (expect(subitems).to as any).containSubset([
                        {
                            subtitle: 'first!',
                            type: { name: 'range', options: ['oui', 'non'] },
                        },
                        {
                            subtitle: 'second... :-('
                        }
                    ]);
                    //item1Id = res.body._id;
                })
            );
        });
    });
});
