import { createRandomUserData } from './user.factory'
import { generateToken, signInMutation } from '../../src/graphql/mutations/sign_in'
import { GraphQLError } from 'graphql'
import { signUpMutation } from '../../src/graphql/mutations/sign_up'
import { prisma } from '../../db'

export const signInUser = async (userId?: bigint | number): Promise<string> => {
  if (userId) {
    const user = await prisma.user.findFirstOrThrow({ where: { id: userId } })
      .catch(() => { throw new Error("User with provided userId doesn't exist") })

    const expiry: number = Date.now() + 1209600
    const token: string = generateToken(user, expiry)
    const tokenId: string = token.split('.')[2]
    const tokenList: any = user.tokens
    tokenList[tokenId] = { password: user.password, expiresAt: expiry }
    await prisma.user.update({
      where: {
        id: userId
      },
      data: {
        tokens: tokenList
      }
    })
    return token
  } else {
    const userData = createRandomUserData()
    await signUpMutation.resolve(undefined, userData)

    return await signInMutation.resolve(undefined, userData)
      .then((object: { token: string } | GraphQLError) => {
        if (typeof (object) === 'object') return Object(object).token
      })
  }
}

export const signInAdmin = async (): Promise<string> => {
  const userData = createRandomUserData()
  await signUpMutation.resolve(undefined, userData)
  await prisma.user.update({ where: { uid: userData.uid }, data: { role: 'ADMIN' } })

  return await signInMutation.resolve(undefined, userData)
    .then((object: { token: string } | GraphQLError) => {
      if (typeof (object) === 'object') return Object(object).token
    })
}
