import express, { NextFunction, Response, Request } from 'express'
import path from 'path'
import bodyParser from 'body-parser'
import session from 'express-session'
import cookieParser from 'cookie-parser'

import configuration from './util/config'
import onfido from './routes/onfido'

const cookieSecret = configuration.appSecret
const app = express()

app.set('trust proxy', '1')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser(cookieSecret))

const memoryStore = new session.MemoryStore()
app.use(
  session({
    secret: cookieSecret,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: app.get('env') === 'development' ? false : true },
    store: memoryStore,
  }),
)

app.set('views', path.join(__dirname, '/views'))
app.set('view engine', 'pug')
app.use(express.static(path.join(__dirname, '/public')))

app.use('/redirect-rule', onfido)

app.use((req, res, next) => {
  next(new Error('Not Found'))
})

if (app.get('evn') === 'development') {
  app.use((err: Error, req: Request, res: Response) => {
    res.status(500).render('error', {
      message: err.message,
      error: err,
    })
  })
}

app.use((err: Error, req: Request, res: Response) => {
  res.status(500).render('error', {
    message: err.message,
  })
})

// Express requires the next function (or specific function signature) to include the 4 arguments: https://github.com/expressjs/generator/issues/78
// as such, we are telling eslint to ignore the no-unused-vars rule for the error handler middleware
//eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).render('error', {
    message: err.message,
  })
})

const listenOn = Number(configuration.port)
app.listen(listenOn, () => {
  console.log(`Listening on ${configuration.appURL}:${listenOn}`)
})
