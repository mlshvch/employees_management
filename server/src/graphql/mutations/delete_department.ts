import { GraphQLNonNull, GraphQLError } from 'graphql'
import { GraphQLBigInt } from '../types/scalar/bigint.type'
import { PrismaClient, Department } from '@prisma/client'
import { DepartmentType } from '../types/department.type'
export const deleteDepartmentMutation = {
  type: DepartmentType,
  args: {
    id: { type: new GraphQLNonNull(GraphQLBigInt) }
  },
  async resolve (_parent: any, args: { id: bigint | number }): Promise<Department | GraphQLError> {
    const prisma = new PrismaClient()
    if ((await prisma.department.findFirst({ where: { id: args.id } })) == null) return new GraphQLError("department with this id doesn't exist")

    return await prisma.department.delete({ where: { id: args.id } })
      .then((result) => { return JSON.parse(JSON.stringify(result, (_, v) => typeof v === 'bigint' ? Number(v) : v)) })
      .catch((err) => {
        return new GraphQLError(err.message)
      })
  }
}
