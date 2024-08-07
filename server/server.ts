import { createServer } from "http"
import express, { NextFunction, Request, Response } from 'express'
import bodyParser from 'body-parser'
import pino from 'pino'
import expressPinoLogger from 'express-pino-logger'
import { Collection, Db, MongoClient } from 'mongodb'
import session from 'express-session'
import MongoStore from 'connect-mongo'
import { Issuer, Strategy, generators } from 'openid-client'
import passport from 'passport'
import { Strategy as CustomStrategy } from "passport-custom"
import { gitlab } from "./secrets"
import gql from "graphql-tag";
import { ApolloServer } from '@apollo/server';
import { buildSubgraphSchema } from '@apollo/subgraph';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import resolvers from "./resolvers";
import { readFileSync } from "fs";
import cors from "cors"


// set up Mongo
const mongoUrl = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017'
console.log(mongoUrl)
const client = new MongoClient(mongoUrl)
let db: Db
let gameStates: Collection
let waitingRooms: Collection

// set up Express
const app = express()
const httpServer = createServer(app)
const port = parseInt(process.env.PORT) || 8228
const uiPort = parseInt(process.env.UI_PORT) || 8221
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// set up Apollo
const typeDefs = gql(
  readFileSync("schema.graphql", {
    encoding: "utf-8",
  })
);

const schema = makeExecutableSchema({ typeDefs, resolvers });

// create WS socker
const wsServer = new WebSocketServer({ 
  server: httpServer,
  path: "/subscriptions",
});
const serverCleanup = useServer({ schema }, wsServer)

const server = new ApolloServer({
  schema,
  plugins: [
    ApolloServerPluginDrainHttpServer({ httpServer }),

    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose()
          }
        }
      }
    }
  ],
});
// Note you must call `start()` on the `ApolloServer`
// instance before passing the instance to `expressMiddleware`
async function startApolloServer() {
  await server.start();
}

const DISABLE_SECURITY = process.env.DISABLE_SECURITY
console.log("DISABLE_SECURITY", DISABLE_SECURITY)

const passportStrategies = [
  ...(DISABLE_SECURITY ? ["disable-security"] : []),
  "oidc",
]


// set up Pino logging
const logger = pino({
  transport: {
    target: 'pino-pretty'
  }
})
app.use(expressPinoLogger({ logger }))

// set up CORS
// app.use(cors({
//   origin: true,
//   credentials: true,
// }))

// ["http://localhost:" + uiPort, "http://127.0.0.1:" + uiPort]

// set up session
const sessionMiddleware = session({
  secret: 'a just so-so secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false },

  store: MongoStore.create({
    mongoUrl: mongoUrl,
    ttl: 14 * 24 * 60 * 60 // 14 days
  })
})
app.use(sessionMiddleware)
declare module 'express-session' {
  export interface SessionData {
    credits?: number
  }
}

app.use(passport.initialize())
app.use(passport.session())
passport.serializeUser((user, done) => {
  console.log("serializeUser", user)
  done(null, user)
})
passport.deserializeUser((user, done) => {
  console.log("deserializeUser", user)
  done(null, user)
})

// const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
//   console.log("request", req, req.isAuthenticated())
//   if (req.isAuthenticated()) {
//     return next();
//   }
//   res.status(401).json({ message: 'Unauthorized' });
// };


// app routes
startApolloServer().then(() => {
  app.use(
    '/graphql',
    cors(),
    express.json(),
    expressMiddleware(server),
  );

  
  // sample empty route
  // app.use('/', (req, res) => {
  //   res.send('Hello World!')
  // })

  app.post(
    "/api/logout", 
    (req, res, next) => {
      req.logout((err) => {
        if (err) {
          return next(err)
        }
        res.redirect("/")
      })
    }
  )
  
  app.get("/api/user", (req, res) => {
    res.json(req.user || {})
  })
})


// connect to Mongo
client.connect().then(() => {
  logger.info('connected successfully to MongoDB')
  db = client.db("test")
  gameStates = db.collection('game-states')
  waitingRooms = db.collection('waiting-rooms')

  Issuer.discover("https://coursework.cs.duke.edu/").then(issuer => {
    const client = new issuer.Client(gitlab)
  
    const params = {
      scope: 'openid profile email',
      nonce: generators.nonce(),
      redirect_uri: `http://127.0.0.1:${uiPort}/api/login-callback`, //Do I pick a different port?
      state: generators.state(),
    }
  
    function verify(tokenSet: any, userInfo: any, done: (error: any, user: any) => void) {
      console.log('userInfo', userInfo)
      console.log('tokenSet', tokenSet)
      return done(null, userInfo)
    }
  
    passport.use('oidc', new Strategy({ client, params }, verify))
    passport.use("disable-security", new CustomStrategy((req, done) => {
      if (req.query.key !== DISABLE_SECURITY) {
        console.log("you must supply ?key=" + DISABLE_SECURITY + " to log in via DISABLE_SECURITY")
        done(null, false)
      } else {
        done(null, { preferred_username: req.query.user, roles: [].concat(req.query.role) })
      }
    }))
    // app.get(
    //   "/api/login", 
    //   passport.authenticate("oidc", { failureRedirect: "/api/login" }), 
    //   (req, res) => res.redirect("/")
    // )
    app.get('/api/login', passport.authenticate(passportStrategies, {
      successReturnToOrRedirect: "/new-game"
    }))
    
    
    // app.get(
    //   "/login-callback",
    //   passport.authenticate("oidc", {
    //     successRedirect: "/game",
    //     failureRedirect: "/api/login",
    //   })
    // )    
    app.get('/api/login-callback', passport.authenticate(passportStrategies, {
      successReturnToOrRedirect: '/new-game',
      failureRedirect: '/',
    }))
    

    // start server
    // server.listen(port)
    httpServer.listen(port, () => {
      console.log(`Server is running on port: ${port}`)
    })
    // logger.info(`Game server listening on port ${port}`)
    
  })
})

export { gameStates, waitingRooms }