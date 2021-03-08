import * as mongoose from 'mongoose';
import { MongoClient } from 'mongodb';

export function openDatabase(database: string) {
    // Business as usual - connect to your database with mongoose
    const mongoHost = (process.env.MONGO_URI || 'mongodb://localhost:27017/') + database;
    console.log('Mongo Host:', mongoHost);
    return new Promise((resolve, reject) => {
        MongoClient.connect(mongoHost, function(err, client) {
            if (err) reject(err);
            console.info('Created/Connected to database ', database);

            const db = client.db(database);
            const movies = db.collection('dummy');
            // create a document to be inserted
            const doc = { dummy: 42 };
            movies.insertOne(doc).then(() => {
                resolve(true);
            })
            .catch(e => {
                reject(e);
            });
        });
    });
}
