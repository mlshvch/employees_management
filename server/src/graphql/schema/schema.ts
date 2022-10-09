import { GraphQLObjectType, GraphQLString } from 'graphql'
import { signOutMutation } from '../mutations/sign_out'
import { departmentsQuery } from '../queries/departments'
import { createDepartmentMutation } from '../mutations/create_department'
import { updateDepartmentMutation } from '../mutations/update_department'

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
    signOut: signOutMutation,
    createDepartment: createDepartmentMutation,
    updateDepartment: updateDepartmentMutation
  }
})

module.exports = ({
  query: rootQuery,
  mutation
})
