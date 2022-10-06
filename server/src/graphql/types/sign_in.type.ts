import { GraphQLObjectType, GraphQLString } from 'graphql'

export const SignInType = new GraphQLObjectType({
  name: 'SignIn',
  fields: {
    token: { type: GraphQLString },
  }
})
