import * as express from 'express';
import * as mongoose from 'mongoose';
import { Restgoose, RestgooseModel, all, create, one, remove, removeAll, rest, update, prop, arrayProp, getModel } from '../lib';
import * as chai from 'chai';
import * as dirtyChai from 'dirty-chai';
import 'mocha';
import { RestTester } from './util/rest-tester';
import { simpleServer } from './util/simple-server';

const mongoUri = (process.env.MONGO_URI || 'mongodb://localhost/') + 'restgoose-test-extended-model-2';
const connectionA = mongoose.createConnection(mongoUri);

class InnerItem extends RestgooseModel {
    @prop({required: true})
    innerTitle: string;
}

class FlatModel extends RestgooseModel {
    @prop({required: true})
    title: string;

    @arrayProp({required: true, items: InnerItem})
    innerItems: InnerItem[];
}

class BaseModel extends RestgooseModel {
    @arrayProp({required: true, items: InnerItem})
    innerItems: InnerItem[];
}

class ExtendedModel2 extends BaseModel {
    @prop({required: true})
    title: string;
}

// Create the minimal express with CORS and bodyParser.json
const app = simpleServer();

app.use('/dba', Restgoose.initialize([FlatModel, ExtendedModel2]));
//----------------------------------------------------------------------------------------------------------------------

chai.use(dirtyChai);

const expect = chai.expect;

const restTester = new RestTester({
    app: app
});

describe('Extended model - definition', function() {
    let FlatModelDef = null;
    let ExtendedModelDef = null;
    before(() => {
        FlatModelDef = getModel(FlatModel, connectionA);
        ExtendedModelDef = getModel(ExtendedModel2, connectionA);
    });

    it('should result in the same Schema as the equivalent flat model', function() {
        const flatSchema = Object.assign({}, FlatModelDef.schema);
        const extendedSchema = Object.assign({}, ExtendedModelDef.schema);
        expect(flatSchema.tree).to.deep.eq(extendedSchema.tree);
        expect(flatSchema.options).to.deep.eq(extendedSchema.options);
    });
});
