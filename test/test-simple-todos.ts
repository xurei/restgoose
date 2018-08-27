import * as chai from 'chai';
import * as dirtyChai from 'dirty-chai';
import 'mocha';
import { RestTester } from './util/rest-tester';

import * as MinimalTodo from '../examples/minimal-todo/index';

chai.use(dirtyChai);

const expect = chai.expect;

const restTester = new RestTester({
    baseUrl: 'http://localhost:4000',
});

describe('Simple todos API', function() {
    console.log(MinimalTodo);
    require('run-middleware')(MinimalTodo.app)
});