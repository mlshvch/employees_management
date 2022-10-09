import { GraphQLString, GraphQLNonNull, GraphQLError } from 'graphql'
import { DepartmentType } from '../types/department.type'
import { GraphQLBigInt } from '../types/scalar/bigint.type'
import { PrismaClient } from '@prisma/client'

export const updateDepartmentMutation = {
  type: DepartmentType,
  args: {
    id: { type: new GraphQLNonNull(GraphQLBigInt) },
    name: { type: GraphQLString },
    managerId: { type: GraphQLBigInt },
    description: { type: GraphQLString }
  },
  async resolve (_parent: any, args: { id?: number, name?: string, description?: string, managerId?: number }) {
    if (typeof (args.name) === 'string' && !args.name) throw new Error('name can not be empty')
    const prisma = new PrismaClient()
    const departmentId = args.id
    delete args.id
    return await prisma.department.update({
      where: {
        id: departmentId
      },
      data: args
    })
      .then((value) => {
        return JSON.parse(JSON.stringify(value, (_, v) => typeof v === 'bigint' ? Number(v) : v))
      })
      .catch((err) => {
        return new GraphQLError((err.message.split('description:')[1]))
      })
  }
}
