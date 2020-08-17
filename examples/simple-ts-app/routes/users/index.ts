import { Application } from 'express'
import { Resource } from '../../../../dist'

export default (app: Application) => {
  return <Resource>{
    get: {
      handler: (request, response) => {
        response.send('hello users')
      },
    },
  }
}
