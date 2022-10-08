import { createRandomUserData } from './user.factory'
import { signInMutation } from '../../src/graphql/mutations/sign_in'
import { GraphQLError } from 'graphql'
import { signUpMutation } from '../../src/graphql/mutations/sign_up'

export const signInUser = async (): Promise<string> => {
  const userData = createRandomUserData()
  await signUpMutation.resolve(undefined, userData)
  return await signInMutation.resolve(undefined, userData)
    .then((object: { token: string } | GraphQLError) => {
      if (typeof (object) === 'object') return Object(object).token
    })
}
