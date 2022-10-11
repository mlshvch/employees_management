import { PositionType } from '../types/position.type'
import { GraphQLNonNull, GraphQLString, GraphQLError } from 'graphql'
import { prisma } from '../../../db'
import { Position } from '@prisma/client'
import { GraphQLBigInt } from '../types/scalar/bigint.type'
import { parseJSONBigIntToNumber } from '../../../helpers/parse_bigint'
export const updatePositionMutation = {
  type: PositionType,
  args: {
    id: { type: new GraphQLNonNull(GraphQLBigInt) },
    name: { type: new GraphQLNonNull(GraphQLString) }
  },
  async resolve (_parent: any, args: { id: number | bigint, name: string }): Promise<object | GraphQLError> {
    if (!args.name) throw new Error('name can not be blank')
    return await prisma.position.update({ where: { id: args.id }, data: { name: args.name } })
      .then((position: Position) => parseJSONBigIntToNumber(position))
      .catch((err: Error) => {
        return new GraphQLError(err.message)
      })
  }
}
