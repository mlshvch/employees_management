import request = require('supertest')
import { User } from '@prisma/client'
import { createRandomUserData } from '../factories/user.factory'
/* eslint-disable @typescript-eslint/no-var-requires */
const app = require('../../src/app')
/* eslint-enable @typescript-eslint/no-var-requires */

let token: string

afterAll(() => {
  app.close()
})

beforeAll(async () => {
  const userData: User = createRandomUserData()
  const auth = await request(app).post('/graphql/auth')
    .send({
      query: `mutation { 
      signUp(uid: "${userData.uid}", password: "${userData.password}"),
      signIn(uid: "${userData.uid}", password: "${userData.password}") { token } }`
    })
  token = auth.body.data.signIn.token
})

describe('GraphQL API', () => {
  it('sucessfully signout', async () => {
    await request(app)
      .post('/graphql')
      .set({ authorization: `Bearer ${token}` })
      .send({ query: 'mutation { signOut }' })
      .expect(200)
  })

  it('makes token invalid', async () => {
    await request(app)
      .post('/graphql')
      .set({ authorization: `Bearer ${token}` })
      .send({ query: '{ helloWorld }' })
      .expect(401)
  })
})
