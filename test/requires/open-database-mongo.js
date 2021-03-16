const mongoose = require('../../../restgoose-mongodb-connector/node_modules/mongoose');
const Restgoose = require('../../lib').Restgoose;
const RestgooseMongodbConnector = require('../../../restgoose-mongodb-connector/lib/index').RestgooseMongodbConnector;

Restgoose.setConnector(new RestgooseMongodbConnector());

global.openDatabase = function(database) {
    // Business as usual - connect to your database with mongoose
    const mongoHost = (process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/') + database;
    console.log('Mongo Host:', mongoHost);
    return (
        mongoose.connect(mongoHost)
        .then(() => {
            console.info('Connected to database ', database);
            return true;
        })
        .catch(e => {
            console.error('MongoDB Connection Error:');
            console.error(JSON.stringify(e, null, '  '));
        })
    );
}
