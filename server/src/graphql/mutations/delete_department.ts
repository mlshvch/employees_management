import { GraphQLNonNull, GraphQLError } from 'graphql'
import { GraphQLBigInt } from '../types/scalar/bigint.type'
import { prisma } from '../../../db'
import { DepartmentType } from '../types/department.type'
import { parseJSONBigIntToNumber } from '../../../helpers/parse_bigint'
export const deleteDepartmentMutation = {
  type: DepartmentType,
  args: {
    id: { type: new GraphQLNonNull(GraphQLBigInt) }
  },
  async resolve (_parent: any, args: { id: bigint | number }): Promise<object | GraphQLError> {
    if ((await prisma.department.findFirst({ where: { id: args.id } })) == null) return new GraphQLError("department with this id doesn't exist")

    return await prisma.department.delete({ where: { id: args.id } })
      .then((result) => parseJSONBigIntToNumber(result))
      .catch((err) => {
        return new GraphQLError(err.message)
      })
  }
}
