### MongoDB + Typegoose + Restgoose = ❤️️

Restgoose exposes your MongoDB database through a REST API with ease. 
It is driven by the model itself, which reduces the boilerplate code necessary to write simple endpoints.
It is open for extension, so you can add complex logic easily too.

# Installation & basic usage
```
npm install @xureilab/restgoose
```

```typescript
@rest({
    route: '/todos',
    methods: [
        all(), // GET /todos
        one(), // GET /todos/:id
        create(), // POST /todos
        update(), // PATCH /todos/:id
        remove(), // DELETE /todos/:id
    ],
})
export class Todo extends Typegoose {
    /* ... */
}
```

# Documentation

- [API Reference](./API.md)
- [Rest endpoint lifecycle](./rest-lifecycle.md)

# The Philosophy behind Restgoose
RESToose takes its inspiration from Typegoose and Loopback.
We also had some objectives in mind while writing RESToose :
- Simple, common behaviors should be really easy to write,
- The framework sould follow a RESTful design,
- The framework should be simple to add in an existing project,
- While promoting some best practices, the framework should let the user add 
  complex endpoints without RESToose if necessary
- The framework should be small and provide as little middlewares as necessary. 
  Plugins will be created for better cherry-picking. 