import * as chai from 'chai';
import * as dirtyChai from 'dirty-chai';
import 'mocha';
import { RestTester } from './util/rest-tester';

import { simpleServer } from './util/simple-server';
import { Restgoose, RestgooseModel, create, one, removeAll, rest } from '../lib';
import { openDatabase } from './util/open-database';

const app = simpleServer();

@rest({
    schemaOptions: { timestamps: true },
    route: '/items',
    methods: [
        one(), // GET /todos/:id
        create(), // POST /todos
        removeAll(), // DELETE /todos
    ],
})
export class SchemaOptions extends RestgooseModel {
    name: string;
}

app.use(Restgoose.initialize([SchemaOptions]));
// ---------------------------------------------------------------------------------------------------------------------
chai.use(dirtyChai);

const expect = chai.expect;

const restTester = new RestTester({
    app: app
});

describe('@rest > schemaOptions', function() {
    this.timeout(20000); //20s timeout
    before(() => {
        return (
            openDatabase('restgoose-test-schema-options')
            .then(() => restTester.delete('/items'))
            .then(res => {
                const status = res.status as number;
                expect(status).to.eq(204);
                return true;
            })
        );
    });

    describe('POST', function() {
        it('should have a createdAt field', () => {
            return restTester.post('/items', {
                name: 'hello',
            })
            .then(res => {
                const body = res.body as any;
                const status = res.status as number;
                expect(status).to.eq(201);
                expect(body.createdAt).to.not.be.undefined(null);
                return true;
            })
        });
    });
});
