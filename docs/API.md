# API documentation

### @rest(config)
config: object
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
    ```
        function somePreFetchMethod(req, res, next) 
        { 
            if (/* some check */) {
                res.send(403);
            }
            else {
                next();
            }
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
    ```
        function removePassword(req, user) 
        { 
            user.password = null;
            return user;
        }
    ```
    
    ```
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
    ```