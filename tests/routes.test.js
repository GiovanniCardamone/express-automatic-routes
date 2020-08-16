const tap = require('tap')
const path = require('path')

const express = require('express')
const autoroutes = require('../dist').default
const request = require('supertest')
const { json } = require('express')

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
