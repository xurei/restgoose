import { ObjectId } from 'bson';

interface Dic {[key: string]: any; }

/**
 * Converts special fields to their mongodb equivalent. Special fields are :
 * - { $oid: string } for ObjectId
 * - { $date: string } for ISODate
 *
 * NOTE: in $oid case, the string value will be tested as well,
 * i.e. { $oid: '123456' } gives { $in: [ObjectId('123456'), '123456'] }
 * The other special fields map directly to their equivalent.
 * @param data The input filter
 * @return The filter converted
 */
export function convertFields(data: Dic) {
    let out: Dic = data;
    out = convertOid(out);
    out = convertDate(out);
    return out;
}

export function convertDate(data: Dic) {
    return convertField(data, '$date', field => new Date(field));
}

export function convertOid(data: {[key: string]: any}) {
    return convertField(data, '$oid', field => ([new ObjectId(field), field]));
}

// ---------------------------------------------------------------------------------------------------------------------

function convertField(data: Dic, fieldName: string, converter: (field: string | number) => any) {
    Object.keys(data).forEach(k => {
        if (k === '$in') {
            data[k] = convertFieldIn(data[k], fieldName, converter);
        }
        else {
            data[k] = convertFieldSub(data[k], fieldName, converter);
        }
    });
    return data;
}

function convertFieldSub(item: any, fieldName: string, converter: (field: string | number) => any) {
    if (!item) {
        return item;
    }
    else if (Array.isArray(item)) {
        return item.map(e => convertFieldSub(e, fieldName, converter));
    }
    else if (typeof(item) === 'object') {
        if (item[fieldName]) {
            const out = converter(item[fieldName]);
            if (Array.isArray(out)) {
                return { $in: out };
            }
            else {
                return out;
            }
        }
        else {
            return convertField(item, fieldName, converter);
        }
    }
    else {
        return item;
    }
}

function convertFieldIn(values: any[], fieldName: string, converter: (field: string | number) => any): any[] {
    values = values.map(item => {
        if (typeof(item) === 'object' && item[fieldName]) {
            const out = converter(item[fieldName]);
            if (Array.isArray(out)) {
                return out;
            }
            else {
                return [out];
            }
        }
        else {
            return [item];
        }
    });
    return values.reduce((array, v) => {
        return array.concat(v);
    }, []);
}
