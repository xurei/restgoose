---
import_css: getting-started.css
---

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
Also, we want the movies to list its actors and the actors to list their filmography. 

------

## 2. Setup the server
First we need to setup a working server. Let's start a new typesciprt project.

```bash
mkdir restgoose-getting-started
cd restgoose-getting-started
npm init -y
npm install typescript express typegoose mongoose body-parser @xureilab/restgoose reflect-metadata
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
import { prop, Typegoose } from 'typegoose';
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
import { Typegoose, prop, arrayProp, Ref } from 'typegoose';
import { Actor } from './actor';

export class Movie extends Typegoose {
    @prop({required: true})
    name: string;
    
    @prop({required: true})
    description: string;
    
    @arrayProp({itemsRef: {name: Actor}})
    actors?: Ref<Actor>[];
}
```

**src/actor.ts:**
```typescript
import { Typegoose, prop, arrayProp, Ref } from 'typegoose';
import { Movie } from './movie';

export class Actor extends Typegoose {
    @prop({required: true})
    name: string;
    
    @arrayProp({itemsRef: {name: Movie}})
    movies?: Ref<Movie>[];
}
```

Alright, the models are ready. 

Now we need to create the endpoints. 
We will take care of that in the next step. 

------

## 4. Decorate the models with the `@rest()` decorator
Restgoose is Model-driven. 
It means that the endpoints and their behavior are defined by the models and their decorators. 
A pure restgoose server can live without any controller or router. 
In fact, restgoose will create them for you.

The main decorator of restgoose is `@rest()`. 
It defines the rest endpoint that we want to create on a model.

`@rest()` takes one argument in the form of an object with at least two properties : 
- `route`: the path where the endpoint(s) will be created (`/models` in the example).
- `methods`: an array with the methods that you want to be created. One or several from this list:
    - `all()`: `GET /models`
    - `one()`: `GET /models/:id`
    - `create()`: `POST /models`
    - `update()`: `PATCH /models/:id`
    - `remove()`: `DELETE /models/:id`
    - `removeAll()`: `DELETE /models`

To add the REST endpoints, we just need to add this decorator on top of the model's definitions:

**src/movie.ts:**
```typescript
      import { Typegoose, prop, arrayProp, Ref } from 'typegoose';
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
      export class Movie extends Typegoose {
          @prop({required: true})
          name: string;
          
          @prop({required: true})
          description: string;
          
          @arrayProp({itemsRef: {name: Actor}})
          actors?: Ref<Actor>[];
      }
```

**src/actor.ts:**
```typescript        
      import { Typegoose, prop, arrayProp, Ref } from 'typegoose';
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
      export class Actor extends Typegoose {
          @prop({required: true})
          name: string;
          
          @arrayProp({itemsRef: {name: Movie}})
          movies?: Ref<Movie>[];
      }
```

Then, we need to initialize the controllers in your express app:

**src/server.ts:**
```typescript
      import * as express from 'express';
      import { prop, Typegoose } from 'typegoose';
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
      
      export { app, server };
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

You should get this result:
```json
{
  "actors": [],
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
    "actors": [],
    "_id": "5c3e524d3fb1491661482fd1",
    "name": "The Lord of The Rings - The Fellowship of the Ring",
    "description": "A meek Hobbit from the Shire and eight companions set out on a journey ...",
    "__v": 0
  }
]
```

You can try all the endpoints we defined in the requirements.
They should all be there and working.

OK, nice, but what about pagination and authorization ? 
Right now we have none of these. 

We will see that in the next step.

------

## 5. Add logic to the endpoints
At this point, we have a basic REST API with the endpoints we want. 
They still need some logic to work as expected.

Restgoose provides hooks that you can use to alter its behavior. 
They are all defined in the [Rest endpoint lifecycle](./rest-lifecycle.md).
We are going to use these hooks to add the logic we want. 

### Authorization
We want POST, PATCH and DELETE operations to be secured with a token in the header.

According to the [Rest endpoint lifecycle](./rest-lifecycle.md), the `preFetch` hook is typically used in this case.

This hooks is trigerred before any call to the database. 
This is indeed the earliest hook than can be trigerred. 
We should stop the execution as soon as possible if the user does not have access. 

**src/verifytoken.ts:**
```typescript
import { Request } from 'express';
import { RestError } from '@xureilab/restgoose';

export async function verifyToken(req: Request): Promise<boolean> {
    if (!(req.headers && req.headers['authorization'])) {
        throw new RestError(401, { code: 'UNAUTHENTICATED' });
    }
    else {
        if (req.headers['authorization'] === 'super-secret') {
            return true;
        }
        else {
            throw new RestError(401, { code: 'UNAUTHENTICATED' });
        }
    }
}
```

The `verifyToken` function reads the `req` object (a typical express request object) and checks for an `authorization` header.
If it's defined and equals to `super-secret`, the promise it returns completes. If not, it throw a RestError with the code `401` and some extra information.

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
      export class Movie extends Typegoose {
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

This time, we will use the `preSend` hook. Note that we can also use the `postFetch` hook as well in that case.

**src/keepfields.ts:**
```typescript
import { Request } from 'express';
import { Typegoose } from 'typegoose';

export function keepFields<T extends Typegoose>(...fieldNames: string[]) {
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
This is the generated hook built with the `fieldNames` argument.

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
      export class Movie extends Typegoose {
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

This time, we will use the `preFetch` hook again.

Restgoose adds a `restgoose` property in the `req` object: 
```js
{
    restgoose: {
    	filter: { /* MongoDb query. This is populated by the ?q query string */ }
    	options: { /* MongoDb options. See https://mongoosejs.com/docs/api.html#query_Query-setOptions */ }
    	projection: { /* MongoDb projection */ }
    }
}
```

We will create a `preFetch` hook that will add a `skip` and `limit` options in the `restgoose` object.

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
      export class Movie extends Typegoose {
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
    /* and 19 other objects ... */
]
```

