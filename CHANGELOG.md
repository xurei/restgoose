## 1.1.5 - 2019-10-03
- `Restgoose.onError()`: changed API so it can return a `RestError` and be async. You can easily migrate by adding `async`
  to your handler implementation and return null at the end. 
- `@rest`: Add `onError()` in the decorator. It has precedence over `Restgoose.onError()`: if it is set and returns something but `null`,
  `Restgoose.onError()` won't be called. 

## 1.1.4 - 2019-08-23
Allow one() to use a filter (`GET ?q=...`), the same way all() does.

## 1.1.3 - 2019-08-23
Broken, use 1.1.4

## 1.1.2 - 2019-08-16
Add `onError()` global handler. 

This will be trigerred if an unknown error is thrown, i.e. not a `RestError`, nor a `ValidationError`. 
Basically when the server would return 500 by default.

## 1.1.1 - 2019-08-14
Add support for access to the previous value in `preSend` and `save` middlewares (when available).

## 1.1.0 - 2019-07-26
**BREAKING CHANGE** 
Unified middlewares `preFetch`, `postFetch`, `preSave`, `preSend`, `persist`. 
Now, all middlewares can be written as `function <T extends RestgooseModel>(req: Request, entity: T): Promise<T>`.

`preFetch` middlewares should now return `null` instead of `true`.

## 1.0.1 - 2019-07-01
This version only updates development tools. No need to update.
- Updated dependencies : codecov, mocha & tslint.

## 1.0.0 - 2019-05-14
**BREAKING CHANGE** restgoose does not use typegoose anymore. A subset of it has been ported inside restgoose for
better stability.

Changes:
- Removed typegoose
- Aligned create() on update(), so a fetchOrCreate pattern is easier with create()
- parseQuery now converts `${oid: 'xxxx'}` to `ObjectId('xxxx')` instead of `{$in: [ ObjectId('xxxx'), 'xxxx' ]}`

Features: 
- Add support for submodel one()

## 0.1.0 - 2019-02-22
Features:
- **BREAKING CHANGE** getModel(): reordered method arguments and allow using the default mongoose connection.

## 0.0.15 - 2019-01-31
Features: 
- Added a `restgoose` field in `req` for typical use cases (projection, pagination...)
- Automatic parsing of the query string `q`

## 0.0.14 - 2019-01-30
Bugfixes:
- createWithin - Ensure that the containing field is defined before pushing in it 

## 0.0.13 - 2019-01-30
Bugfixes:
- Fixed embedded submodels with a `ref` field wrongly considered as referenced. 

## 0.0.12 - 2019-01-30
Features:
- Support for embedded submodels along with referenced ones
- Restgoose.initialize() - added argument to initialize a subset of models

## 0.0.11 - 2019-01-25
Features: 
- Updates dependencies
- fetch: 
  - add `modelType` in function signature
- add `Restgoose.sendOne()`

Bugfixes:
- Fixed error handling on CastError

## 0.0.10 - 2019-01-15
Features: 
- Support for multiple database through the `getConnection` hook
- Add schemaOptions in the `@rest` decorator
- Allow non `@rest` models to use getModel()
- getModel()
  - Add newModel.init()
  - Add newModel.ensureIndexes() 
- Updated minimal dependencies : typegoose ^5.4.0
- preSave: 
  - changed function signature : inverted prev and current
  - add `oldEntity` in function signature

Bugfixes:
- Fixed error when no `methods` are defined in @rest
- Add `postFetch` in `create()` endpoint

