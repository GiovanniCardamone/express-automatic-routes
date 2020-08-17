import { Application } from 'express'
import { Resource } from '../../../../../dist'

interface Params {
  userId: string
}

export default (app: Application) => {
  return <Resource>{
    get: {
      handler: <Params>(request, response) => {
        response.send(`hello user ${request.params.userId}`)
      },
    },
  }
}
