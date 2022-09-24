import { GraphQLSchema, GraphQLObjectType, GraphQLString } from 'graphql';

const rootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    helloWorld: {
      type: GraphQLString,
      args: {},
      resolve(parent, args) {
        return "Hello, World!"
      }
    }
  }
})

const mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {}
})

module.exports = new GraphQLSchema({
  query: rootQuery,
  // mutation: mutation
})
