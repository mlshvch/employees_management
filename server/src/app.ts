import express, { Express, Request, Response } from 'express'
import passport from 'passport'
import jwt from 'jsonwebtoken'
import { Strategy as BearerStrategy } from 'passport-http-bearer'
import { graphqlHTTP } from 'express-graphql'
import schemaParams = require('./graphql/schema/schema')
import authSchemaParams = require('./graphql/schema/auth.schema')
import { GraphQLSchema } from 'graphql'
import { prisma } from '../db'
import dotenv = require('dotenv')
import { logger } from './logger'

dotenv.config()

const app: Express = express()
const port = process.env.NODE_ENV === 'test' ? 0 : (process.env.PORT ?? 4000)
const schema: GraphQLSchema = new GraphQLSchema(schemaParams)
const authSchema: GraphQLSchema = new GraphQLSchema(authSchemaParams)
app.use(passport.initialize())
/* eslint-disable @typescript-eslint/no-misused-promises */

const bearer = new BearerStrategy(async (token: string, done) => {
  const secretToken = process.env.TOKEN_SECRET ?? ''
  if (!secretToken) throw new Error('token is not defined')

  if (jwt.verify(token, secretToken)) {
    const data = jwt.decode(token, { json: true })
    if (data?.exp) {
      try {
        if (data.exp < Date.now()) throw new Error('token is expired')
      } catch (err) {
        console.log(err)
        return done(null, false)
      }

      await prisma.user.findFirstOrThrow({
        where: {
          uid: data.uid
        }
      })
        .then((user) => {
          const tokenId = token.split('.')[2]
          const userTokens = Object(user.tokens)[tokenId]
          if (userTokens && (user.password === userTokens.password)) {
            return done(null, user)
          } else {
            throw new Error('token is invalid')
          }
        })
        .catch((err) => {
          console.log(err)
          done(null, false)
        })
    }
  }
})

app.use(express.json())

// Error Handler and logger
app.use((err: Error, req: Request, res: Response, _next: Function) => {
  if (err) {
    logger.error(err.message)
    return res.status(500).json({ message: 'Internal server error' })
  }
})

// Logger for requests
app.use((req: Request, _res: Response, next: Function) => {
  logger.info(req)
  next()
})

app.use('/graphql/auth',
  graphqlHTTP({
    schema: authSchema,
    graphiql: process.env.NODE_ENV === 'development'
  })
)

app.use('/graphql',
  passport.authenticate(bearer, { session: false }),
  graphqlHTTP({
    schema,
    graphiql: process.env.NODE_ENV === 'development'

  }))

module.exports = app.listen(port)
