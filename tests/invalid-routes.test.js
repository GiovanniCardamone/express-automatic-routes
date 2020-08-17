const tap = require('tap')
const path = require('path')

const express = require('express')
const autoroutes = require('../dist').default
const request = require('supertest')

const exampleErrorModule = `
  thisSyntaxIsInvalid :(
`

const exampleInvalidModule = `
var whateverIdontCare = 3
`

const errorLabel = autoroutes.errorLabel

tap.test('invalid type routes directory', { saveFixture: false }, (t) => {
  const server = express()

  const invalidDir = t.testdir({
    dirAsFile: t.fixture('file', 'routes'),
  })

  t.throws(() =>
    autoroutes(server, {
      dir: path.join(invalidDir, 'dirAsFile'),
    })
  )
  t.end()
})

tap.test('empty routes module', { saveFixture: false }, (t) => {
  const server = express()

  const dir = t.testdir({
    'index.js': '', // empty
  })

  t.throws(
    () =>
      autoroutes(server, {
        dir: dir,
      }),
    Error
  )

  t.end()
})

tap.test('modules with error', { saveFixture: false }, (t) => {
  const server = express()

  const dir = t.testdir({
    'index.js': exampleErrorModule,
  })

  t.throws(
    () =>
      autoroutes(server, {
        dir: dir,
      }),
    Error
  )

  t.end()
})

tap.test('modules without valid routes', { saveFixture: false }, (t) => {
  const server = express()

  const dir = t.testdir({
    'index.js': exampleInvalidModule,
  })

  t.throws(
    () =>
      autoroutes(server, {
        dir: dir,
      }),
    Error
  )
  t.end()
})
