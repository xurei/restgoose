import * as chai from 'chai';
import * as dirtyChai from 'dirty-chai';
import 'mocha';
import { RestTester } from './util/rest-tester';

import { simpleServer } from './util/simple-server';
import { Restgoose, RestgooseModel, prop, create, one, removeAll, rest, update } from '../lib';
import { openDatabase } from './util/open-database';

const app = simpleServer();

class RestgooseFieldSubmodel extends RestgooseModel {
    @prop({ required: true })
    date: Date;
    @prop({ required: true })
    dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 is Sunday (as in Date.getDay() API)
    @prop({ required: true })
    frequencyValue: number;
    @prop({ required: true })
    frequencyUnit: 'week' | 'month' | 'year';
}

@rest({
    route: '/items',
    methods: [
        one(), // GET /todos/:id
        create(), // POST /todos
        update(), // POST /todos
        removeAll(), // DELETE /todos
    ],
})
export class RestgooseField extends RestgooseModel {
    @prop({required: true})
    data: RestgooseFieldSubmodel;
}

app.use(Restgoose.initialize([RestgooseField]));
// ---------------------------------------------------------------------------------------------------------------------
chai.use(dirtyChai);

const expect = chai.expect;

const restTester = new RestTester({
    app: app
});

describe('Field: RestgooseModel', function() {
    this.timeout(20000); //20s timeout

    let id = null;

    before(function () {
        return openDatabase('restgoose-test-restgoose-field')
        .then(() => restTester.delete('/items'))
        .then(res => {
            expect(res.status).to.eq(204);
            return true;
        })
        .then(() => restTester.post('/items', {
            data: {
                _id: '5c08177b9b90160e6697ed3f',
                frequencyValue: 1,
                frequencyUnit: 'week',
                dayOfWeek: 1,
                date: '1970-01-01T17:05:00.000Z',
                hour: null,
                minute: null
            }
        }))
        .then(res => {
            console.log(res.body);
            const status = res.status as number;
            expect(status).to.eq(201);
            id = res.body['_id'];
            return true;
        });
    });

    describe('/items', function() {
        describe('create()', function () {
            // TODO
        });

        describe('update()', function() {
            let fetch = null;
            const payload = {
                frequencyValue: 2,
                frequencyUnit: 'month',
                dayOfWeek: 2,
                date: '1970-01-01T19:42:00.000Z',
                hour: null,
                minute: null
            };
            before(function () {
                fetch = restTester.patch(`/items/${id}`, {
                    data: payload,
                });
                fetch.then(res => console.log(res.status, res.body));
                return fetch;
            });

            it('should accept', () => {
                return fetch.then((res) => {
                    expect(res.status).to.eq(200);
                });
            });

            it('should match the payload', () => {
                return fetch.then(res => {
                    const body = res.body as any;
                    expect(body.data).to.be.an('object');
                    delete body.data._id;
                    expect(body.data).to.deep.eq({
                        frequencyValue: 2,
                        frequencyUnit: 'month',
                        dayOfWeek: 2,
                        date: '1970-01-01T19:42:00.000Z',
                    });
                });
            });
        });
    });
});
