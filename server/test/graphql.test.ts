import { createRandomUser } from './factories/user.factory'
import request = require('supertest')
import { User } from '@prisma/client'
/* eslint-disable @typescript-eslint/no-var-requires */
const app = require('../src/app')
/* eslint-enable @typescript-eslint/no-var-requires */

afterAll(() => {
  app.close()
})

describe('GraphQL API', () => {
  it('Log the message if token provided', async () => {
    const userData: User = createRandomUser()
    const auth = await request(app).post('/graphql/auth')
      .send({
        query: `mutation { 
      signUp(uid: "${userData.uid}", password: "${userData.password}"),
      signIn(uid: "${userData.uid}", password: "${userData.password}") { token } }`
      })
    const token: string = auth.body.data.signIn.token

    const res = await request(app)
      .post('/graphql')
      .set({ authorization: `Bearer ${token}` })
      .send({ query: '{ helloWorld }' })
      .expect(200)

    expect(res.body).toHaveProperty('data')
    expect(res.body.data).toHaveProperty('helloWorld')
    expect(res.body.data.helloWorld).toEqual('Hello, World!')
  })

  it('throws unauthorized error if token absent', async () => {
    await request(app)
      .post('/graphql')
      .send({ query: '{ helloWorld }' })
      .expect(401)
  })
})
