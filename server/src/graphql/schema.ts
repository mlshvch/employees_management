import { GraphQLObjectType, GraphQLString } from 'graphql'

const rootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    helloWorld: {
      type: GraphQLString,
      args: {},
      resolve (parent, args) {
        return 'Hello, World!'
      }
    }
  }
})

// commented because of mutations absence
// const mutation = new GraphQLObjectType({
//   name: 'Mutation',
//   fields: {}
// })

module.exports = ({
  query: rootQuery
  // mutation: mutation
})
