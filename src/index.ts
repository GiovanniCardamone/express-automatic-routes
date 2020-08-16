import { Application, Request, Response, NextFunction } from 'express'

import process from 'process'
import path from 'path'
import fs from 'fs'

export const errorLabel = '[ERROR] express-automatic-routes:'

export type ValidMethods =
  | 'DELETE'
  | 'GET'
  | 'HEAD'
  | 'PATCH'
  | 'POST'
  | 'PUT'
  | 'OPTIONS'

const validMethods = [
  'delete',
  'get',
  'head',
  'patch',
  'post',
  'put',
  'options',
]

interface Middleware {
  <T>(req: Request & T, res: Response, next: NextFunction): void
}

type Route = (request: Request, response: Response) => any

type MiddlewareRoute = {
  middleware: Middleware | Middleware[]
  handler: Route
}

export type RouteOptions = Route | MiddlewareRoute

export interface Resource {
  middleware?: Middleware | Middleware[]
  delete?: RouteOptions
  get?: RouteOptions
  head?: RouteOptions
  patch?: RouteOptions
  post?: RouteOptions
  put?: RouteOptions
  options?: RouteOptions
}

function scan(
  express: Application,
  baseDir: string,
  current: string,
  log: boolean = false
) {
  const combined = path.join(baseDir, current)
  const combinedStat = fs.statSync(combined)
  console.log('scanning', combined)
  if (combinedStat.isDirectory()) {
    for (const entry of fs.readdirSync(combined)) {
      scan(express, baseDir, path.join(current, entry), log)
    }
  } else if (isAcceptableFile(combined, combinedStat)) {
    autoload(express, combined, pathToUrl(current), log)
  }
}

function isAcceptableFile(file: string, stat: fs.Stats): boolean {
  return (
    !path.basename(file).startsWith('.') &&
    !path.basename(file).startsWith('_') &&
    !file.endsWith('.test.js') &&
    !file.endsWith('.test.ts') &&
    stat.isFile()
  )
}

function pathToUrl(filePath: string) {
  let url =
    '/' + filePath.replace('.ts', '').replace('.js', '').replace('index', '')

  if (url.length === 1) return url

  return url
    .split(path.sep)
    .map((part) => replaceParamsToken(part))
    .join('/')
}

function replaceParamsToken(token: string) {
  const regex = /{.+}/g

  let result
  while ((result = regex.exec(token)) !== null) {
    token =
      token.substring(0, result.index) +
      result[0].replace('{', ':').replace('}', '') +
      token.substr(result.index + result[0].length)
  }

  return token
}

function autoload(
  express: Application,
  fullPath: string,
  url: string,
  log: boolean
) {
  const module = loadModule(fullPath, log)

  if (typeof module !== 'function') {
    throw new Error(
      `${errorLabel} module ${fullPath} must be valid js/ts module and should export route methods definitions`
    )
  }

  const routes = module(express)

  let middleware: undefined | Middleware | Middleware[] = undefined
  if (routes.middleware) {
    middleware = routes.middleware
  }

  for (const [method, route] of Object.entries<RouteOptions>(routes)) {
    if (validMethods.includes(method)) {
      //@ts-ignore
      express[method](url, ...extract(middleware, route))

      if (log) {
        console.info(`${method.toUpperCase()} ${url} => ${fullPath}`)
      }
    }
  }
}

function loadModule(path: string, log: boolean) {
  const module = require(path)

  if (typeof module === 'function') {
    return module
  }

  if (typeof module === 'object' && 'default' in module) {
    return module.default
  }

  return
}

function extract(
  middleware: undefined | Middleware | Middleware[],
  routeOptions: RouteOptions
): Middleware[] {
  const routeMiddleware: Middleware[] =
    middleware === undefined
      ? []
      : Array.isArray(middleware)
      ? middleware
      : [middleware]

  if (typeof routeOptions === 'function') {
    return [...routeMiddleware, routeOptions]
  } else {
    routeOptions.middleware =
      routeOptions.middleware === undefined ? [] : routeOptions.middleware

    console.log(routeOptions)

    if (Array.isArray(routeOptions.middleware)) {
      return [
        ...routeMiddleware,
        ...routeOptions.middleware,
        routeOptions.handler,
      ]
    } else {
      return [...routeMiddleware, routeOptions.middleware, routeOptions.handler]
    }
  }
}

interface ExpressAutoroutesOptions {
  dir: string
  log?: boolean
}

export default function (
  express: Application,
  options: ExpressAutoroutesOptions
) {
  const log = options.log ?? true

  if (!express) {
    const message = `${errorLabel} express application must be passed`
    log && console.log(message)

    throw new Error(message)
  }

  if (!options.dir) {
    const message = `${errorLabel} dir must be specified`
    log && console.error(message)

    throw new Error(message)
  }

  if (typeof options.dir !== 'string') {
    const message = `${errorLabel} dir must be the path of autoroutes-directory`
    log && console.error(message)

    throw new Error(message)
  }

  let dirPath: string

  if (path.isAbsolute(options.dir)) {
    dirPath = options.dir
  } else if (path.isAbsolute(process.argv[1])) {
    dirPath = path.join(process.argv[1], '..', options.dir)
  } else {
    dirPath = path.join(process.cwd(), process.argv[1], '..', options.dir)
  }

  if (!fs.existsSync(dirPath)) {
    const message = `${errorLabel} dir ${dirPath} does not exists`
    log && console.error(message)

    throw new Error(message)
  }

  if (!fs.statSync(dirPath).isDirectory()) {
    const message = `${errorLabel} dir ${dirPath} must be a directory`
    log && console.error(message)

    throw new Error(message)
  }

  try {
    scan(express, dirPath, '', options.log)
  } catch (error) {
    log && console.error(error.message)

    throw error
  }
}
