import request from 'supertest'
import { signInAdmin, signInUser } from '../factories/sign_in_user'
import { createRandomPositionData, createRandomPosition } from '../factories/position.factory'
import { readResponseMessages, ResponseMessages } from '../../helpers/read_response_messages'

/* eslint-disable @typescript-eslint/no-var-requires */
const app = require('../../src/app')
/* eslint-enable @typescript-eslint/no-var-requires */
const url = '/graphql'

let adminToken: string
let userToken: string
let responseMessages: ResponseMessages

beforeAll(async () => {
  responseMessages = await readResponseMessages()
  adminToken = await signInAdmin()
  userToken = await signInUser()
})

afterAll(() => {
  app.close()
})

describe('createPosition mutation', () => {
  it('creates position if user is authorized and params are valid', async () => {
    const position = createRandomPositionData()
    await request(app)
      .post(url)
      .set({ authorization: `Bearer ${adminToken}` })
      .send({ query: `mutation { createPosition(name: "${position.name}") { id, name } }` })
      .expect(200)
  })

  it('throws unauthorized error if user is not signed in', async () => {
    const position = createRandomPositionData()
    await request(app)
      .post(url)
      .send({ query: `mutation { createPosition(name: "${position.name}") { id, name } }` })
      .expect(401)
  })

  it("throws forbidden error if user doesn't have ADMIN role", async () => {
    const position = createRandomPositionData()
    const res = await request(app)
      .post(url)
      .set({ authorization: `Bearer ${userToken}` })
      .send({ query: `mutation { createPosition(name: "${position.name}") { id, name } }` })
      .expect(200)
    expect(res.body.errors).toBeTruthy()
    expect(res.body.errors[0].message).toEqual(responseMessages.common.forbidden)
  })

  it('throws GraphQL error if position with this name already exists', async () => {
    const position = await createRandomPosition()
    const res = await request(app)
      .post(url)
      .set({ authorization: `Bearer ${adminToken}` })
      .send({ query: `mutation { createPosition(name: "${position.name}") { id, name } }` })
      .expect(200)

    expect(res.body).toHaveProperty('errors')
    expect(res.body.data.createPosition).toBeNull()
    expect(res.body.errors[0].message).toEqual(responseMessages.position.error.nameAlreadyTaken)
  })
})
