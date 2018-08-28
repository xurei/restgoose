[Index](./)

# Rest endpoint lifecycle

## Overview
All the REST endpoints follow the same lifecycle. 
The `@rest` decorator provides lifecycle hooks to most of the steps. 

1. [preFetch](#prefetch)
1. (submodels only) [fetchParent](#fetchparent-submodels-only)
   1. buildQuery
   1. fetch
   1. postFetch
1. [buildQuery](#buildquery)
1. [fetch](#fetch)
1. [postFetch](#postfetch)
1. [persist](#persist)
1. [preSend](#presend)

## Steps
### preFetch
This step is responsible of the alteration or rejection of the request before any query is done.

This is usually where the authentication check is done.

### buildQuery
This step is responsible of the creation of the MongoDB query using [mongoose](https://mongoosejs.com/).

This step is typically used for pagination or filtering.

### fetch
This step is the actual call to the database. 
This step does not have a lifecycle hook.

The following table shows the mongoose function that are called for each pre-defined method:

| method        | function                        |
|---------------|---------------------------------|
| `all()`       | `Model.find()`                  |
| `one()`       | `Model.findById()`              |
| `create()`    | `new Model().save()`            | 
| `update()`    | `Model.findById().save()`       | 
| `remove()`    | `Model.findById().deleteOne()`  | 
| `removeAll()` | `Model.findById().deleteMany()` | 

### postFetch
This step is responsible of any post-treatment that requires the fetched entity/entities.

It is typically used for filtering with some complex logic, to cross-checking 
with other entities or - in the case of a create/update/remove - to do extra checks before
persisting the entity. 
It can also be used to trigger some events (e.g. sending an email). 

### persist (write methods only)
This step is the actual call to the database when a persistence call is required 
(i.e. `create()`, `update()`, `remove()`, `removeAll()`).
 
This step does not have a lifecycle hook.

The following table shows the mongoose function that are called for each pre-defined method:

| method        | function             |
|---------------|----------------------|
| `create()`    | `new Model().save()` | 
| `update()`    | `Model.save()`       | 
| `remove()`    | `Model.deleteOne()`  | 
| `removeAll()` | `Model.deleteMany()` | 

### preSend
This step is responsible of any post-treatment before sending the output, and after the entity has been persisted (if required).
 
Also, it is not being called in the fetchParent step (see below), while the postFetch step is. 
This is useful if you want to alter the returned JSON but don't want it to happen internally in the backend 
(e.g. filtering hidden fields).

### fetchParent (submodels only)
This step only happens on submodels endpoint (e.g. `/entities/:id/subentities`). 
It is a minimal version of a normal lifecycle on the parent entity (e.g. `/entities/:id`). 

It is only composed of three steps: **buildQuery**, **fetch** and **postFetch**. 
They works exactly as described above, but on the parent model instead of the 
submodel that the enpoint points to. 
