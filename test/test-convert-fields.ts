import * as chai from 'chai';
import * as dirtyChai from 'dirty-chai';
import 'mocha';
import { convertOid, convertDate, convertFields } from '../lib/convertFields';
import { ObjectId } from 'bson';

chai.use(dirtyChai);

const expect = chai.expect;

describe('convertOid', () => {
    it('simple', () => {
        const out = convertOid({author: {$oid: '000000000000000000000001'}});
        expect(out).to.deep.eq({
            author: {$in: [new ObjectId('000000000000000000000001'), '000000000000000000000001']}
        })
    });
    it('with $and/$or', () => {
        const out = convertOid({
            $and: [
                {
                    $or: [
                        { author: { $oid: '000000000000000000000001' } },
                        { author: { $oid: '000000000000000000000002' } },
                    ],
                },
                {
                    $or: [
                        { a: { $oid: '000000000000000000000003' } },
                        { b: { $oid: '000000000000000000000004' } },
                        { $or: [
                                { c: { $oid: '000000000000000000000005' } },
                                { d: { $oid: '000000000000000000000006' } },
                            ]},
                        true
                    ],
                }
            ],
        });
        expect(out).to.deep.eq({
            $and: [
                {
                    $or: [
                        { author: { $in: [ new ObjectId('000000000000000000000001'), '000000000000000000000001' ] } },
                        { author: { $in: [ new ObjectId('000000000000000000000002'), '000000000000000000000002' ] } },
                    ],
                },
                {
                    $or: [
                        { a: { $in: [ new ObjectId('000000000000000000000003'), '000000000000000000000003' ] } },
                        { b: { $in: [ new ObjectId('000000000000000000000004'), '000000000000000000000004' ] } },
                        { $or: [
                                { c: { $in: [ new ObjectId('000000000000000000000005'), '000000000000000000000005' ] } },
                                { d: { $in: [ new ObjectId('000000000000000000000006'), '000000000000000000000006' ] } },
                            ]},
                        true
                    ],
                }
            ],
        })
    });
    it('with $in', () => {
        const out = convertOid({
            _id: {
                $in: [
                    { $oid: '000000000000000000000001' },
                    { $oid: '000000000000000000000002' },
                    new ObjectId('000000000000000000000003'),
                    'not_an_id',
                ]
            },
        });
        expect(out).to.deep.eq({
            _id: {
                $in: [
                    new ObjectId('000000000000000000000001'),
                    '000000000000000000000001',
                    new ObjectId('000000000000000000000002'),
                    '000000000000000000000002',
                    new ObjectId('000000000000000000000003'),
                    'not_an_id',
                ]
            },
        });
    });

    it('Nothing', () => {
        const out = convertOid({"user":null,"begin":"2018-06-20T11:38:35.619Z","end":"2018-09-20T11:38:35.620Z"});
        expect(out).to.deep.eq({"user":null,"begin":"2018-06-20T11:38:35.619Z","end":"2018-09-20T11:38:35.620Z"});
    });
});

describe('convertDate', () => {
    it('simple', () => {
        const out = convertDate({createdAt: {$date: '2019-01-01'}});
        expect(out).to.deep.eq({
            createdAt: new Date('2019-01-01'),
        })
    });
    it('with $and/$or + $gt/$lt', () => {
        const out = convertDate({
            $and: [
                {
                    $or: [
                        { createdAt: {$gt: {$date: '2019-01-01'} } },
                        { createdAt: {$lt: {$date: '2018-01-01'} } },
                    ],
                },
                {
                    $or: [
                        { updatedAt: {$date: '2019-01-01'} },
                        { updatedAt: {$date: '2019-01-02'} },
                        { updatedAt: {$date: '2019-01-03'} },
                        { $or: [
                            { updatedAt: {$date: '2019-01-02'} },
                            { updatedAt: {$date: '2019-01-03'} },
                        ]},
                        true
                    ],
                }
            ],
        });
        expect(out).to.deep.eq({
            $and: [
                {
                    $or: [
                        { createdAt: { $gt: new Date('2019-01-01') } },
                        { createdAt: { $lt: new Date('2018-01-01') } },
                    ],
                },
                {
                    $or: [
                        { updatedAt: new Date('2019-01-01') },
                        { updatedAt: new Date('2019-01-02') },
                        { updatedAt: new Date('2019-01-03') },
                        { $or: [
                            { updatedAt: new Date('2019-01-02') },
                            { updatedAt: new Date('2019-01-03') },
                        ]},
                        true
                    ],
                }
            ],
        })
    });
    it('with $in', () => {
        const out = convertDate({
            d: {
                $in: [
                    { $date: '2019-01-01' },
                    { $date: '2019-01-02' },
                    new Date('2019-01-03'),
                    'anything',
                ]
            },
        });
        expect(out).to.deep.eq({
            d: {
                $in: [
                    new Date('2019-01-01'),
                    new Date('2019-01-02'),
                    new Date('2019-01-03'),
                    'anything',
                ]
            },
        })
    });

    it('Nothing', () => {
        const out = convertDate({"user":null,"begin":"2018-06-20T11:38:35.619Z","end":"2018-09-20T11:38:35.620Z"});
        expect(out).to.deep.eq({"user":null,"begin":"2018-06-20T11:38:35.619Z","end":"2018-09-20T11:38:35.620Z"});
    });
});

describe('convertFields', () => {
    it('Should go through all the convertion functions at once', () => {
        const input = {
            _id: {
                $in: [
                    { $oid: '000000000000000000000001' },
                    { $oid: '000000000000000000000002' },
                    new ObjectId('000000000000000000000003'),
                    'not_an_id',
                ]
            },

            date: { $date: '2019-01-30' },
        };

        const out = convertFields(input);
        const expected = convertDate(convertOid(input));

        expect(out).to.deep.eq(expected);
    });
});
