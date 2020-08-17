import { Application } from 'express'
import { Resource } from '../../../dist'

export default (app: Application) => {
  return <Resource>{
    get: {
      handler: (request, reply) => {
        reply.send('i am ignored')
      },
    },
  }
}
