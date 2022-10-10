import { GraphQLObjectType, GraphQLNonNull, GraphQLString, GraphQLBoolean } from 'graphql'
import { GraphQLBigInt } from './scalar/bigint.type'
export const EmployeeType = new GraphQLObjectType({
  name: 'Type',
  fields: {
    id: { type: new GraphQLNonNull(GraphQLBigInt) },
    userId: { type: new GraphQLNonNull(GraphQLBigInt) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    surname: { type: new GraphQLNonNull(GraphQLString) },
    position: { type: new GraphQLNonNull(GraphQLBigInt) },
    staffMember: { type: new GraphQLNonNull(GraphQLBoolean) },
    departmentId: { type: new GraphQLNonNull(GraphQLBigInt) }
  }
})
