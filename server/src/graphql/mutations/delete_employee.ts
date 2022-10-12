import { EmployeeType } from '../types/employee.type'
import { GraphQLNonNull, GraphQLError } from 'graphql'
import { GraphQLBigInt } from '../types/scalar/bigint.type'
import { Employee } from '@prisma/client'
import { parseJSONBigIntToNumber } from '../../../helpers/parse_bigint'
import { prisma } from '../../../db'
export const deleteEmployeeMutation = {
  type: EmployeeType,
  args: {
    id: { type: new GraphQLNonNull(GraphQLBigInt) }
  },
  async resolve (_parent: any, args: { id: bigint | number }): Promise<object | GraphQLError> {
    return await prisma.employee.delete({ where: { id: args.id } })
      .then((employee: Employee) => parseJSONBigIntToNumber(employee))
      .catch((err: Error) => new GraphQLError(err.message))
  }
}
