import { GraphQLString, GraphQLError } from 'graphql'
import * as bcrypt from 'bcrypt'
import { PrismaClient, User } from '@prisma/client'
import jwt from 'jsonwebtoken'
import { SignInType } from '../types/sign_in.type'

const client = new PrismaClient()

const generateToken = (user: any, expiry: number): string => {
  const secretToken = process.env.TOKEN_SECRET ?? ''
  if (!secretToken) throw new Error('token is not defined')
  return jwt.sign({ id: Number(user.id), uid: user.uid }, secretToken, { expiresIn: expiry })
}

export const signInMutation = {
  type: SignInType,
  args: {
    uid: { type: GraphQLString },
    password: { type: GraphQLString }
  },
  async resolve (_parent: any, args: any) {
    return await client.user.findFirstOrThrow({
      where: {
        uid: args.uid
      }
    })
      .then(async (user: User) => {
        return await bcrypt.compare(args.password, user.password)
          .then(async (result) => {
            if (result) {
              // creates custom expriry for 2 weeks (14 days)
              const expiry: number = Date.now() + 1209600
              const token: string = generateToken(user, expiry)
              const tokenId: string = token.split('.')[2]
              const tokenList: any = user.tokens
              tokenList[tokenId] = { password: user.password, expiresAt: expiry }
              await client.user.update({
                where: {
                  uid: user.uid
                },
                data: {
                  tokens: tokenList
                }
              })
              return { token }
            } else {
              return new GraphQLError('Bad credentials')
            }
          })
      })
      .catch((err) => {
        return new GraphQLError(err)
      })
  }
}
