import request = require('supertest')
import { createRandomUser } from '../factories/user.factory'
import bcrypt from 'bcrypt'
import { PrismaClient, User } from '@prisma/client'
import jwt from 'jsonwebtoken'
/* eslint-disable @typescript-eslint/no-var-requires */
const app = require('../../src/app')
/* eslint-enable @typescript-eslint/no-var-requires */

const prisma = new PrismaClient()
const userData: User = createRandomUser()
let createdUser: User
afterAll(() => {
  app.close()
})

beforeAll(async () => {
  createdUser = await prisma.user.create({
    data: {
      uid: userData.uid,
      password: await bcrypt.hash(userData.password, 10),
      tokens: {}
    }
  })
})

describe('SignIn Mutation', () => {
  it('return true if user exists', async () => {
    const res = await request(app).post('/graphql')
      .send({ query: `mutation { signIn(uid: "${userData.uid}", password: "${userData.password}") { token } }` })
    expect(res.body.data.signIn).toBeTruthy()
  })

  const secretToken: string = process.env.TOKEN_SECRET ?? ''
  if (!secretToken) throw new Error('token is not defined')

  it('returns signed token ', async () => {
    const res = await request(app).post('/graphql')
      .send({ query: `mutation { signIn(uid: "${userData.uid}", password: "${userData.password}") { token } }` })
    const token: string = res.body.data.signIn.token
    expect(jwt.verify(token, secretToken)).toBeTruthy()
    const decodedToken = jwt.decode(token, { json: true })
    if (decodedToken != null) {
      expect(decodedToken.id).toEqual(Number(createdUser.id))
      expect(decodedToken.uid).toEqual(createdUser.uid)
    } else {
      throw new Error('Sign-in mutation creates invalid token')
    }
  })

  it('updates user tokens record', async () => {
    const res = await request(app).post('/graphql')
      .send({ query: `mutation { signIn(uid: "${userData.uid}", password: "${userData.password}") { token } }` })
    const token: string = res.body.data.signIn.token
    const tokenId = token.split('.')[2]
    const user: User = await prisma.user.findFirstOrThrow({
      where: {
        uid: userData.uid
      }
    })

    expect(user.tokens).toHaveProperty(tokenId)
  })
})
