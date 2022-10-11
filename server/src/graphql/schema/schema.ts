import { GraphQLObjectType, GraphQLString } from 'graphql'
import { signOutMutation } from '../mutations/sign_out'
import { departmentsQuery } from '../queries/departments'
import { createDepartmentMutation } from '../mutations/create_department'
import { updateDepartmentMutation } from '../mutations/update_department'
import { deleteDepartmentMutation } from '../mutations/delete_department'
import { positionQuery } from '../queries/positions'
import { createPositionMutation } from '../mutations/create_position'
import { updatePositionMutation } from '../mutations/update_position'
import { deletePositionMutation } from '../mutations/delete_position'
import { employeeQuery } from '../queries/employees'
import { createEmployeeMutation } from '../mutations/create_employee'
import { updateEmployeeMutation } from '../mutations/update_employee'

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
    department: departmentsQuery,
    position: positionQuery,
    employee: employeeQuery
  }
})

const mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    signOut: signOutMutation,
    createDepartment: createDepartmentMutation,
    updateDepartment: updateDepartmentMutation,
    deleteDepartment: deleteDepartmentMutation,
    createPosition: createPositionMutation,
    updatePosition: updatePositionMutation,
    deletePosition: deletePositionMutation,
    createEmployee: createEmployeeMutation,
    updateEmployee: updateEmployeeMutation
  }
})

module.exports = ({
  query: rootQuery,
  mutation
})
