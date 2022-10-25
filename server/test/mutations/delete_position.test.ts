import request from 'supertest'
import { signInUser, signInAdmin } from '../factories/sign_in_user'
import { Position } from '@prisma/client'
import { createRandomPosition, createInvalidPositionData } from '../factories/position.factory'
import { parseJSONBigIntToNumber } from '../../helpers/parse_bigint'
import { prisma } from '../../db'
import { ResponseMessages, readResponseMessages } from '../../helpers/read_response_messages'
/* eslint-disable @typescript-eslint/no-var-requires */
const app = require('../../src/app')
/* eslint-enable @typescript-eslint/no-var-requires */

afterAll(() => {
  app.close()
})

const url = '/graphql'
let position: Position
let adminToken: string
let userToken: string
let responseMessages: ResponseMessages

beforeAll(async () => {
  adminToken = await signInAdmin()
  userToken = await signInUser()
  responseMessages = await readResponseMessages()
})

beforeEach(async () => {
  position = await createRandomPosition()
})

describe('deletePosition mutation', () => {
  it('throws unauthorized code if user is not signed in ', async () => {
    await request(app)
      .post(url)
      .send({ query: `mutation { deletePosition(id: ${position.id}) { id } }` })
      .expect(401)
  })

  it("throws forbidden error if signed-in user doesn't have ADMIN role", async () => {
    const res = await request(app)
      .post(url)
      .set({ authorization: `Bearer ${userToken}` })
      .send({ query: `mutation { deletePosition(id: ${position.id}) { id } }` })
      .expect(200)
    expect(res.body.data.deletePosition).toBeNull()
    expect(res.body.errors[0].message).toEqual(responseMessages.common.forbidden)
  })
  it('deletes position if user signed-in and has ADMIN role', async () => {
    const res = await request(app)
      .post(url)
      .set({ authorization: `Bearer ${adminToken}` })
      .send({ query: `mutation { deletePosition(id: ${position.id}) { id name } }` })
      .expect(200)
    expect(res.body.data.deletePosition).toEqual(parseJSONBigIntToNumber(position))
    expect(await prisma.position.findFirst({ where: { id: position.id } })).toBeNull()
  })

  it("throws graphql error if position doesn't exist", async () => {
    const invalidPosition = await createInvalidPositionData()
    const res = await request(app)
      .post(url)
      .set({ authorization: `Bearer ${adminToken}` })
      .send({ query: `mutation { deletePosition(id: ${Number(invalidPosition.id)}) { id } }` })
      .expect(200)
    expect(res.body.data.deletePosition).toBeNull()
    expect(res.body).toHaveProperty('errors')
    expect(res.body.errors[0].message).toEqual(responseMessages.position.error.notExist)
  })
})
