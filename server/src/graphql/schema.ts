import { GraphQLObjectType, GraphQLString } from 'graphql'
import { signUpMutation } from './mutations/sign_up'
import { signInMutation } from './mutations/sign_in'

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
    signUp: signUpMutation,
    signIn: signInMutation
  }
})

module.exports = ({
  query: rootQuery,
  mutation
})
