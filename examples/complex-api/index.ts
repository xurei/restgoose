import * as express from 'express';
import { prop, Typegoose } from 'typegoose';
import * as mongoose from 'mongoose';
import { Restgoose, all, create, one, remove, rest, update } from '../../lib';

@rest({
    route: '/todos',
    methods: [
        all(), // GET /todos
        one(), // GET /todos/:id
        create(), // POST /todos
        update(), // PUT /todos/:id
        remove(), // DELETE /todos/:id
    ],
})
export class Lol extends Typegoose {
    @prop({required: true})
    name: string;
}

export const TodoModel = new Lol().getModelForClass(Lol);

const app = express();
openDatabase();
Restgoose.initialize(app);
app.listen(3000, function () {
    console.log('Example app listening on port 3000!')
});

function openDatabase() {
    // Business as usual - connect to your database with mongoose
    mongoose.connect('mongodb://localhost/todo-backend')
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