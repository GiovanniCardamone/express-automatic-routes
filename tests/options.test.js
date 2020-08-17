const tap = require('tap')
const path = require('path')

const express = require('express')
const autoroutes = require('../dist').default
const request = require('supertest')

const errorLabel = autoroutes.errorLabel

tap.test('no dir parameters', (t) => {
  const server = express()

  t.throws(() => autoroutes(server, {}), Error)
  t.end()
})

tap.test('ivalid dir parameters', (t) => {
  const server = express()

  t.throws(() => autoroutes(server, { dir: 33 }), Error)
  t.end()
})

tap.test('dir does not exists', (t) => {
  const server = express()

  t.throws(
    () =>
      autoroutes(server, {
        dir: './this-directory-does-not-exists',
      }),
    Error
  )
  t.end()
})
