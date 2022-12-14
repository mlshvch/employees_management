import { GraphQLBoolean, GraphQLString, GraphQLError, GraphQLList } from 'graphql'
import { EmployeeType } from '../types/employee.type'
import { GraphQLBigInt } from '../types/scalar/bigint.type'
import { prisma } from '../../../db'
import { Employee } from '@prisma/client'
import { parseJSONBigIntToNumber } from '../../../helpers/parse_bigint'
export const employeeQuery = {
  type: new GraphQLList(EmployeeType),
  args: {
    id: { type: GraphQLBigInt },
    userId: { type: GraphQLBigInt },
    name: { type: GraphQLString },
    surname: { type: GraphQLString },
    positionId: { type: GraphQLBigInt },
    staffMember: { type: GraphQLBoolean },
    departmentId: { type: GraphQLBigInt }
  },
  async resolve (_parent: any,
    args: { id?: number | bigint, userId?: number | bigint, name?: string, surname?: string, position?: bigint | number, staffMember?: boolean, departmentId?: bigint | number }): Promise<object | GraphQLError> {
    return await prisma.employee.findMany({
      where: {
        id: args.id,
        userId: args.userId,
        name: args.name,
        surname: args.surname,
        positionId: args.position,
        staffMember: args.staffMember,
        departmentId: args.departmentId
      }
    })
      .then((result: Employee[]) => result.map((employee: Employee) => parseJSONBigIntToNumber(employee)))
      .catch((err: Error) => new GraphQLError(err.message))
  }
}
