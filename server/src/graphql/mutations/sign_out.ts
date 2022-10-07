import { GraphQLBoolean } from 'graphql'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

export const signOutMutation = {
  type: GraphQLBoolean,
  args: {},
  async resolve (_parent: any, args: object, context: any) {
    const token = context.headers.authorization.split(' ')[1]
    const tokenId: string = token.split('.')[2]
    const userData = jwt.decode(token, { json: true })
    const prisma = new PrismaClient()
    const user = await prisma.user.findFirst({
      where: {
        uid: userData?.uid
      }
    })

    const tokensList: { [key: string]: any } = Object(user?.tokens)
    delete tokensList?.[tokenId]

    await prisma.user.update({
      where: {
        uid: user?.uid
      },
      data: {
        tokens: tokensList
      }
    })
    return true
  }
}
