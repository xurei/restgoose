# Getting started with restgoose

This tutorial will walk through the initial steps to create a basic restgoose application.
We will create a basic IMDB-like REST API listing movies and actors.

The full code can be found at **TODO**. 

## Prerequites
We assume that you are already familiar with those concepts and technologies: 
- Node.js
- Express
- Typescript
- [Typegoose](https://github.com/szokodiakos/typegoose)
- MongoDB
- How RESTful APIs work, specifically how HTTP methods should be used  

## 1. Create the models
Our API will contain two models :
- Movie
- Actor

First, let's create the models with typegoose.

```typescript
import { Typegoose, prop, arrayProp, Ref } from 'typegoose';


export class Movie extends Typegoose {
    @prop({required: true})
    name: string;
    
    @prop({required: true})
    description: string;
    
    @arrayProp({itemsRef: {name: Message}})
    actors?: Ref<Actor>[];
}
export const MovieModel = new Movie().getModelForClass(Movie, {schemaOptions: {timestamps: true}});


export class Actor extends Typegoose {
    @prop({required: true})
    title: string;
    
    @arrayProp({itemsRef: {name: Movie}})
    movies?: Ref<Movie>[];
}
export const ActorModel = new Actor().getModelForClass(Actor, {schemaOptions: {timestamps: true}});
```

Alright, the models are ready. 
But we didn't create any REST endpoint yet. 
Actually, we didn't even use restgoose.
We will take care of that in the next step. 

## 2. Decorate the models with the `@rest()` decorator
Restgoose is Model-driven. 
It means that the endpoints and their behavior are defined by the models and their decorators. 
A pure restgoose server can live without any controller or router. 
In fact, restgoose will create them for you.

The main decorator of restgoose is `@rest()`. 
It informs restgoose that we want to create some endpoints on a model.
It is both a class decorator and a property decorator.
In this step, we will use it as a class decorator.

`@rest()` takes one argument in the form of an object with two properties : 
- `route`: the path where the endpoint(s) will be created.
- `methods`: an array with the methods that you want to be created. One or several from this list:
    - `all()`: `GET /models`
    - `one()`: `GET /models/:id`
    - `create()`: `POST /models`
    - `update()`: `PATCH /models/:id`
    - `remove()`: `DELETE /models/:id`
    - `removeAll()`: `DELETE /models`

To add the REST endpoints, we just need to add this decorator on top of the model's definitions:
```typescript
import { Typegoose, prop, arrayProp, Ref } from 'typegoose';
import { all, and, asFilter, create, one, remove, rest, RestError, update } from '@xureilab/restgoose';


@rest({
    route: '/movies',
    methods: [
        all(),
        one(),
        create(),
        update(),
        remove(),
    ],
})
export class Movie extends Typegoose {
    @prop({required: true})
    name: string;
    
    @prop({required: true})
    description: string;
    
    @arrayProp({itemsRef: {name: Message}})
    actors?: Ref<Actor>[];
}
export const MovieModel = new Movie().getModelForClass(Movie, {schemaOptions: {timestamps: true}});


@rest({
    route: '/actors',
    methods: [
        all(),
        one(),
        create(),
        update(),
        remove(),
    ],
})
export class Actor extends Typegoose {
    @prop({required: true})
    title: string;
    
    @arrayProp({itemsRef: {name: Movie}})
    movies?: Ref<Movie>[];
}
export const ActorModel = new Actor().getModelForClass(Actor, {schemaOptions: {timestamps: true}});
```

Then, we need to initialize the controllers in your express app:
```typescript
import * as express from 'express';
import { Restgoose } from '@xureilab/restgoose';
const app = express();

/* Some other code for your express app ... */
//Initialize Restgoose
Restgoose.initialize(app);
```

It will create 10 endpoints: 
- `GET /movies`: list all movies
- `POST /movies`: add a movie
- `GET /movies/:id`: show one specific movie
- `PATCH /movies/:id`: update a specific movie
- `DELETE /movies/:id`: remove a specific movie
- `GET /actors`: list all actors
- `POST /actors`: add a actor
- `GET /actors/:id`: show one specific actor
- `PATCH /actors/:id`: update a specific actor
- `DELETE /actors/:id`: remove a specific actor

Pretty simple, right ? 

But what if we want pagination ? 
What about authentication ? We probably don't want anyone to be able to alter the content of our database...

We will see that in the next step.

## 3. Add logic to the endpoints
At this point, we have a basic REST API with read-only endpoints.

In most cases, this is not enough. 
Most REST APIs use some authentication, a pagination mechanism to limit the loading time, maybe some filtering system...

To deal with those, restgoose provides hooks for each substep of an endpoints: 
 1. preFetch: before any call to the database
 1. fetch: the actual call to the database
 1. postFetch: after the data has been fetched from the database
 1. [persist](#persist)
 1. [preSend](#presend)

See the [Rest endpoint lifecycle](./rest-lifecycle.md) for detailed informations on the different hooks.