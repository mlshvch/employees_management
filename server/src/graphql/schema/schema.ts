import { GraphQLObjectType, GraphQLString } from 'graphql'

const rootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    helloWorld: {
      type: GraphQLString,
      args: {

      },
      resolve (parent, args) {
        return 'Hello, World!'
      }
    }
  }
})

module.exports = ({
  query: rootQuery
})
