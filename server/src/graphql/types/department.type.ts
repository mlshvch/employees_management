import { GraphQLObjectType, GraphQLString } from 'graphql'
import { GraphQLBigInt } from './scalar/bigint.type'
import { GraphQLDateTime } from './scalar/datetime.type'

export const DepartmentType = new GraphQLObjectType({
  name: 'Department',
  fields: {
    id: { type: GraphQLBigInt },
    name: { type: GraphQLString },
    managerId: { type: GraphQLBigInt },
    description: { type: GraphQLString },
    createdAt: { type: GraphQLDateTime }
  }
})
