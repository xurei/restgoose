import * as mongoose from 'mongoose';

export function openDatabase(database: string) {
    // Business as usual - connect to your database with mongoose
    const mongoHost = (process.env.MONGO_URI || 'mongodb://localhost/') + database;
    console.log('Mongo Host:', mongoHost);
    return (
        mongoose.connect(mongoHost)
        .then(() => {
            console.info('Connected to database ', database);
        })
        .catch(e => {
            console.error('MongoDB Connection Error:');
            console.error(JSON.stringify(e, null, '  '));
        })
    );
}
