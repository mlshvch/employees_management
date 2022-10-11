import { GraphQLBoolean, GraphQLString, GraphQLNonNull, GraphQLError } from 'graphql'
import { EmployeeType } from '../types/employee.type'
import { GraphQLBigInt } from '../types/scalar/bigint.type'
import { prisma } from '../../../db'
import { Employee } from '@prisma/client'
import { parseJSONBigIntToNumber } from '../../../helpers/parse_bigint'
export const updateEmployeeMutation = {
  type: EmployeeType,
  args: {
    id: { type: new GraphQLNonNull(GraphQLBigInt) },
    name: { type: (GraphQLString) },
    surname: { type: (GraphQLString) },
    positionId: { type: (GraphQLBigInt) },
    staffMember: { type: GraphQLBoolean },
    departmentId: { type: (GraphQLBigInt) }
  },
  async resolve (_parent: any, args: { id: bigint | number, name?: string, surname?: string, positionId?: number | bigint, staffMember?: boolean, departmentId?: bigint | number }): Promise<object | GraphQLError> {
    if (typeof (args?.name) !== 'undefined' && !args.name) return new GraphQLError('name can not be blank')
    if (typeof (args?.surname) !== 'undefined' && !args.surname) return new GraphQLError('surname can not be blank')

    return await prisma.employee.update({
      where: {
        id: args.id
      },
      data: {
        name: args?.name,
        surname: args?.surname,
        positionId: args?.positionId,
        staffMember: args?.staffMember,
        departmentId: args?.departmentId
      }
    })
      .then((employee: Employee) => parseJSONBigIntToNumber(employee))
      .catch((err: Error) => new GraphQLError(err.message))
  }
}
