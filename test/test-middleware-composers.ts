import * as chai from 'chai';
import * as dirtyChai from 'dirty-chai';
import 'mocha';
const sinon = require('sinon');
import * as sinonChai from 'sinon-chai';
import { and, or, asFilter, RestError } from '../lib';

chai.use(dirtyChai);
chai.use(sinonChai);

const expect = chai.expect;
const spy = sinon.default.spy;

async function preSuccess(req: Request) {
    return true;
}
async function preFalse(req: Request) {
    return false;
}
async function preFail(req: Request) {
    throw new RestError(418, "I'm a teapot");
}

async function postSuccess(req: Request, entity: object) {
    return Object.assign({}, entity, {
        plip: 'plap'
    });
}
async function postFail(req: Request, entity: any) {
    throw new RestError(418, "I'm a teapot");
}

describe('and()', function() {
    describe('preFetch', () => {
        describe('all the middlewares success', () => {
            it('should call all of them and return', function () {
                const spy1 = spy(preSuccess);
                const spy2 = spy(preSuccess);
                return and(spy1, spy2)(null)
                .then(() => {
                    expect(spy1).to.have.been.calledOnce(null);
                    expect(spy2).to.have.been.calledOnce(null);
                });
            });
        });

        describe('one middleware fails', () => {
            it('should call those before, not those after, and throw the error', function () {
                const spy1 = spy(preSuccess);
                const spy2 = spy(preSuccess);
                const spyFail = spy(preFail);
                const spy3 = spy(preSuccess);
                const spy4 = spy(preSuccess);
                return and(spy1, spy2, spyFail, spy3, spy4)(null)
                .then(() => {
                    expect.fail('Expected and() to throw a RestError');
                })
                .catch(e => {
                    expect(e.httpCode).to.eq(418);
                    expect(e.errorData).to.eq("I'm a teapot");

                    expect(spy1).to.have.been.calledOnce(null);
                    expect(spy2).to.have.been.calledOnce(null);
                    expect(spyFail).to.have.been.calledOnce(null);

                    expect(spy3).to.have.not.been.called(null);
                    expect(spy4).to.have.not.been.called(null);
                });
            });
        });
    });

    describe('postFetch', () => {
        // TODO
    });
});

describe('or()', function() {
    describe('preFetch', () => {
        describe('all the middlewares success', () => {
            it('should call only the first one', function () {
                const spy1 = spy(preSuccess);
                const spy2 = spy(preSuccess);
                return or(spy1, spy2)(null)
                .then((result) => {
                    expect(spy1).to.have.been.calledOnce(null);
                    expect(spy2).to.have.not.been.called(null);
                    expect(result).to.eq(true);
                });
            });
        });

        describe('first middlewares fail', () => {
            it('should call those before, not those after the first success, and return true', function () {
                const spy1 = spy(preFail);
                const spy2 = spy(preFail);
                const spy3 = spy(preSuccess);
                const spy4 = spy(preSuccess);
                return or(spy1, spy2, spy3, spy4)(null)
                .then((result) => {
                    expect(spy1).to.have.been.calledOnce(null);
                    expect(spy2).to.have.been.calledOnce(null);
                    expect(spy3).to.have.been.calledOnce(null);
                    expect(result).to.eq(true);
                    expect(spy4).to.have.not.been.called(null);
                });
            });
        });

        describe('first middlewares fail, next returns false', () => {
            it('should call those before, not those after the first success, and return true', function () {
                const spy1 = spy(preFail);
                const spy2 = spy(preFalse);
                const spy3 = spy(preSuccess);
                const spy4 = spy(preSuccess);
                return or(spy1, spy2, spy3, spy4)(null)
                .then((result) => {
                    expect(spy1).to.have.been.calledOnce(null);
                    expect(spy2).to.have.been.calledOnce(null);
                    expect(spy3).to.have.been.calledOnce(null);
                    expect(result).to.eq(true);
                    expect(spy4).to.have.not.been.called(null);
                });
            });
        });
    });

    describe('postFetch', () => {
        // TODO
    });
});

describe('asFilter()', function() {
    describe('with middleware success', () => {
        it('should return the same value', function () {
            const entity = { plop: 'plup' };
            const spy1 = spy(postSuccess);
            return postSuccess(null, entity)
            .then(expected => {
                return asFilter(spy1)(null, entity)
                .then(returned => {
                    expect(spy1).to.have.been.calledOnce(null);
                    expect(returned).to.deep.eq(expected);
                });
            });
        });
    });

    describe('with middleware failure', () => {
        it('should return null', function () {
            const entity = { plop: 'plup' };
            const spy1 = spy(postFail);
            return asFilter(spy1)(null, entity)
            .then(returned => {
                expect(spy1).to.have.been.calledOnce(null);
                expect(returned).to.eq(null);
            });
        });
    });
});
