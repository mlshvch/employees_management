import request from 'supertest'
import { createRandomUser, createRandomUserData } from '../factories/user.factory'
import { prisma } from '../../db'
import { User } from '@prisma/client'
import { parseJSONBigIntToNumber } from '../../helpers/parse_bigint'

/* eslint-disable @typescript-eslint/no-var-requires */
const app = require('../../src/app')
/* eslint-enable @typescript-eslint/no-var-requires */

afterAll(() => {
  app.close()
})

let token: string
const url = '/graphql'
const authUrl = '/graphql/auth'

beforeAll(async () => {
  const user: User = await createRandomUserData()
  await createRandomUser(user.uid, user.password)
  await request(app)
    .post(authUrl)
    .send({ query: `mutation { signIn(uid: "${user.uid}", password: "${user.password}") { token } }` })
    .then((res) => {
      token = res.body.data.signIn.token
    })
})

describe('department queries', () => {
  it('returns all departments if user authenticated', async () => {
    const res = await request(app)
      .post(url)
      .set({ authorization: `Bearer ${token}` })
      .send({ query: '{ department { id, name, managerId, description, createdAt } }' })

    expect((res.body.data.department)).toEqual((await prisma.department.findMany()).map((value) => parseJSONBigIntToNumber(value)))
  })

  it('returns unauthorized code is user is unauthenticated', async () => {
    await request(app)
      .post(url)
      .send({ query: '{ department { id, name, managerId, description, createdAt } }' })
      .expect(401)
  })
})
