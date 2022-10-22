import { GraphQLString, GraphQLNonNull, GraphQLInt, GraphQLError } from 'graphql'
import { prisma } from '../../../db'
import { DepartmentType } from '../types/department.type'
import { parseJSONBigIntToNumber } from '../../../helpers/parse_bigint'
import { readResponseMessages } from '../../../helpers/read_response_messages'
import { logger } from '../../logger'

const responseMessages = readResponseMessages()

const checkName = async (name: string): Promise<void> => {
  const message = (await responseMessages).department.error.blank_name
  if (!name) throw new Error(message)
}

export const createDepartmentMutation = {
  type: DepartmentType,
  args: {
    name: { type: new GraphQLNonNull(GraphQLString) },
    managerId: { type: new GraphQLNonNull(GraphQLInt) },
    description: { type: GraphQLString }
  },
  async resolve (_parent: any, args: any) {
    try {
      await checkName(args.name).catch((err) => { throw err })
    } catch (err: Error | any) {
      return new GraphQLError(err.message)
    }
    return await prisma.department.create({ data: args })
      .then((user) => { return parseJSONBigIntToNumber(user) })
      .catch((err) => {
        logger.error(err)
        return new GraphQLError('Internal Error')
      })
  }
}
