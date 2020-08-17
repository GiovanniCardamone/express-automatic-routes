import express from 'express'
import autoroutes from 'express-automatic-routes'

const app = express()

autoroutes(app, {
  dir: './routes',
})

app.listen(9999)
