import { GraphQLObjectType, GraphQLString } from 'graphql'
import { signUpMutation } from './mutations/sign_up'

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
    signUp: signUpMutation
  }
})

module.exports = ({
  query: rootQuery,
  mutation
})
