import * as chai from 'chai';
import * as dirtyChai from 'dirty-chai';
import 'mocha';
import { convertDate, convertFields } from '../lib/convert-fields';

chai.use(dirtyChai);

const expect = chai.expect;

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
