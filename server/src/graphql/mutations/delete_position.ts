import { PositionType } from '../types/position.type'
import { GraphQLNonNull, GraphQLError } from 'graphql'
import { GraphQLBigInt } from '../types/scalar/bigint.type'
import { prisma } from '../../../db'
import { ResponseMessages, readResponseMessages } from '../../../helpers/read_response_messages'
import { handleValidationError } from '../../../helpers/handle_validation_error'
import { User, Position } from '@prisma/client'
import { parseJSONBigIntToNumber } from '../../../helpers/parse_bigint'

const responseMessages: Promise<ResponseMessages> = readResponseMessages()

const checkPositionId = async (positionId: number | bigint): Promise<void> => {
  if ((await prisma.position.findFirst({ where: { id: positionId } })) == null) {
    throw new GraphQLError((await responseMessages).position.error.notExist)
  }
}

const authorize = async (userId: number | bigint): Promise<void> => {
  const user: User | null = await prisma.user.findFirst({ where: { id: userId } })
  if (user?.role !== 'ADMIN') throw new GraphQLError((await responseMessages).common.forbidden)
}

export const deletePositionMutation = {
  type: PositionType,
  args: {
    id: { type: new GraphQLNonNull(GraphQLBigInt) }
  },
  async resolve (_parent: any, args: { id: number | bigint }, cntx: any): Promise<GraphQLError | object> {
    try {
      await authorize(cntx.user.id).catch((err: GraphQLError | Error) => { throw err })
      await checkPositionId(args.id).catch((err: GraphQLError | Error) => { throw err })
    } catch (err: Error | GraphQLError | any) {
      return handleValidationError(err)
    }
    return await prisma.position.delete({ where: { id: args.id } })
      .then((position: Position) => parseJSONBigIntToNumber(position))
      .catch((err: Error) => {
        return new GraphQLError(err.message)
      })
  }
}
