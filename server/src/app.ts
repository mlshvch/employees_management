import express, { Express } from 'express'
import passport from 'passport'
import jwt from 'jsonwebtoken'
import { Strategy as BearerStrategy } from 'passport-http-bearer'
import { graphqlHTTP } from 'express-graphql'
import schemaParams = require('./graphql/schema/schema')
import authSchemaParams = require('./graphql/schema/auth.schema')
import { GraphQLSchema } from 'graphql'
import { PrismaClient } from '@prisma/client'
import dotenv = require('dotenv')
dotenv.config()

const app: Express = express()
const port = process.env.PORT ?? 4000
const schema: GraphQLSchema = new GraphQLSchema(schemaParams)
const authSchema: GraphQLSchema = new GraphQLSchema(authSchemaParams)
app.use(passport.initialize())
/* eslint-disable @typescript-eslint/no-misused-promises */

const bearer = new BearerStrategy(async (token: string, done) => {
  const secretToken = process.env.TOKEN_SECRET ?? ''
  if (!secretToken) throw new Error('token is not defined')

  const prisma = new PrismaClient()
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
