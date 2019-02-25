export const isPrimitive = Type => !!Type && ['ObjectId', 'ObjectID', 'String', 'Number', 'Boolean', 'Date', 'Decimal128'].find(n => Type.name === n);
export const isArray = Type => !!Type && Type.name === 'Array';
export const isObject = Type => {
    let prototype = Type.prototype;
    let name = Type.name;
    while (name) {
        if (name === 'Object') {
            return true;
        }
        prototype = Object.getPrototypeOf(prototype);
        name = prototype ? prototype.constructor.name : null;
    }
    return false;
};
export const isObjectLitteral = Type => {
    const name = Type.name;
    return (name === 'Object');
};
export const isNumber = Type => !!Type && Type.name === 'Number';
export const isString = Type => !!Type && Type.name === 'String';
export const isBoolean = Type => !!Type && Type.name === 'Boolean';
export const isDate = Type => !!Type && Type.name === 'Date';
