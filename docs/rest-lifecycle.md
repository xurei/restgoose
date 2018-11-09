[Index](./)

# Rest endpoint lifecycle

## Overview
All the REST endpoints follow the same lifecycle. 
The `@rest` decorator provides lifecycle hooks to all steps. 

1. [preFetch](#prefetch)
1. (submodels only) [fetchParent](#fetchparent-submodels-only)
   1. fetch
   1. postFetch
1. [fetch](#fetch)
1. [postFetch](#postfetch)
1. [persist](#persist)
1. [preSend](#presend)

## Steps
### preFetch
This step is responsible of the alteration or rejection of the request before any query is done.

This is usually where the authentication and validation are done.

### fetch
This step is the actual call to the database. 
It is responsible of the creation of the MongoDB query with [mongoose](https://mongoosejs.com/).

It executes the query returned by the `fetch` hook, or uses the default behaviour 
(see the [reference table](#reference-table) below).

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
 
Also, it is not being called in the [fetchParent](#fetchparent-submodels-only) step, while the [postFetch](#postfetch) step is. 
This is useful if you want to alter the returned JSON but don't want it to happen internally in the backend 
(e.g. filtering hidden fields).

preSend is not called on `remove()` and `removeAll()` methods. 

### fetchParent (submodels only)
This step only happens on submodels endpoint (e.g. `/entities/:id/subentities`). 
It is a minimal version of a normal lifecycle on the parent entity (e.g. `/entities/:id`). 

It is only composed of two steps: **fetch** and **postFetch**. 
They work exactly as described in their respective sections, but on the parent model instead of the 
submodel that the enpoint points to.

### Reference table
The following table shows the mongoose functions that are called at fetch and persist step, 
and indicates if hooks are called or not.

| method        | preFetch |   fetch                       | postFetch | persist              | preSend |
|---------------|----------|-------------------------------|-----------|----------------------|---------|
| `all()`       | ✓        | ✓ default: `Model.find()`     | ✓         |                      | ✓       |
| `one()`       | ✓        | ✓ default: `Model.findById()` | ✓         |                      | ✓       |
| `create()`    | ✓        | ✓ default: `new Model()`      | ✓         | `entity.save()`      | ✓       |
| `update()`    | ✓        | ✓ default: `Model.findById()` | ✓         | `entity.save()`      | ✓       |
| `remove()`    | ✓        | ✓ default: `Model.findById()` | ✓         | `Model.deleteOne()`  |         |
| `removeAll()` | ✓        | ✓ default: `Model.find()`     | ✓         | `Model.deleteMany()` |         |
