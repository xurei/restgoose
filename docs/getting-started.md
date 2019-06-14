---
import_css: getting-started.css
---

# Getting started with restgoose

This tutorial will walk through the initial steps to create a basic restgoose application.
We will create a basic IMDB-like REST API listing movies and actors.

The full code can be found there: [https://github.com/xurei/restgoose-getting-started](https://github.com/xurei/restgoose-getting-started)

## Prerequites
We assume that you are already familiar with those concepts and technologies: 
- Node.js
- Express
- Typescript
- MongoDB
- How RESTful APIs work, specifically how HTTP methods should be used and which status code to use.

------

## 1. Define the API requirements
In this tutorial, we will create an IMDB-like REST API listing movies and actors.
It will be possible for authorized users to add/update/delete actors or movies.

Our API should expose those endpoints: 
- `GET /movies` : list all movies with limited properties. This should be paginated
- `GET /movies/:id` : get a specific movie with all its properties
- `POST /movies` : add a movie (if authorized)
- `PATCH /movies/:id` : edit a movie (if authorized)
- `DELETE /movies/:id` : delete a movie (if authorized)

Same goes for actors.

We will use a simple authorization for the sake of simplicity: a secret key to provide in the header of the requests. 
Also, we want the movies to contain a list of its actors and the actors a list of their respective filmography. 

------

## 2. Setup the server
First we need to setup a working server. Let's start a new typescript project.

```bash
mkdir restgoose-getting-started
cd restgoose-getting-started
npm init -y
npm install typescript express mongoose body-parser @xureilab/restgoose reflect-metadata
npm install --save --dev @types/node @types/express @types/mongoose
```

Add the `build` and `start` scripts.
 
**package.json:**
```json
{
  "scripts": {
    "start": "node ./build/server.js",
    "build": "tsc"
  } 
}
``` 

**tsconfig.json:**
```json
{
  "compilerOptions": {
    "target": "es2015",
    "module": "commonjs",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "outDir": "build",
    "sourceMap": true
  },
  "include": [
    "src/**/*.ts"
  ],
  "exclude": [
    "node_modules"
  ]
}
```
Notice the presence of `experimentalDecorators` and `emitDecoratorMetadata`. 
Those are important for restgoose to work.

For the main file, business as usual: we setup express, connect to the database and listen on port 3000. 

**src/server.ts:**
```typescript
import * as express from 'express';
import * as mongoose from 'mongoose';
import * as bodyParser from 'body-parser';

// Create the minimal express with bodyParser.json
const app = express();
app.use(bodyParser.json());

// Connect to your database with mongoose
const mongoHost = (process.env.MONGO_URI || 'mongodb://localhost/') + 'restgoose-getting-started';
console.log('Mongo Host:', mongoHost);
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

//Start the server
let server = require('http').createServer(app);
server = server.listen(3000, function () {
    console.log('Example app listening on port 3000!')
});
```

Make sure you have a local MongoDB server running and start the server:
```bash
npm run build
npm start
```

Go to `http://localhost:3000/`. The server should return 'Cannot GET /'.

This is normal: we didn't set any endpoint yet. Let's first define our models. 

------

## 3. Create the models
Our API will contain two models: Movie and Actor.

**src/movie.ts:**
```typescript
import { RestgooseModel, prop, arrayProp } from '@xureilab/restgoose';
import { ObjectId } from 'mongodb';
import { Actor } from './actor';

export class Movie extends RestgooseModel {
    @prop({required: true})
    name: string;

    @prop({required: true})
    description: string;

    @arrayProp({items: Actor, ref: true})
    actors?: ObjectId[];
}
```

**src/actor.ts:**
```typescript
import { RestgooseModel, prop, arrayProp } from '@xureilab/restgoose';
import { ObjectId } from 'mongodb';
import { Movie } from './movie';

export class Actor extends RestgooseModel {
    @prop({required: true})
    name: string;

    @arrayProp({items: Movie, ref: true})
    movies?: ObjectId[];
}
```

The `RestgooseModel` is the main class of any model using Restgoose. 

The `@prop` decorator indicates that the field is a property that should be persisted. 
You can pass options in the decorator to change the behaviour of the field. 
See the [decorators](./decorators.md) section.  

The `@arrayProp` decorator indicates that the field is an array that should be persisted. 
It is basically the same thing as `@prop`, except that it is persisted as an array of items.  

Alright, the models are ready. Now we need to create the endpoints.
 
We will take care of that in the next step. 

------

## 4. Decorate the models with the `@rest()` decorator
Restgoose is Model-driven. 
It means that the endpoints and their behavior are defined by the models and their decorators. 

A pure restgoose server can live without any controller or router. 
In fact, restgoose will create them for you.

The main decorator of restgoose is `@rest()`. 
It defines the rest endpoint that we want to create on a model.

It takes one argument in the form of an object with at least two properties : 
- `route`: the path where the endpoint(s) will be created (`/models` in the example below).
- `methods`: an array with the methods that you want to be created. 
  One or several from this list:
    - `all()`: `GET /models`
    - `one()`: `GET /models/:id`
    - `create()`: `POST /models`
    - `update()`: `PATCH /models/:id`
    - `remove()`: `DELETE /models/:id`
    - `removeAll()`: `DELETE /models`

These magic methods are defined in restgoose and will create the endpoints we want. 

To add the REST endpoints, we just need to add this decorator on top of the model's definitions:

**src/movie.ts:**
```typescript
      import { RestgooseModel, prop, arrayProp } from '@xureilab/restgoose';
      import { ObjectId } from 'mongodb';
      import { Actor } from './actor';
/*+*/ import { all, and, asFilter, create, one, remove, rest, RestError, update } from '@xureilab/restgoose';
        
/*+*/ @rest({
/*+*/     route: '/movies',
/*+*/     methods: [
/*+*/         all(),    //GET    /movies
/*+*/         one(),    //GET    /movies/:id
/*+*/         create(), //POST   /movies
/*+*/         update(), //PATCH  /movies/:id
/*+*/         remove(), //DElETE /movies/:id
/*+*/     ],
/*+*/ })
      export class Movie extends RestgooseModel {
          @prop({required: true})
          name: string;
      
          @prop({required: true})
          description: string;
      
          @arrayProp({items: Actor, ref: true})
          actors?: ObjectId[];
      }
```

**src/actor.ts:**
```typescript        
      import { RestgooseModel, prop, arrayProp } from '@xureilab/restgoose';
      import { ObjectId } from 'mongodb';
      import { Movie } from './movie';
/*+*/ import { all, and, asFilter, create, one, remove, rest, RestError, update } from '@xureilab/restgoose';

/*+*/ @rest({
/*+*/     route: '/actors',
/*+*/     methods: [
/*+*/         all(),    //GET    /actors          
/*+*/         one(),    //GET    /actors/:id      
/*+*/         create(), //POST   /actors      
/*+*/         update(), //PATCH  /actors/:id 
/*+*/         remove(), //DElETE /actors/:id
/*+*/     ],
/*+*/ })
      export class Actor extends RestgooseModel {
          @prop({required: true})
          name: string;
      
          @arrayProp({items: Movie, ref: true})
          movies?: ObjectId[];
      }
```

Okay, now we need to import the models in the server and initialize Restgoose:

**src/server.ts:**
```typescript
      import * as express from 'express';
      import * as mongoose from 'mongoose';
      import * as bodyParser from 'body-parser';
/*+*/ import { Restgoose } from '@xureilab/restgoose';
        
/*+*/ // Import the models
/*+*/ import './movie';
/*+*/ import './actor';

      // Create the minimal express with bodyParser.json
      const app = express();
      app.use(bodyParser.json());
      
/*+*/ // Initialize Restgoose
/*+*/ app.use(Restgoose.initialize());
      
      // Connect to your database with mongoose
      const mongoHost = (process.env.MONGO_URI || 'mongodb://localhost/') + 'restgoose-getting-started';
      console.log('Mongo Host:', mongoHost);
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
      
      //Start the server
      let server = require('http').createServer(app);
      server = server.listen(3000, function () {
          console.log('Example app listening on port 3000!')
      });
```

We now have a working REST API! 

Rebuild and restart the server then go to `http://localhost:3000/movies`. The server should return this:
```json
[]
```

Not very impressing... But wait, we didn't add any movie yet. Lets try that. 
POST to `http://localhost:3000/movies`:
```bash
curl -X POST http://localhost:3000/movies \
   -H 'Content-Type: application/json' \
   -d '{
      "name": "The Lord of The Rings - The Fellowship of the Ring",
      "description": "A meek Hobbit from the Shire and eight companions set out on a journey ..."
   }'
```

You should get something like this:
```json
{
  "_id": "5c3e524d3fb1491661482fd1",
  "name": "The Lord of The Rings - The Fellowship of the Ring",
  "description": "A meek Hobbit from the Shire and eight companions set out on a journey ...",
  "__v": 0
}
```

Let's go back to GET `http://localhost:3000/movies` and voilà! The server returns something:
```json
[
  {
    "_id": "5c3e524d3fb1491661482fd1",
    "name": "The Lord of The Rings - The Fellowship of the Ring",
    "description": "A meek Hobbit from the Shire and eight companions set out on a journey ...",
    "__v": 0
  }
]
```

You can try all the endpoints we defined in the requirements.
They should all be there and working.

OK, but what about pagination, authorization... all that stuff that make an API actually useful ? 
We still have none of these. 

Let's deal with that in the next step.

------

## 5. Add logic to the endpoints
At this point, we have a basic REST API with the endpoints we want. 
They still need some logic to work as expected.

Restgoose provides middlewares that you can use to alter the behavior of a specific endpoint. 
We are going to use these middlewares to add the logic we want.

A complete description of the middlewares can be found in the [Rest endpoint lifecycle](./rest-lifecycle.md).

### Authorization
We want POST, PATCH and DELETE operations to be secured with a token in the header.

According to the [Rest endpoint lifecycle](./rest-lifecycle.md), the `preFetch` middleware is typically used in this case:
we don't want to do anything with the database before authentication of the request.

The `preFetch` middleware is trigerred before any call to the database. 
This is indeed the earliest middleware than can be trigerred. 
We should stop the execution as soon as possible if the user does not have access. 

**src/verifytoken.ts:**
```typescript
import { Request } from 'express';
import { RestError, RestgooseModel } from '@xureilab/restgoose';

export async function verifyToken(req: Request, entity: RestgooseModel): Promise<RestgooseModel> {
    if (!(req.headers && req.headers['authorization'])) {
        throw new RestError(401, { code: 'UNAUTHENTICATED' });
    }
    else {
        // WARNING : THIS IS **NOT** SAFE ! It has been simplified for the simplicity of this article.
        // DO NOT USE IN PRODUCTION !
        if (req.headers['authorization'] === 'super-secret') {
            // If it returns, the flow will continue.
            return entity;  
        }
        else {
            // If it throws, the flow will be stopped.
            throw new RestError(401, { code: 'UNAUTHENTICATED' });
        }
    }
}
```

Okay, let's break this down to understand what it means:
- All restgoose middlewares take two arguments : the Request object from express, and an entity. (Note: In a `preFetch` 
  situation, the entity would be `null`, but that's okay).
- If the middleware wants the flow to stop, it just needs to throw an error. Restgoose provides a `RestError` for
  convenience, but any Exception will do.
- The body of the middlewares checks that the `authorization` header is set and valid. 

  If it is, the middleware returns the entity (`null` here). 
  If not, it throws a RestError with status code `401`.
  
Now that our middleware is written, let's add it in our models:

**src/movie.ts:**
```typescript
      import { Typegoose, prop, arrayProp, Ref } from 'typegoose';
      import { Actor } from './actor';
      import { all, and, asFilter, create, one, remove, rest, RestError, update } from '@xureilab/restgoose';
/*+*/ import { verifyToken } from './verifytoken';
        
      @rest({
          route: '/movies',
          methods: [
              all(),    //GET    /movies
              one(),    //GET    /movies/:id
/*+*/         create({  //POST   /movies
/*+*/           preFetch: verifyToken
/*+*/         }), 
/*+*/         update({  //PATCH  /movies/:id
/*+*/           preFetch: verifyToken
/*+*/         }), 
/*+*/         remove({  //DElETE /movies/:id
/*+*/           preFetch: verifyToken
/*+*/         }), 
          ],
      })
      export class Movie extends RestgooseModel {
          @prop({required: true})
          name: string;
          
          @prop({required: true})
          description: string;
          
          @arrayProp({itemsRef: {name: Actor}})
          actors?: Ref<Actor>[];
      }
```  

That's it! The `/movies` endpoint should be secured. Lets verify that.

```bash
curl -X POST http://localhost:3000/movies \
   -H 'Content-Type: application/json' \
   -d '{
     "name": "Some Fake Movie",
     "description": "Some Fake Description"
   }'
```
Output:
```json
{
    "code": "UNAUTHENTICATED"
}
```

Great! Now with the `super-secret` passwode:
```bash
curl -X POST http://localhost:3000/movies \
   -H 'Content-Type: application/json' \
   -H 'authorization: super-secret' \
   -d '{
     "name": "Some Real Movie",
     "description": "Some Real Description"
   }'
```

Output:
```json
{
  "actors": [],
  "_id": "5c3e5b6299e0db258a00cfd5",
  "name": "Some Real Movie",
  "description": "Some Real Description",
  "__v": 0
}
```

Perfect! Authorization is working.
Add the same lines in `src/actor.ts` 

### Filtering properties
For the `GET /movies` and `GET /actors` endpoints, we only need to return the `_id` and `name` properties.

This time, we will use the `preSend` middleware. Note that we can also use the `postFetch` middleware as well in that case.

**src/keepfields.ts:**
```typescript
import { Request } from 'express';
import { Typegoose } from 'typegoose';

export function keepFields<T extends RestgooseModel>(...fieldNames: string[]) {
    return async function(req: Request, entity: T) {
        const out = {};
        fieldNames.forEach(name => {
            out[name] = entity[name];
        });
        return out as T;
    };
}
```
Let's take a deeper look at this function.

`keepFields` returns a function. 
This is the generated middleware built with the `fieldNames` argument.

The function takes the `req` argument from express and an `entity` argument which is the returned object from the database.
It returns a filtered object that contains only the fields listed in `fieldNames`.

Let's use this function in our model:  

**src/movie.ts:**
```typescript
      import { Typegoose, prop, arrayProp, Ref } from 'typegoose';
      import { Actor } from './actor';
      import { all, and, asFilter, create, one, remove, rest, RestError, update } from '@xureilab/restgoose';
      import { verifyToken } from './verifytoken';
/*+*/ import { keepFields } from './keepfields';
        
      @rest({
          route: '/movies',
          methods: [
/*+*/         all({       //GET    /movies
/*+*/           preSend: keepFields('_id', 'name')   
/*+*/         }),    
              one(),    //GET    /movies/:id
              create({  //POST   /movies
                preFetch: verifyToken
              }), 
              update({  //PATCH  /movies/:id
                preFetch: verifyToken
              }), 
              remove({  //DElETE /movies/:id
                preFetch: verifyToken
              }), 
          ],
      })
      export class Movie extends RestgooseModel {
          @prop({required: true})
          name: string;
          
          @prop({required: true})
          description: string;
          
          @arrayProp({itemsRef: {name: Actor}})
          actors?: Ref<Actor>[];
      }
```  

Let's take a look on `GET /movies`:
```json
[
  {
    "_id": "5c3e524d3fb1491661482fd1",
    "name": "The Lord of The Rings - The Fellowship of the Ring",
  },
  {
    "_id": "5c3e524d3fb149161b97a8ef",
    "name": "The Lord of The Rings - The Two Towers",
  },
  ...
]
```

Do the same for the Actor model and we are done.

### Queries

By default, Restgoose adds a querying system with the query string `q`. 
It takes a mongodb query object, urlencoded.
For example, if you want to get all the movies starting with 'The', you can query it with:
```json
{ "name": { "$regex": "^The" } }
```
The URL becomes, after url encoding:
```
http://localhost:3000/movies?q=%7B%22name%22%3A%7B%22%24regex%22%3A%22%5EThe%22%7D%7D
```

### Pagination
In order to test pagination, let's add 500 movies in the database:
```bash
for i in {1..500}
do
   curl -X POST http://localhost:3000/movies \
   -H 'Content-Type: application/json' \
   -H 'authorization: super-secret' \
   -d "{
     \"name\": \"movie${i}\",
     \"description\": \"description${i}\"
   }"
done
```

This time, we will use the `preFetch` middleware again.

Restgoose adds a `restgoose` property in the `req` object: 
```js
{
    restgoose: {
    	filter: { }, //MongoDb query. This is populated by the ?q query string
    	options: { }, // MongoDb options. See https://mongoosejs.com/docs/api.html#query_Query-setOptions
    	projection: { }, // MongoDb projection 
    }
}
```

We will create a `preFetch` middleware that will add a `skip` and `limit` options in the `restgoose` object.

**addpagination.ts:**
```typescript
import { RestRequest } from '@xureilab/restgoose';

export async function addPagination(req: RestRequest): Promise<boolean> {
    const query = req.query || {};
    const skip = query.page * 20;

    req.restgoose.options = Object.assign({}, req.restgoose.options, {
        skip: skip,
        limit: 20
    });
    return true;
}
```

This function limits the database requests to 20 objects, and uses the `page` query string.

And we add this in the model definition:
**src/movie.ts:**
```typescript
      import { Typegoose, prop, arrayProp, Ref } from 'typegoose';
      import { Actor } from './actor';
      import { all, and, asFilter, create, one, remove, rest, RestError, update } from '@xureilab/restgoose';
      import { verifyToken } from './verifytoken';
      import { keepFields } from './keepfields';
/*+*/ import { addPagination } from './addpagination';
        
      @rest({
          route: '/movies',
          methods: [
              all({       //GET    /movies
/*+*/           preFetch: addPagination,
                preSend: keepFields('_id', 'name')   
              }),    
              one(),    //GET    /movies/:id
              create({  //POST   /movies
                preFetch: verifyToken
              }), 
              update({  //PATCH  /movies/:id
                preFetch: verifyToken
              }), 
              remove({  //DElETE /movies/:id
                preFetch: verifyToken
              }), 
          ],
      })
      export class Movie extends RestgooseModel {
          @prop({required: true})
          name: string;
          
          @prop({required: true})
          description: string;
          
          @arrayProp({itemsRef: {name: Actor}})
          actors?: Ref<Actor>[];
      }
```  

Now by doing `GET /movies`:
```json
[
    {
        "_id": "5c3e5c6499e0db258a00d087",
        "name": "movie78"
    },
    // and 19 other objects ...
]
```

