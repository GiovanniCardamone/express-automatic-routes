const tap = require('tap')
const path = require('path')

const express = require('express')
const autoroutes = require('../dist').default
const request = require('supertest')

const exampleGetRoute = `module.exports = function (server) {
  return {
    get: {
      handler: function (request, reply) {
        reply.end('get')
      }
    }
  }
}
`

const exampleGetRouteUrlParam = `module.exports = function (server) {
  return {
    get: {
      handler: function (request, reply) {
        reply.end(request.params.PARAM)
      }
    }
  }
}
`

const exampleGetRouteJSONParam = `module.exports = function (server) {
  return {
    get: {
      handler: function (request, reply) {
        reply.end(JSON.stringify(request.params))
      }
    }
  }
}
`

const exampleGetRouteDefaultModule = `
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function () {
  return {
    get: {
      handler: function (request, reply) {
        reply.end('get')
      }
    }
  };
};
`

tap.test('simple index', { saveFixture: false }, (t) => {
  const server = express()

  const dir = t.testdir({
    'index.js': exampleGetRoute,
  })

  // server.use(express.raw())

  autoroutes(server, {
    dir: dir,
    log: false,
  })

  request(server)
    .get('/')
    .expect(200)
    .end(function (err, res) {
      t.is(err, null)
      t.is(res.text, 'get')
      t.end()
    })
})

tap.test('nested routes', { saveFixture: false }, (t) => {
  const server = express()

  const dir = t.testdir({
    users: {
      'foo.js': exampleGetRoute,
    },
  })

  autoroutes(server, {
    dir: dir,
    log: false,
  })

  request(server)
    .get('/users/foo')
    .expect(200)
    .end(function (err, res) {
      t.is(err, null)
      t.is(res.text, 'get')
      t.end()
    })
})

tap.test('nested routes with trailing slashes', { saveFixture: false }, (t) => {
  const server = express()

  const dir = t.testdir({
    users: {
      foo: {
        'index.js': exampleGetRoute,
      },
    },
  })

  autoroutes(server, {
    dir: dir,
    log: false,
  })

  request(server)
    .get('/users/foo/')
    .expect(200)
    .end(function (err, res) {
      t.is(err, null)
      t.is(res.text, 'get')
      t.end()
    })
})

tap.test('nested routes with url parameter', { saveFixture: false }, (t) => {
  const server = express()

  const dir = t.testdir({
    users: {
      '{PARAM}.js': exampleGetRouteUrlParam,
    },
  })

  autoroutes(server, {
    dir: dir,
  })

  const userId = 'foo'

  request(server)
    .get(`/users/${userId}`)
    .expect(200)
    .end(function (err, res) {
      t.is(err, null)
      t.is(res.text, userId)
      t.end()
    })
})

tap.test(
  'url parameters with : (not on windows)',
  { saveFixture: false },
  (t) => {
    if (process.platform === 'win32') {
      t.end()
    } else {
      const server = express()

      const dir = t.testdir({
        users: {
          '{USERID}.js': exampleGetRouteJSONParam,
          '{USERID}': {
            'index.js': exampleGetRouteJSONParam,
          },
        },
      })

      autoroutes(server, {
        dir: dir,
      })

      const USERID = 'foo'

      request(server)
        .get(`/users/${USERID}`)
        .expect(200)
        .end(function (err, res) {
          t.is(err, null)
          t.is(JSON.parse(res.text).USERID, USERID)

          request(server)
            .get(`/users/${USERID}/`)
            .expect(200)
            .end(function (err, res) {
              t.is(err, null)
              t.is(JSON.parse(res.text).USERID, USERID)
              t.end()
            })
        })
    }
  }
)

tap.test(
  'nested routes with url parameter with trailing slashes',
  { saveFixture: false },
  (t) => {
    const server = express()

    const dir = t.testdir({
      users: {
        '{PARAM}': {
          'index.js': exampleGetRouteUrlParam,
        },
      },
    })

    autoroutes(server, {
      dir: dir,
    })

    const userId = 'foo'

    request(server)
      .get(`/users/${userId}/`)
      .expect(200)
      .end(function (err, res) {
        t.is(err, null)
        t.is(res.text, userId)
        t.end()
      })
  }
)

tap.test('example es6 exports default module', { saveFixture: false }, (t) => {
  const server = express()

  const dir = t.testdir({
    'index.js': exampleGetRouteDefaultModule,
  })

  autoroutes(server, {
    dir: dir,
  })

  request(server)
    .get(`/`)
    .expect(200)
    .end(function (err, res) {
      t.is(err, null)
      t.is(res.text, 'get')
      t.end()
    })
})

tap.test(
  'skip routes with starting . charater',
  { saveFixture: false },
  (t) => {
    const server = express()

    const dir = t.testdir({
      '.hello.js': exampleGetRouteDefaultModule,
    })

    autoroutes(server, {
      dir: dir,
    })

    request(server)
      .get(`/`)
      .expect(200)
      .end(function (err, res) {
        t.is(res.statusCode, 404)
        t.end()
      })
  }
)

tap.test(
  'skip routes with starting _ charater',
  { saveFixture: false },
  (t) => {
    const server = express()

    const dir = t.testdir({
      '_hello.js': exampleGetRouteDefaultModule,
    })

    autoroutes(server, {
      dir: dir,
      log: true,
    })

    request(server)
      .get(`/hello`)
      .expect(200)
      .end(function (err, res) {
        t.is(res.statusCode, 404)

        request(server)
          .get(`/_hello`)
          .expect(200)
          .end(function (err, res) {
            t.is(res.statusCode, 404)
            t.end()
          })
      })
  }
)

tap.test(
  'skip routes ending with .test.js or .test.ts',
  { saveFixture: false },
  (t) => {
    const server = express()

    const dir = t.testdir({
      'someJsRoute.test.js': exampleGetRouteDefaultModule,
      'someTsRoute.test.ts': exampleGetRouteDefaultModule,
    })

    autoroutes(server, {
      dir: dir,
      log: true,
    })

    request(server)
      .get(`/someJsRoute`)
      .expect(200)
      .end(function (err, res) {
        t.is(res.statusCode, 404)
        request(server)
          .get(`/someTsRoute`)
          .expect(200)
          .end(function (err, res) {
            t.is(res.statusCode, 404)
            t.end()
          })
      })
  }
)
