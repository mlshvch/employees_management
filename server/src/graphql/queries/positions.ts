import { PositionType } from '../types/position.type'
import { GraphQLBigInt } from '../types/scalar/bigint.type'
import { GraphQLList, GraphQLString } from 'graphql'
import { prisma } from '../../../db'
import { parseJSONBigIntToNumber } from '../../../helpers/parse_bigint'
export const positionQuery = {
  type: new GraphQLList(PositionType),
  args: {
    id: { type: GraphQLBigInt },
    name: { type: GraphQLString }
  },
  async resolve (_parent: any, args: { id?: bigint | number, name?: string }) {
    return ((await prisma.position.findMany({ where: { id: args.id, name: args.name } })).map((value) => parseJSONBigIntToNumber(value)))
  }
}
