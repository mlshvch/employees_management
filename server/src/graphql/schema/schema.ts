import { GraphQLObjectType, GraphQLString } from 'graphql'
import { signOutMutation } from '../mutations/sign_out'
import { departmentsQuery } from '../queries/departments'

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
    },
    department: departmentsQuery
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
