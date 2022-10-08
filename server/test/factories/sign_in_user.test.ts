import { signInUser } from './sign_in_user'

describe('signInUser factory', () => {
  it('signs user in', async () => {
    expect(await signInUser()).toBeTruthy()
  })
})
