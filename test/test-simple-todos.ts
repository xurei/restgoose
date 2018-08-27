import * as chai from 'chai';
import * as dirtyChai from 'dirty-chai';
import 'mocha';
import { RestTester } from './util/rest-tester';

import { app, server } from '../examples/minimal-todo';

chai.use(dirtyChai);

const expect = chai.expect;

const restTester = new RestTester({
    app: app
});

describe('Simple todos API', function() {
    this.timeout(20000); //20s timeout

    describe('/todos', function() {
        it('Reset todos', function () {
            return restTester.delete('/todos')
            .then(({ code,body,headers }) => {
                expect(code).to.eq(204);
                return true;
            })
            .then(() => restTester.get('/todos'))
            .then(({ code, body, headers }) => {
                expect(code).to.eq(200);
                expect(body).to.eq('[]');
                return true;
            });
        });
    });
});