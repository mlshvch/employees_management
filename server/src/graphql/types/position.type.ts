import { GraphQLObjectType, GraphQLNonNull, GraphQLString } from 'graphql'
import { GraphQLBigInt } from './scalar/bigint.type'
export const PositionType = new GraphQLObjectType({
  name: 'Position',
  fields: {
    id: { type: new GraphQLNonNull(GraphQLBigInt) },
    name: { type: new GraphQLNonNull(GraphQLString) }
  }
})
