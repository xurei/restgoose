---
title: Restgoose
---
# REST endpoint made easy

Restgoose exposes your MongoDB database through a REST API with ease. 
It is driven by the model itself, which reduces the boilerplate code necessary to write simple endpoints.
It is open for extension, so you can add complex logic easily.

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
export class Todo extends RestgooseModel {
    @prop({ required: true })
    text: string;
}
```

## Documentation

- ### [Getting started](./getting-started.md)
- ### [API Reference](./API.md)
- ### [Rest endpoint lifecycle](./rest-lifecycle.md)
- ### [Development Roadmap](./roadmap.md)

## Contributing
You want to help to make restgoose even better? Great! 

Check out our [code of conduct](./CODE_OF_CONDUCT.md) and our [contributing guidelines](./CONTRIBUTING.md) 
for more information.

## The Philosophy behind Restgoose
Restgoose finds its inspiration from [Typegoose](https://github.com/szokodiakos/typegoose) and [Loopback](https://loopback.io).

We also had some objectives in mind while writing Restgoose :
- Simple, common behaviors should be really easy to write. We mean **trivial**.
- "DRY, DRY, **DRY**": A behaviour that is common to more than one endpoint should 
  be put in a separate middleware.
- "Do one thing and do it right": middlewares should have one particular task, and 
  be put together with composition methods (see `and()` and `or()`). 
- The framework should produce a REST architecture following the best practices 
  (notably the status code returned).
- Restgoose should be simple to add in an existing project. 
  No need to rewrite everything to use it.
- While promoting some best practices, the framework should let the user add 
  complex endpoints without Restgoose if necessary.
- The framework should be small and provide as little middlewares as necessary. 
  Other npm packages will provide middlewares. 
- The framework should eventually be Database-agnostic. We're not there yet, but we
  already made it compatible with AWS DynamoDB.

