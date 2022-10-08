import { GraphQLString, GraphQLNonNull, GraphQLInt, GraphQLError } from 'graphql'
import { PrismaClient } from '@prisma/client'
import { DepartmentType } from '../types/department.type'

const prisma = new PrismaClient()

export const createDepartmentMutation = {
  type: DepartmentType,
  args: {
    name: { type: new GraphQLNonNull(GraphQLString) },
    managerId: { type: new GraphQLNonNull(GraphQLInt) },
    description: { type: GraphQLString }
  },
  async resolve (_parent: any, args: any) {
    return await prisma.department.create({ data: args })
      .then((user) => {
        if (!args.name) throw new Error('name is not passed')
        return JSON.parse(JSON.stringify(user, (_, v) => typeof v === 'bigint' ? Number(v) : v))
      })
      .catch((err) => {
        return new GraphQLError((err.message.split('description:')[1]))
      })
  }
}
