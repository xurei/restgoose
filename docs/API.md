---
---

# API reference

## Restgoose.initialize()
  This is the enrty point of Restgoose. 
  It creates all the routes in the given context.
  Example:
  ```typescript
  const app = express();
  app.use(Restgoose.initialize());
  ```
    
## @rest(config)
The main decorator of Restgoose. It can be placed on top of a class extending Typegoose, 
or on top of a property in such a class (see [Using @rest() on submodels](#using-rest-on-submodels)).
- ### config: object
  ```typescript
  { 
    route: '/path/to/entity', 
    schemaOptions: mongoose.SchemaOptions,
    getConnection: (req: express.Request) => mongoose.Connection, 
    methods: [
      method( type({
        preFetch?: (req: express.Request) => Promise<boolean>,
        postFetch?: (req: express.Request, entity: mongoose.Entity) => Promise<mongoose.Entity>,
        fetch?: (req: express.Request) => Promise<mongoose.Entity>,
        preSend?: (req: express.Request, entity: mongoose.Entity) => Entity | Promise<Entity>,
      })),
    ] 
  }
  ```
  
  - **route** the path where the model will be served
  
  - **schemaOptions** the mongoose options of the model's schema. 
    See [the mongoose.SchemaOptions type](https://mongoosejs.com/docs/guide.html#options).
    Example: 
    ```typescript
    {
        schemaOptions: { timestamps: true }
    }
    ```
  
  - **getConnection(req: express.Request)** if defined, returns the mongoose connection that will be used for database requests. 
    Typical use case is when multiple databases are used.
    
    Note that it's up to your implementation to keep track of your connections. 
    DO NOT RECONNECT EVERY TIME !
    
    Example:  
    ```typescript
    {
        getConnection: async (req) => { return myConnection; }
    }
    ```
  
  - **method** a provided function that defines a RESTful method :
    - all(options) : GET `/path/to/entity/`
    - one(options) : GET `/path/to/entity/:id`
    - create(options) : POST `/path/to/entity/`
    - update(options) : PATCH `/path/to/entity/:id`
    - remove(options) : DELETE `/path/to/entity/:id`
    - removeAll(options) : DELETE `/path/to/entity/`
    - custom(options) : custom path, ***Work in progress***
    
    Options are explained in the [Rest endpoint lifecycle](./rest-lifecycle.md) page.
    
  - **preFetch**
  
    This method is called **before** any call to MongoDB. This is where you can
    alter the request or check something (e.g. authentication) before fetching the data.
    
    See also the [Rest endpoint lifecycle](./rest-lifecycle.md) page for more details.
    
    Example:
    ```typescript
        function somePreFetchMethod(req) 
        { 
            if (/* some check */) {
                throw new RestError(403, 'Unauthorized');
            }
            else {
                //In case of success, you MUST return true in a preFetch hook.
                return true;
            }
        }
        @rest({
            route: '/items',
            methods: [
                all({
                    postFetch: removePassword
                }),
                one({
                    postFetch: removePassword
                })
            ]
        })
        export class Item extends Typegoose {
            /* ... */
        } 
    ```
    
  - **fetch**
  
    This optional method allows to overwrite the default fetching behaviour.
    
    See the [Rest endpoint lifecycle](./rest-lifecycle.md) page for more details.
    
    Example:
    ```typescript
    async function itemFetchAll(req: Request) {
        // Fetch only public documents
        return ItemModel.find({ public: true });
    }
    
    @rest({
        route: '/items',
        methods: [
            all({ fetch: itemFetchAll }),
        ],
    })
    export class Item extends Typegoose {
        /* ... */
    }
    export const ItemModel = new Item().getModelForClass(Item);
    ```
    
    
  - **postFetch**
  
    This method is called called **after** the entities have been fetched. This is
    useful if you need to check or remove some fields before returning the data.
    
    Those methods are called on each entity fetched.
    They must return the entity, a promise containing the entity, null, or throw an
    Error (typically a RestError).
    
    A typical example would be removing the `password` field of a User entity, or
    checking some access rules.
    
    See also the [Rest endpoint lifecycle](./rest-lifecycle.md) page for more details.
    
    Examples:
    1. Create the routes GET `/items/` and GET `/items/:id`. 
       - `/items/` will filter items that are not accessible with the use the `asFilter()` helper.
       - `items/:id` will return a 403 error if the item is not accessible
       
       ```typescript
           function checkAccessRule(req, item) 
           {
               return Promise.resolve()
               .then(() => fetchUser()) // fetch the user somehow
               .then(user => {
                   if (userCanReadItem(user, item)) {
                       return item;
                   }
                   else {
                       // filter the entity from the result
                       return null; 
                       // or throw an exception, stopping the pipeline
                       throw new RestError(403, 'Cannot access item'); 
                   }
               });
           }
       
           @rest({
               route: '/items',
               methods: [
                   all({
                       postFetch: asFilter(checkAccessRule)
                   }),
                   one({
                       postFetch: checkAccessRule
                   })
               ]
           })
           export class Item extends Typegoose {
               /* ... */
           }
       ```
       
  - **preSend** a function
  
    These methods work the same way as the `postFetch` methods. The differs from them as they are
    called after an optional save() in the database, and before the result get sent through the network.
    
    See also the [Rest endpoint lifecycle](./rest-lifecycle.md) page for more details.
    
    Examples:
    1. Create the routes GET `/users/` and GET `/users/:id`. 
       Both will remove the `password` field from the returned object(s).
       ```typescript
           function removePassword(req, user) 
           { 
               user.password = null;
               return user;
           }
           
           @rest({
               route: '/users',
               methods: [
                   all({
                       preSend: removePassword
                   }),
                   one({
                       preSend: removePassword
                   })
               ]
           })
           export class User extends Typegoose {
               @prop({required: true})
               password: string;
               /* ... */
           }
       ``` 
       
- ### Using `@rest()` on submodels
  TODO
  
## Middlewares composition
   Restgoose provides two helper function to compose your middlewares, easing the reusability of your middlewares.
   
   The returned functions generated by `or()`/`and()` can themselves be used in another `or()`/`and()`, allowing
   complex logic : 
   ```typescript
   or(and(middlewareA, middlewareB), and(middlewareA, middlewareC))
   ```
   
   **NOTE** : middleware composition does NOT work with the `fetch` or `persist` hooks.
   
   - ### or(...fns)
     Compose several middlewares with a logical OR operation.
     
     In case of a rejection (i.e. a throw or a returned null) from the previous middleware, the next is executed.
     
     Otherwise, the returned value is passed through.
     
     If all the middlewares are rejected, the error thrown from the last one is passed through.
     
     Example: 
     ```typescript
     /**
      * return the entity if the user is admin, throw 401 otherwise
      */
     function isAdmin(req:Request) { /* ... */ }
     /**
      * return the entity if the owner field is the user, throw 401 otherwise
      */
     function isOwner(req:Request) { /* ... */ }
          
     @rest({
        route: '/items',
        methods: [
            all({
                postFetch: asFilter(or(isAdmin, isOwner))
            }),
            one({
                postFetch: or(isAdmin, isOwner)
            })
        ]
     })
     ```

   - ### and(...fns)
     Compose several middlewares with a logical AND operation.
     
     All middlewares must pass for the entity to be returned.
     
     If any middleware is rejected, the error thrown is passed through.

## asFilter(fn)
Converts a `postFetch` or `preSend` function throwing errors to a filtering one. 

It returns the entity if the function didn't throw, or null if the function has thrown an error.

This is typically used for the 'all' methods.
You only need to write you middleware once, always throw an error instead of null, 
then wrap it around with `asFilter()`. 

- ### fn
  A postFetch middleware function. Signature: `(req, entity:E) => E | Promise<E>`

- ### Return
  A function with the same signature, but that will never throw an error or call the 
  `catch()` method of the returned Promise, but `null` instead.

- ### Example: 
  ```typescript
  function myPostFetchFn(req, item) {
      if (/* some check */) {
          return item;
      }
      else {
          throw new RestError(403, 'Cannot access item'); 
      }
  }
  // asFilter(myPostFetchFn) will return a function with the same signature, 
  // but will return null if an error is thrown
  @rest({
     route: '/items',
     methods: [
         all({
             postFetch: asFilter(myPostFetchFn)
         }),
         one({
             postFetch: myPostFetchFn
         })
     ]
  })
  export class Item extends Typegoose {
     /* ... */
  }
  ```