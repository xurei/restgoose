import * as mongoose from 'mongoose';

export function openDatabase(database: string) {
    // Business as usual - connect to your database with mongoose
    const mongoHost = (process.env.MONGO_URI || 'mongodb://localhost/') + database;
    console.log('Mongo Host:', mongoHost);
    mongoose.connect(mongoHost)
    .catch(e => {
        console.error('MongoDB Connection Error:');
        console.error(JSON.stringify(e, null, '  '));
    });
    mongoose.connection.on('error', err => {
        console.error(`Connection error: ${err.message}`);
    });
    mongoose.connection.once('open', () => {
        console.info('Connected to database '+database);
    });
}
