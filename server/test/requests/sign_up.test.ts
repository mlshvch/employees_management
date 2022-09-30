import request = require('supertest')
import { createRandomUser } from '../factories/user.factory'
import { faker } from '@faker-js/faker'
import bcrypt from 'bcrypt'
import { PrismaClient, User } from '@prisma/client'
/* eslint-disable @typescript-eslint/no-var-requires */
const app = require('../../src/app')
/* eslint-enable @typescript-eslint/no-var-requires */

afterAll(() => {
  app.close()
})

const prisma = new PrismaClient()
const userData: User = createRandomUser()

describe('Sign_up Mutation', () => {
  it('returns bad request if uid is not provided', async () => {
    const res = await request(app).post('/graphql')
      .send({ query: 'mutation { signUp(uid: "") }' })
    expect(res.status).toBe(400)
    expect(res.body.data).toBeUndefined()
  })

  it('returns a bad request if password is not provided', async () => {
    const res = await request(app).post('/graphql')
      .send({ query: 'mutation { signUp(uid: "") }' })
    expect(res.status).toBe(400)
    expect(res.body.data).toBeUndefined()
  })

  it('returns an error if password shorter than 8 symbols is provided', async () => {
    const badPassword = faker.random.alphaNumeric(Math.floor(Math.random() * 7))
    const res = await request(app).post('/graphql')
      .send({ query: `mutation { signUp(uid: "hello", password: "${badPassword}") }` })
    expect(res.body).toHaveProperty('errors')
    expect(res.body.data.signUp).toBeNull()
  })

  it('returns success message if valid credentials are provided', async () => {
    const res = await request(app).post('/graphql')
      .send({ query: `mutation { signUp(uid: "${userData.uid}", password: "${userData.password}") }` })
    expect(res.body.data.signUp).toEqual('success')
  })

  it('creates new user if valid credentials are provided', async () => {
    const createdUser = await prisma.user.findFirstOrThrow({
      where: {
        uid: userData.uid
      }
    })
    expect(createdUser).toBeDefined()
  })

  it('encrypts user password', async () => {
    const createdUser = await prisma.user.findFirstOrThrow({
      where: {
        uid: userData.uid
      }
    })
    const checkPassword = await bcrypt.compare(userData.password, createdUser.password)
    expect(checkPassword).toBeTruthy()
  })

  it('throws an error if user with same uid already exists', async () => {
    const res = await request(app).post('/graphql')
      .send({ query: `mutation { signUp(uid: "${userData.uid}", password: "${userData.password}") }` })
    expect(res.body).toHaveProperty('errors')
    expect(res.body.data.signUp).toBeNull()
    expect(res.body.errors[0].message).toEqual('user with this uid already exists')
    console.log(res.body)
  })
})
