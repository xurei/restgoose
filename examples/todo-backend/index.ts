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

async function addUrl(req, todo) {
    todo.url = `http://${req.headers.host}/todos/${todo._id}`;
    todo = await todo.save();
    return todo;
}

@rest({
    route: '/todos',
    methods: [
        all(), // GET /todos
        one(), // GET /todos/:id
        create({
            postFetch: addUrl, //On creation, populate the url field `http://${req.headers.host}/todos/${todo._id}`
        }), // POST /todos
        update(), // PATCH /todos/:id
        remove(), // DELETE /todos/:id
        removeAll(), // DELETE /todos
    ],
})
export class Todo extends Typegoose {
    @prop({required: true})
    title: string;

    @prop({required: true, default: false})
    completed: boolean;

    @prop({required: true, default: 'url'})
    url: string;

    @prop({required: false, default: 0})
    order: number;
}

export const TodoModel = new Todo().getModelForClass(Todo);

// Create the minimal express with CORS and bodyParser.json
const app = express();
app.use(bodyParser.json());
app.use(cors({
    origin: '*',
    methods: 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    allowedHeaders: 'Origin,Content-Type,Accept,Authorization',
    preflightContinue: false,
    optionsSuccessStatus: 204,
}));

openDatabase();
app.use(Restgoose.initialize());
app.listen(3000, function () {
    console.log('Example app listening on port 3000!')
});

function openDatabase() {
    // Business as usual - connect to your database with mongoose
    mongoose.connect('mongodb://localhost/restgoose-example')
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