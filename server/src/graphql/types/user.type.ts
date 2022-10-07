import { GraphQLNonNull, GraphQLObjectType, GraphQLScalarType, GraphQLString } from 'graphql'

export const UserType = new GraphQLObjectType({
  name: 'User',
  fields: {
    id: { type: new GraphQLNonNull(new GraphQLScalarType(BigInt)) },
    uid: { type: new GraphQLNonNull(GraphQLString) },
    password: { type: new GraphQLNonNull(GraphQLString) },
    tokens: { type: new GraphQLNonNull(new GraphQLScalarType(Object)) },
    created_at: { type: new GraphQLNonNull(GraphQLString) }
  }
})
