import { PositionType } from '../types/position.type'
import { GraphQLNonNull, GraphQLString, GraphQLError } from 'graphql'
import { prisma } from '../../../db'
import { Position } from '@prisma/client'
import { GraphQLBigInt } from '../types/scalar/bigint.type'
import { parseJSONBigIntToNumber } from '../../../helpers/parse_bigint'
import { ResponseMessages, readResponseMessages } from '../../../helpers/read_response_messages'
import { handleValidationError } from '../../../helpers/handle_validation_error'

const responseMessages: Promise<ResponseMessages> = readResponseMessages()

const authorize = async (userId: bigint | number): Promise<void> => {
  const message = (await responseMessages).common.forbidden
  if ((await prisma.user.findFirst({ where: { id: userId } }))?.role !== 'ADMIN') throw new GraphQLError(message)
}

const checkPositionId = async (positionId: bigint | number): Promise<void> => {
  const message = (await responseMessages).position.error.notExist
  if ((await prisma.position.findFirst({ where: { id: positionId } })) == null) throw new GraphQLError(message)
}

const checkPositionName = async (positionName: string): Promise<void> => {
  const blankNameMessage = (await responseMessages).position.error.blankName
  const nameAlreadyTaken = (await responseMessages).position.error.nameAlreadyTaken
  if (!positionName) throw new GraphQLError(blankNameMessage)
  if ((await prisma.position.findFirst({ where: { name: positionName } })) != null) throw new GraphQLError(nameAlreadyTaken)
}

export const updatePositionMutation = {
  type: PositionType,
  args: {
    id: { type: new GraphQLNonNull(GraphQLBigInt) },
    name: { type: new GraphQLNonNull(GraphQLString) }
  },
  async resolve (_parent: any, args: { id: number | bigint, name: string }, cntx: any): Promise<object | GraphQLError> {
    try {
      await authorize(cntx.user.id)
      await checkPositionId(args.id)
      await checkPositionName(args.name)
    } catch (err: any) {
      return handleValidationError(err)
    }
    return await prisma.position.update({ where: { id: args.id }, data: { name: args.name } })
      .then((position: Position) => parseJSONBigIntToNumber(position))
      .catch(async () => {
        return new GraphQLError((await responseMessages).common.internalError)
      })
  }
}
