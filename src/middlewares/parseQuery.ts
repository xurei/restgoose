export function parseQuery(req, res, next) {
    if (req.query && req.query.q) {
        try {
            req.filter = JSON.parse(req.query.q);
            next();
        } catch (e) {
            next(e);
        }
    } else {
        next();
    }
}
