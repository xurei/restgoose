/**
 * This is a minimal example.
 * It creates the typical CRUD endpoints on a model, without any middleware
 */

import * as express from 'express';
import { prop, Typegoose } from 'typegoose';
import * as mongoose from 'mongoose';
import * as bodyParser from 'body-parser';
import { Restgoose, all, create, one, remove, removeAll, rest, update } from '../../lib';
import * as cors from 'cors';

@rest({
    route: '/todos',
    methods: [
        all(), // GET /todos
        one(), // GET /todos/:id
        create(), // POST /todos
        update(), // PUT /todos/:id
        remove(), // DELETE /todos/:id
        removeAll(), // DELETE /todos
    ],
})
export class Todo extends Typegoose {
    @prop({required: true})
    title: string;
}

export const TodoModel = new Todo().getModelForClass(Todo);

// Create the minimal express with CORS and bodyParser.json
const app = express();
app.use(bodyParser.json());
app.use(cors({
    origin: '*',
    methods: 'GET,POST,PUT,DELETE,OPTIONS',
    allowedHeaders: 'Origin,Content-Type,Accept,Authorization',
    preflightContinue: false,
    optionsSuccessStatus: 204,
}));

openDatabase();
Restgoose.initialize(app);
let server = require('http').createServer(app);
server = server.listen(3000, function () {
    console.log('Example app listening on port 3000!')
});

function openDatabase() {
    const mongoHost = process.env.MONGO_HOST || 'mongodb://localhost/todo-backend';
    console.log('Mongo Host:', mongoHost);
    // Business as usual - connect to your database with mongoose
    mongoose.connect(mongoHost)
    .catch(e => {
        console.error('MongoDB Connection Error:');
        console.error(JSON.stringify(e, null, '  '));
    });
    mongoose.connection.on('error', err => {
        console.error(`Connection error: ${err.message}`);
    });
    mongoose.connection.once('open', () => {
        console.info('Connected to database');
    });
}

export { app, server };