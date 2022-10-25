import { PositionType } from '../types/position.type'
import { GraphQLNonNull, GraphQLString, GraphQLError } from 'graphql'
import { prisma } from '../../../db'
import { Position } from '@prisma/client'
import { parseJSONBigIntToNumber } from '../../../helpers/parse_bigint'
import { readResponseMessages, ResponseMessages } from '../../../helpers/read_response_messages'
import { logger } from '../../logger'
import { handleValidationError } from '../../../helpers/handle_validation_error'

const responseMessages: Promise<ResponseMessages> = readResponseMessages()

const authorize = async (userId: bigint | number): Promise<void> => {
  const message = (await responseMessages).common.forbidden
  if ((await prisma.user.findFirst({ where: { id: userId } }))?.role !== 'ADMIN') throw new GraphQLError(message)
}

const validateName = async (positionName: string): Promise<void> => {
  const blankNameMessage = (await responseMessages).position.error.blankName
  const alreadyTakenMessage = (await responseMessages).position.error.nameAlreadyTaken
  if (!positionName) throw new GraphQLError(blankNameMessage)
  if ((await prisma.position.findFirst({ where: { name: positionName } })) != null) throw new GraphQLError(alreadyTakenMessage)
}

export const createPositionMutation = {
  type: PositionType,
  args: {
    name: { type: new GraphQLNonNull(GraphQLString) }
  },
  async resolve (_parent: any, args: { name: string }, cntx: any): Promise<object | GraphQLError> {
    try {
      await authorize(cntx.user.id).catch((err: Error | GraphQLError) => { throw err })
      await validateName(args.name).catch((err: Error | GraphQLError) => { throw err })
    } catch (err: Error | GraphQLError | any) {
      return handleValidationError(err)
    }
    return await prisma.position.create({ data: args })
      .then((position: Position) => parseJSONBigIntToNumber(position))
      .catch(async (err: Error) => {
        logger.info(err)
        return new GraphQLError((await responseMessages).common.internalError)
      })
  }
}
