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

