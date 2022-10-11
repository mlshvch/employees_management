import { PositionType } from '../types/position.type'
import { GraphQLNonNull, GraphQLError } from 'graphql'
import { GraphQLBigInt } from '../types/scalar/bigint.type'
import { prisma } from '../../../db'
export const deletePositionMutation = {
  type: PositionType,
  args: {
    id: { type: new GraphQLNonNull(GraphQLBigInt) }
  },
  async resolve (_parent: any, args: { id: number | bigint }): Promise<GraphQLError | object> {
    return await prisma.position.delete({ where: { id: args.id } })
      .catch((err: Error) => {
        return new GraphQLError(err.message)
      })
  }
}
