import { PositionType } from '../types/position.type'
import { GraphQLNonNull, GraphQLString, GraphQLError } from 'graphql'
import { PrismaClient, Position } from '@prisma/client'
import { parseJSONBigIntToNumber } from '../../../helpers/parse_bigint'
export const createPositionMutation = {
  type: PositionType,
  args: {
    name: { type: new GraphQLNonNull(GraphQLString) }
  },
  async resolve (_parent: any, args: { name: string }): Promise<object | GraphQLError> {
    const prisma = new PrismaClient()
    return await prisma.position.create({ data: args })
      .then((position: Position) => parseJSONBigIntToNumber(position))
      .catch((err: Error) => new GraphQLError(err.message.split('description:')[1]))
  }
}