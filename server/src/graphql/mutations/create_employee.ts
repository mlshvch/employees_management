import { EmployeeType as GraphQLEmployeeType } from '../types/employee.type'
import { Employee } from '@prisma/client'
import { parseJSONBigIntToNumber } from '../../../helpers/parse_bigint'
import { GraphQLBoolean, GraphQLNonNull, GraphQLString, GraphQLError } from 'graphql'
import { GraphQLBigInt } from '../types/scalar/bigint.type'
import { prisma } from '../../../db'

export const createEmployeeMutation = {
  type: GraphQLEmployeeType,
  args: {
    userId: { type: new GraphQLNonNull(GraphQLBigInt) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    surname: { type: new GraphQLNonNull(GraphQLString) },
    positionId: { type: new GraphQLNonNull(GraphQLBigInt) },
    staffMember: { type: GraphQLBoolean },
    departmentId: { type: new GraphQLNonNull(GraphQLBigInt) }
  },
  async resolve (_parent: any, args: Employee): Promise<object | GraphQLError> {
    return await prisma.employee.create({ data: args })
      .then((employee) => parseJSONBigIntToNumber(employee))
      .catch((err: Error) => {
        const message = err.message.split('\n')
        return new GraphQLError(message[message.length - 1])
      })
  }
}
