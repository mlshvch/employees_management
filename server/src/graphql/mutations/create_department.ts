import { GraphQLString, GraphQLNonNull, GraphQLInt, GraphQLError } from 'graphql'
import { prisma } from '../../../db'
import { DepartmentType } from '../types/department.type'
import { parseJSONBigIntToNumber } from '../../../helpers/parse_bigint'

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
        return parseJSONBigIntToNumber(user)
      })
      .catch((err) => {
        return new GraphQLError((err.message.split('description:')[1]))
      })
  }
}
