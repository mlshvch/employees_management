import { GraphQLString, GraphQLNonNull, GraphQLError } from 'graphql'
import { prisma } from '../../../db'
import * as bcrypt from 'bcrypt'

export const signUpMutation = {
  type: GraphQLString,
  args: {
    uid: { type: new GraphQLNonNull(GraphQLString) },
    password: { type: new GraphQLNonNull(GraphQLString) }
  },
  async resolve (_parent: any, args: any) {
    let data
    if (args.password.length < 8) return new GraphQLError('Password is less than 8 characters')
    await bcrypt.hash(args.password, 10)
      .then(async (hash) => {
        await prisma.user.create({
          data: {
            uid: args.uid,
            password: hash,
            tokens: {}
          }
        })
          .then(() => {
            data = 'success'
          })
          .catch((err) => {
            let message: string
            // === is used to prevent typescript-eslint/strict-boolean-expression error
            if (err.stack.includes('Unique constraint failed on the fields: (`uid`)') === true) {
              message = 'user with this uid already exists'
            } else {
              message = 'internal error'
            }
            data = new GraphQLError(message)
          })
      })
    return data
  }
}
