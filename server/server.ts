import { createServer } from "http"
import express, { NextFunction, Request, Response } from 'express'
import bodyParser from 'body-parser'
import pino from 'pino'
import expressPinoLogger from 'express-pino-logger'
import { Collection, Db, MongoClient, ObjectId } from 'mongodb'
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
import resolvers from "./resolvers";
import { readFileSync } from "fs";
import cors from "cors"


// set up Mongo
const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017'
const client = new MongoClient(mongoUrl)
let db: Db
let gameStates: Collection
let users: Collection
let waitingRooms: Collection

// set up Express
const app = express()
// const server = createServer(app)
const port = parseInt(process.env.PORT) || 8228
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// set up Apollo
const typeDefs = gql(
  readFileSync("schema.graphql", {
    encoding: "utf-8",
  })
);

const server = new ApolloServer({
  schema: buildSubgraphSchema({ typeDefs, resolvers }),
});
// Note you must call `start()` on the `ApolloServer`
// instance before passing the instance to `expressMiddleware`
async function startApolloServer() {
  await server.start();
}


const DISABLE_SECURITY = process.env.DISABLE_SECURITY

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
//   origin: "http://localhost:" + port,
//   credentials: true,
// }))

// set up session
const sessionMiddleware = session({
  secret: 'a just so-so secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false },

  store: MongoStore.create({
    mongoUrl: 'mongodb://localhost:27017',
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


// app routes
startApolloServer().then(() => {
  app.use(
    '/graphql',
    cors(),
    express.json(),
    expressMiddleware(server),
  );
  
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
  users = db.collection('users')
  waitingRooms = db.collection('waiting-rooms')

  Issuer.discover("https://coursework.cs.duke.edu/").then(issuer => {
    const client = new issuer.Client(gitlab)
  
    const params = {
      scope: 'openid profile email',
      nonce: generators.nonce(),
      redirect_uri: 'http://localhost:8221/api/login-callback', //Do I pick a different port?
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
      successReturnToOrRedirect: "/"
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
    app.listen(port, () => {
      console.log(`Server is running on port: ${port}`)
    })
    // logger.info(`Game server listening on port ${port}`)
    
  })
})

export { gameStates, users, waitingRooms }