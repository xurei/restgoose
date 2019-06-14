# Getting started with restgoose

This tutorial will walk through the initial steps to create a basic restgoose application.
We will create a REST API listing movies and actors.
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
Our forum will contain two models :
- Movie
- Actor

First, let's create the models with typegoose.

**User.ts**
```typescript
import { Typegoose, prop } from 'typegoose';

export class User extends RestgooseModel {
    @prop({required: true, unique: true})
    nickname: string;
    
    @prop({required: true})
    password: string;
}
export const UserModel = new User().getModelForClass(User, {schemaOptions: {timestamps: true}});
```

**Topic.ts**
```typescript
import { Typegoose, prop, arrayProp, Ref } from 'typegoose';
import { Message } from './Message';

export class Topic extends RestgooseModel {
    @prop({required: true})
    title: string;
    
    @arrayProp({itemsRef: {name: Message}})
    messages?: Ref<Message>[];
}
export const TopicModel = new Topic().getModelForClass(Topic, {schemaOptions: {timestamps: true}});
```

**Message.ts**
```typescript
import { Typegoose, prop, Ref } from 'typegoose';
import { User } from './User';

export class Message extends RestgooseModel {
    @prop({ required: true, ref: User, index: true })
    author: Ref<User>;
    
    @prop({required: true})
    content: string;
}
export const MessageModel = new Message().getModelForClass(Message, {schemaOptions: {timestamps: true}});
```

Alright, we have the models ready. 
But we didn't create any REST endpoint yet. 
(Actually, we didn't even use restgoose).
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
    - `update()`: `UPDATE /models/:id`
    - `remove()`: `DELETE /models/:id`
    - `removeAll()`: `DELETE /models`

**User.ts**
```typescript
import { Typegoose, prop } from 'typegoose';
import { all, and, asFilter, create, one, remove, rest, RestError, update } from '@xureilab/restgoose';

@rest({
    route: '/users',
    methods: [
        all()
    ],
})
export class User extends RestgooseModel {
    @prop({required: true, unique: true})
    nickname: string;
    
    @prop({required: true})
    password: string;
}
export const UserModel = new User().getModelForClass(User, {schemaOptions: {timestamps: true}});
```
