import express, { Express } from 'express'
import { graphqlHTTP } from 'express-graphql'
import schemaParams = require('./graphql/schema/schema')
import authSchemaParams = require('./graphql/schema/auth.schema')
import { GraphQLSchema } from 'graphql'
import dotenv = require('dotenv')
dotenv.config()

const app: Express = express()
const port = process.env.PORT ?? 4000
const schema: GraphQLSchema = new GraphQLSchema(schemaParams)
const authSchema: GraphQLSchema = new GraphQLSchema(authSchemaParams)
/* eslint-disable @typescript-eslint/no-misused-promises */

app.use('/graphql/auth',
  graphqlHTTP({
    schema: authSchema,
    graphiql: process.env.NODE_ENV === 'development'
  })
)

app.use('/graphql',
  graphqlHTTP({
    schema: schema,
    graphiql: process.env.NODE_ENV === 'development'

  }))

module.exports = app.listen(port)
