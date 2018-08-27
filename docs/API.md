[Index](./)

# API reference

## @rest(config)
- ### config: object
  ```typescript
  { 
    route: '/path/to/entity', 
    methods: [
      method({
        preFetch: Array< (req,res,next)=>void >, 
        postFetch: Array< (req,entity)=>Entity >, 
      }),
    ] 
  }
  ```
  
  - **route** the path where the model will be served
  
  - **method** a provided function that defines a RESTful method :
    - all() : GET `/path/to/entity/`
    - one() : GET `/path/to/entity/:id`
    - create() : POST `/path/to/entity/`
    - update() : PATCH `/path/to/entity/:id`
    - remove() : DELETE `/path/to/entity/:id`
    - removeAll() : DELETE `/path/to/entity/`
    - custom() : custom path, ***TODO***
    
  - **preFetch** an array of express-compatible middlewares. 
    Those methods are called **before** any call to MongoDB. This is where you can
    alter the request or check something (e.g. authentication) before fetching the data.
    
    See also the [Rest endpoint lifecycle](./rest-lifecycle.md) page for more details.
    
    Example:
    ```typescript
        function somePreFetchMethod(req, res, next) 
        { 
            if (/* some check */) {
                res.send(403);
            }
            else {
                next();
            }
        }
        @rest({
            route: '/items',
            methods: [
                all({
                    postFetch: [ removePassword ]
                }),
                one({
                    postFetch: [ removePassword ]
                })
            ]
        })
        export class Item extends Typegoose {
            /* ... */
        } 
    ```
    
  - **postFetch** an array of middlewares. 
    Those methods are called **after** the entities have been fetched. This is
    useful if you need to check or remove some fields before returning the data.
    
    Those methods are called on each entity fetched.
    They must return the entity, a promise containing the entity, null, or throw an
    Error (typically a RestError).
    
    A typical example would be removing the `password` field of a User entity, or
    checking some access rules.
    
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
                       postFetch: [ removePassword ]
                   }),
                   one({
                       postFetch: [ removePassword ]
                   })
               ]
           })
           export class User extends Typegoose {
               @prop({required: true})
               password: string;
               /* ... */
           }
       ``` 
    
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
                       postFetch: [ asFilter(checkAccessRule) ]
                   }),
                   one({
                       postFetch: [ checkAccessRule ]
                   })
               ]
           })
           export class Item extends Typegoose {
               /* ... */
           }
       ```
       
- ### Using `@rest()` on submodels
  TODO

## asFilter(postFetchFn)
Converts a postFetch function throwing errors to a filtering one. 
It returns the entity if the function didn't throw, or null if the function has thrown an error.
This is typically used for the 'all' methods.
You only need to write you middleware once, always throw an error instead of null, 
then wrap it around with `asFilter()`. 

- ### postFetchFn
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
             postFetch: [ asFilter(myPostFetchFn) ]
         }),
         one({
             postFetch: [ myPostFetchFn ]
         })
     ]
  })
  export class Item extends Typegoose {
     /* ... */
  }
  ```