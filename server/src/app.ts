import express, { Express, Request, Response } from 'express'
import { buildSchema } from 'graphql'
import { graphqlHTTP } from 'express-graphql';
const schema = require('./graphql/schema')
require('dotenv').config()
const app: Express = express()
const port = process.env.PORT

app.use('/graphql', graphqlHTTP({
  schema: schema,
  graphiql: process.env.NODE_ENV === 'development'
}))

module.exports = app.listen(port, () => console.log(`Example app listening on port ${port}!`))
