import * as chai from 'chai';
import * as dirtyChai from 'dirty-chai';
import 'mocha';
import { RestTester } from './util/rest-tester';

import { simpleServer } from './util/simple-server';
import { Restgoose, RestgooseModel, prop, all, create, one, remove, removeAll, rest, update } from '../lib';

const openDatabase = (global as any).openDatabase;
const app = simpleServer();

@rest({
    route: '/array-field__items',
    methods: [
        one(), // GET /todos/:id
        create(), // POST /todos
        removeAll(), // DELETE /todos
    ],
})
export class ArrayField extends RestgooseModel {
    @prop({/*required: true*/})
    data: string[];
}

app.use(Restgoose.initialize([ArrayField]));
// ---------------------------------------------------------------------------------------------------------------------
chai.use(dirtyChai);

const expect = chai.expect;

const restTester = new RestTester({
    app: app
});

describe('Field: Array', function() {
    this.timeout(20000); //20s timeout

    let id = null;

    before(function () {
        return (
            openDatabase('restgoose-test')
            .then(() => restTester.delete('/array-field__items'))
            .then(res => {
                expect(res.status).to.eq(204);
                return true;
            })
            // .then(() => restTester.post('/array-field__items', {
            //     data: ['a', 'b', 'c']
            // }))
            // .then(res => {
            //     console.log(res.body);
            //     const status = res.status as number;
            //     expect(status).to.eq(201);
            //     id = res.body['_id'] || res.body['id'];
            //     return true;
            // })
            .catch (e => {
                console.log(e);
            })
        );
    });

    describe('create()', function () {
        it('works', function () {
            let newId = null;
            return restTester.post('/array-field__items', {
                data: ['a', 'b', 'c']
            })
            .then(res => {
                const body = res.body as any;
                const status = res.status as number;
                expect(status).to.eq(201);
                expect(body).to.not.eq(null);
                expect(body.data).to.deep.eq(['a', 'b', 'c']);
                newId = body._id || body.id;
                return true;
            })
            .then(() => restTester.get('/array-field__items/' + newId))
            .then(res => {
                const body = res.body as any;
                const status = res.status as number;
                expect(status).to.eq(200);
                expect(body.data).to.deep.eq(['a', 'b', 'c']);
                return true;
            });
        });
    });
});
