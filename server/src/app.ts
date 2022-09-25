import express, { Express } from 'express'
import { graphqlHTTP } from 'express-graphql'
import schemaParams = require('./graphql/schema')
import { GraphQLSchema } from 'graphql'
import dotenv = require('dotenv')
dotenv.config()

const app: Express = express()
const port = process.env.PORT ?? 4000
const schema: GraphQLSchema = new GraphQLSchema(schemaParams)

/* eslint-disable @typescript-eslint/no-misused-promises */
app.use('/graphql', graphqlHTTP(
  {
    schema,
    graphiql: process.env.NODE_ENV === 'development'
  })
)
app.listen(port)

module.exports = app
