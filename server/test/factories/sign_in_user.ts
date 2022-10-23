import { createRandomUserData } from './user.factory'
import { signInMutation } from '../../src/graphql/mutations/sign_in'
import { GraphQLError } from 'graphql'
import { signUpMutation } from '../../src/graphql/mutations/sign_up'
import { prisma } from '../../db'

export const signInUser = async (): Promise<string> => {
  const userData = createRandomUserData()
  await signUpMutation.resolve(undefined, userData)

  return await signInMutation.resolve(undefined, userData)
    .then((object: { token: string } | GraphQLError) => {
      if (typeof (object) === 'object') return Object(object).token
    })
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
