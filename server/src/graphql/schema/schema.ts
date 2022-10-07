import { GraphQLObjectType, GraphQLString } from 'graphql'
import { signOutMutation } from '../mutations/sign_out'

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

const mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    signOut: signOutMutation
  }
})

module.exports = ({
  query: rootQuery,
  mutation
})
