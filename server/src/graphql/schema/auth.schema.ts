import { GraphQLObjectType, GraphQLString } from 'graphql'
import { signUpMutation } from '../mutations/sign_up'
import { signInMutation } from '../mutations/sign_in'

const mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    signUp: signUpMutation,
    signIn: signInMutation
  }
})

const rootQuery = new GraphQLObjectType({
  name: 'RootQuery',
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
  query: rootQuery,
  mutation: mutation
})
