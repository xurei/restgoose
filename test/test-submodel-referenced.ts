import * as chai from 'chai';
import * as dirtyChai from 'dirty-chai';
import 'mocha';
import { RestTester } from './util/rest-tester';
import { simpleServer } from './util/simple-server';
import { Request } from 'express';
import { Restgoose, RestgooseModel, prop, arrayProp, all, create, one, remove, removeAll, rest, update, and, RestError } from '../lib';

const openDatabase = (global as any).openDatabase;
const app = simpleServer();

async function verifyToken(req: Request) {
    // !!! This is NOT safe !!! Just for the sake of the example
    const header = req.headers['authorization'];
    if (header !== 'admin') {
        throw new RestError(401);
    }
    return null;
}

@rest({
    route: '/submodel-referenced__subitems',
    methods: [
        one({ preFetch: and(verifyToken) }), // GET /submodel-referenced__subitems/:id
    ],
})
export class SubItemReferenced extends RestgooseModel {
    @prop({required: true})
    name: string;

    @prop({required: true})
    value: number;
}

@rest({
    route: '/submodel-referenced__items',
    methods: [
        all(),
        one(),
        create(),
        update(),
        remove(),
        removeAll(),
    ],
})
export class SubmodelReferenced extends RestgooseModel {
    @prop({required: true})
    title: string;

    @rest({
        route: '/submodel-referenced__subitems',
        methods: [
            all({ preFetch: verifyToken }),
            create({ preFetch: verifyToken }),
        ],
    })
    @arrayProp({items: SubItemReferenced, ref: true})
    subItems: any[];
}

app.use(Restgoose.initialize([SubItemReferenced, SubmodelReferenced]));
// ---------------------------------------------------------------------------------------------------------------------

chai.use(dirtyChai);

const expect = chai.expect;

const restTester = new RestTester({
    app: app
});

describe('Submodel - referenced', function() {
    this.timeout(20000); //20s timeout

    let itemIds = null;
    before(function() {
        return openDatabase('restgoose-test')
        // deletes everything
        .then(() => restTester.delete('/submodel-referenced__items'))
        .then(res => {
            const body = res.body as any;
            const status = res.status as number;
            expect(status).to.eq(204);
            return true;
        })
        .then(() => restTester.get('/submodel-referenced__items'))
        .then(res => {
            const body = res.body as any;
            const status = res.status as number;
            expect(status).to.eq(200);
            expect(body).to.deep.eq([]);
            return true;
        })

        // populates items
        .then(() => Promise.all([
            restTester.post('/submodel-referenced__items', { title: 'item1' }),
            restTester.post('/submodel-referenced__items', { title: 'item2', subItems: ['000000000000000000000001'] }),
            restTester.post('/submodel-referenced__items', { title: 'item3' }),
            restTester.post('/submodel-referenced__items', { title: 'item4' }),
            restTester.post('/submodel-referenced__items', { title: 'item5' }),
            restTester.post('/submodel-referenced__items', { title: 'item6' })
        ]))
        .then((items) => {
            itemIds = items.map(i => {
                console.log(i.body);
                return (i.body as any)._id || (i.body as any).id;
            });
            return true;
        })
        .then(() => restTester.get('/submodel-referenced__items'))
        .then(res => {
            const body = res.body as any;
            const status = res.status as number;
            expect(status).to.eq(200);
            expect(body).to.have.length(6);
            return true;
        });
    });

    describe('/submodel-referenced__items', function() {
        describe('with invalid parent id', function() {
            it('GET should return 404', function() {
                return Promise.resolve()
                .then(() => restTester.as('admin').get('/submodel-referenced__items/000000000000000000000000/submodel-referenced__subitems'))
                .then(res => {
                    const status = res.status as number;
                    expect(status).to.eq(404);
                    return true;
                });
            });
            it('POST should return 404', function() {
                return Promise.resolve()
                .then(() => restTester.as('admin').post('/submodel-referenced__items/000000000000000000000000/submodel-referenced__subitems', {
                    never: 'mind'
                }))
                .then(res => {
                    const status = res.status as number;
                    expect(status).to.eq(404);
                    return true;
                });
            });
        });

        describe('all()/one() within item', function() {
            describe('without Autorization', function() {
                it('401', function () {
                    return Promise.resolve()
                    .then(() => restTester.post('/submodel-referenced__items/'+itemIds[0]+'/submodel-referenced__subitems', { name: 'val1', value: 1 }))
                    .then(res => {
                        const body = res.body as any;
                        const status = res.status as number;
                        expect(status).to.eq(401);
                        return true;
                    });
                });
            });
            describe('with Autorization', function() {
                it('201', function () {
                    let subItemId = null;
                    return Promise.resolve()
                    .then(() => restTester.as('admin').post('/submodel-referenced__items/'+itemIds[0]+'/submodel-referenced__subitems', { name: 'val1', value: 1 }))
                    .then(res => {
                        const body = res.body as any;
                        console.log(body);
                        const status = res.status as number;
                        expect(status).to.eq(201);
                    })
                    .then(() => restTester.as('admin').get('/submodel-referenced__items/'+itemIds[0]))
                    .then(res => {
                        const body = res.body as any;
                        const status = res.status as number;
                        expect(status).to.eq(200);
                        expect(body.subItems).to.have.length(1);
                        subItemId = body.subItems[0];
                    })
                    .then(() => restTester.as('admin').get('/submodel-referenced__items/'+itemIds[0]+'/submodel-referenced__subitems'))
                    .then(res => {
                        const body = res.body as any;
                        const status = res.status as number;
                        expect(status).to.eq(200);
                        expect(body).to.be.an('array');
                        expect(body).to.have.length(1);
                        expect(body[0].name).to.eq('val1');
                        expect(body[0].value).to.eq(1);
                        return true;
                    })
                    .then(() => restTester.as('admin').get('/submodel-referenced__subitems/'+subItemId))
                    .then(res => {
                        const body = res.body as any;
                        const status = res.status as number;
                        expect(status).to.eq(200);
                        expect(body.name).to.eq('val1');
                        expect(body.value).to.eq(1);
                        return true;
                    });
                });
            });
        })
    });
});
