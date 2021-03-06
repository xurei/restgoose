---
title: Restgoose
---
**MongoDB + Typegoose + Restgoose = ❤️️**

Restgoose exposes your MongoDB database through a REST API with ease. 
It is driven by the model itself, which reduces the boilerplate code necessary to write simple endpoints.
It is open for extension, so you can add complex logic easily too.

## Installation & basic usage
```bash
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

## Documentation

- ### [Getting started](./getting-started.md)
- ### [API Reference](./API.md)
- ### [Rest endpoint lifecycle](./rest-lifecycle.md)
- ### [Development Roadmap](./roadmap.md)

## Contributing
You want to help to make restgoose even better? Great! 

Check out our [code of conduct](./CODE_OF_CONDUCT.md) and our [contributing guidelines](./CONTRIBUTING.md) for more information.

## The Philosophy behind Restgoose
Restgoose takes its inspiration from Typegoose and Loopback.
We also had some objectives in mind while writing Restgoose :
- Simple, common behaviors should be really easy to write,
- The framework should follow a RESTful design,
- The framework should be simple to add in an existing project,
- While promoting some best practices, the framework should let the user add 
  complex endpoints without Restgoose if necessary
- The framework should be small and provide as little middlewares as necessary. 
  Plugins will be created for better cherry-picking. 

