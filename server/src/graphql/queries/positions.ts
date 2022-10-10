import { PositionType } from '../types/position.type'
import { GraphQLBigInt } from '../types/scalar/bigint.type'
import { GraphQLString } from 'graphql'
import { PrismaClient } from '@prisma/client'
export const positionQuery = {
  type: PositionType,
  args: {
    id: { type: GraphQLBigInt },
    name: { type: GraphQLString }
  },
  async resolve (_parent: any, args: { id?: bigint | number, name?: string }) {
    const prisma = new PrismaClient()
    return (await prisma.position.findMany({
      where: {
        id: args.id,
        name: args.name
      }
    })).map((value) => JSON.parse(JSON.stringify(value, (_, v) => typeof v === 'bigint' ? Number(v) : v)))
  }
}
