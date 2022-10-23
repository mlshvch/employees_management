import { GraphQLString, GraphQLNonNull, GraphQLInt, GraphQLError } from 'graphql'
import { prisma } from '../../../db'
import { DepartmentType } from '../types/department.type'
import { parseJSONBigIntToNumber } from '../../../helpers/parse_bigint'
import { readResponseMessages } from '../../../helpers/read_response_messages'
import { logger } from '../../logger'

const responseMessages = readResponseMessages()

const checkName = async (name: string): Promise<void> => {
  const message = (await responseMessages).department.error.blankName
  if (!name) throw new GraphQLError(message)
}

const checkManagerId = async (managerId: bigint | number): Promise<void> => {
  const message = (await responseMessages).department.error.invalidManager
  if ((await prisma.user.findFirst({ where: { id: managerId } })) == null) throw new GraphQLError(message)
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
      await checkManagerId(args.managerId).catch((err) => { throw err })
    } catch (err: Error | any) {
      if (err instanceof GraphQLError) {
        return err
      } else {
        logger.error(err)
        return new GraphQLError('Internal Error')
      }
    }
    return await prisma.department.create({ data: args })
      .then((user) => { return parseJSONBigIntToNumber(user) })
      .catch((err) => {
        logger.error(err)
        return new GraphQLError('Internal Error')
      })
  }
}
