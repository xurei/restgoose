"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function buildPayload(req, modelType) {
    const payload = {};
    // FIXME as any
    const properties = Object.keys(modelType.schema.tree);
    properties.forEach((prop) => {
        // TODO: search for typegoose annotations and process them?
        if (typeof (req.body[prop]) !== 'undefined') {
            payload[prop] = req.body[prop];
        }
    });
    return payload;
}
exports.buildPayload = buildPayload;
//# sourceMappingURL=RequestUtil.js.map