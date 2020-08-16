# express-automatic-routes

express-automatic-routes is an innovative way to declare routes in your express app.

Just specify a directory for routes and express-automatic-routes will care of import any routes in a same way is defined in your filesystem structures.

## Getting started

### Install

Install with npm:

```sh
npm i express-automatic-routes --save
```

Install with yarn:

```sh
yarn add express-automatic-routes
```

### Initialize plugin

create a root directory for your autoroutes and pass it to plugin

```javascript
const express = require('express')
const autoload = require('express-automatic-routes')

const app = express()

autoload(app, { dir: './routes' }) // routes is my directory in this example
```

### Write your first route

Javascript:

```javascript
//file: ./routes/index.js
//url: http://your-host

export default (expressApp) => ({
  get: (request, response) => {
      response.send('Hello index')
    }
})

```

Typescript:

```typescript
//file: ./routes/index.js
//url: http://your-host

import { Application, Request, Response } from 'express'

export default (expressApp: Express.Application) => ({
  get: (request: Request, response: Response) => {
    response.send('Hello, Index!')
  },
})
```

Directory tree of your file system will look like this:

```text
/
├── index.js
├── package.json
└── routes
    └── index.js
```

## Nested autoroutes

Autoroutes directory scenario:

```text
/
├── index.js
├── package.json
└── routes
    └── hello         => http://your-host/hello
        └── world.js  => http://your-host/hello/world
```

in this case, the plugin will recursivley scan any routes in directory and map it urls

> :warning: those two directory structure are **NOT** equivalent:
>
> ```text
> /                                    | /
> ├── index.js                         | ├── index.js
> ├── package.json                     | ├── package.json
> └── routes                           | └── routes
>     └── hello                        |     └── hello
>         └── world.js                 |         └── world
>                                      |             └── index.js
>                                      |
> mapped to url:                       | mapped to url:
> http://your-host/hello/world         | http://your-host/hello/world/
> ```

## Ignore routes

to ignore routes there are few way:

- prepend '.' character to your file/directory name
- prepend '_' characher to your file/directory name

> :information_source: files `*.test.js` and `*.test.ts` are automatically ignored

examples:

```text
routes
├── .ignored-directory
├── _ignored-directory
├── .ignored-js-file.js
├── _ignored-js-file.js
├── .ignored-ts-file.ts
├── _ignored-ts-file.ts
├── ignored-js-test.test.js
└── ignored-ts-test.test.ts
```

## Url parameters in autoroutes

parameters in URL can be specified using `liquid-variable-syntax` or (Not on windows) prepending `:` to the name of file or directory

examples:

using liquid variable syntax

```text
.
├── index.js
├── package.json
└── routes
    └── users
        ├── {userId}
        │   └── posts.js  => http://your-host/users/<user-id>/posts
        └── {userId}.js   => http://your-host/users/<user-id>
```

using `:` syntax (Not on windows)

```text
.
├── index.js
├── package.json
└── routes
    └── users
        ├── :userId
        │   └── posts.js  => http://your-host/users/<user-id>/posts
        └── :userId.js   => http://your-host/users/<user-id>
```

### Retrieve parameters

Parameters will be injected in route just like normal url matching syntax:

```javascript
//file: ./routes/{userId}/posts.js

export default (expressApp) => ({
  get: (request, response) => {
      response.send(`returning posts of user: ${request.params.userId}`)
  }
})
```

## Module definition

each file must export a function that accept express as parameter, and return an object with the following properties:

```javascript
export default (expressApp) => ({
  middleware: [ /* your middlewares */ ]
  delete: { /* your handler logic */},
  get: { /* your handler logic */  },
  head: { /* your handler logic */  },
  patch: { /* your handler logic */  },
  post: { /* your handler logic */  },
  put: { /* your handler logic */  },
  options: { /* your handler logic */  },
})
```

## Middleware module definition

the `middleware` parameter can be one of the following:

- `undefined` _(just omit it)_
- `Middleware function` _(a function complain to [express middleware](https://expressjs.com/en/guide/using-middleware.html) definition)_
- `An Array of Middleware functions`

example:

> simple middleware

```javascript
export default (expressApp) => ({
  middleware: (req, res, next) => next()
  /* ... */
})
```

> array of middleware

```javascript
// simple middleware
const m1 = (req, res, next) => next()
const m2 = (req, res, next) => next()

export default (expressApp) => ({
  middleware: [m1, m2]
  /* ... */
})
```

### Route definition

A route can be a function (likes middleware but without `next` parameter) or an object who has the following properties:

- middleware // same as module middleware
- handler // the handler of the function

examples:

> simple route method

```javascript
export default (expressApp) => ({
  get: (req, res) => res.send('Hello There!')
})
```

> route method with middleware(s)

```javascript
export default (expressApp) => ({
  get: {
    middleware: (req, res, next) => next()
    handler: (req, res) => res.send('Hello There!')
  }
})
```

## Example using Javascript version es3

```javascript
module.exports = function (expressApp) {
  return {
    get: {
      handler: function (request, reply) {
        reply.send('this is get method')
      },
    },
  }
}
```

## Typescript support for modules

is useful to have typescript for strict type check of the module.
use definition `Resource` for type check your route

```typescript
import { Application, Request, Response, NextFunction } from 'express'
import { Resource } from 'express-automatic-routes'

const myMiddleware = (request: Request, response: Response, next: NextFunction) {
  // some beautiful code

  next()
}

export default (express: Application) => {
  return <Resource> {
    middleware: [myMiddleware]
    post: {
      middleware: (request: Request, response: Response, next: NextFunction) => {
        if (true === true) {
          next()
        } else {
          response.status(500).end('sorry server have temporany problem with boolean logic!')
        }
      },
      handler: (request: Request, reply: Response) => {
        return 'Hello, World!'
      },
    },
  }
}
```

## Contribute

That's all, i hope you like my little module and contribution of any kind are welcome!

I will mention you in my README for any of yours contribution

Consider to leave a :star: if you like the project :blush:
