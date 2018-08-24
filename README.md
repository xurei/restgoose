# RESToose
Model-driven REST API framework

RESToose exposes your MongoDB database through a REST API with ease. 
It is driven by the model itself, which reduces the boilerplate code necessary to write simple endpoint.
It is open for extension, so you can add complex logic easily too.

## Minimal usage
This creates the typical CRUD endpoints on a model : 
```typescript
import { prop, Typegoose } from 'typegoose';
import { all, create, one, remove, rest, update } from 'restoose';

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
export class Todo extends Typegoose {
    @prop({required: true})
    name: string;
}

export const TodoModel = new Todo().getModelForClass(Todo);
```
See the full example (with express/mongoose boilerplates) [in the examples directory](./examples) 

## The Philosophy behind RESToose
RESToose takes its inspiration from Typegoose and Loopback.
We also had some objectives in mind while writing RESToose :
- Simple, common behaviors should be really easy to write,
- The framework sould follow a RESTful design,
- The framework should be simple to add in an existing project,
- While promoting some best practices, the framework should let the user add 
  complex endpoints without RESToose if necessary
- The framework should be small and provide as little middlewares as necessary. 
  Plugins will be created for better cherry-picking. 

