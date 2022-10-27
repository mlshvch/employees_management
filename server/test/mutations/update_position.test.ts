import request from 'supertest'
import { signInUser, signInAdmin } from '../factories/sign_in_user'
import { createRandomPosition, createInvalidPositionData, createRandomPositionData, selectRandomPosition } from '../factories/position.factory'
import { Position } from '@prisma/client'
import { ResponseMessages, readResponseMessages } from '../../helpers/read_response_messages'
import { prisma } from '../../db'
import { parseJSONBigIntToNumber } from '../../helpers/parse_bigint'
/* eslint-disable @typescript-eslint/no-var-requires */
const app = require('../../src/app')
/* eslint-enable @typescript-eslint/no-var-requires */
const url = '/graphql'

let adminToken: string
let userToken: string
let position: Position
let responseMessages: ResponseMessages

beforeAll(async () => {
  adminToken = await signInAdmin()
  userToken = await signInUser()
  position = await createRandomPosition()
  responseMessages = await readResponseMessages()
})

afterAll(() => {
  app.close()
})
describe('updatePosition mutation', () => {
  it('throws unauthorized error if user is not signed in', async () => {
    await request(app)
      .post(url)
      .send({ query: `mutation { updatePosition(id: ${position.id} name: "${position.name}") { id, name } }` })
      .expect(401)
  })

  it("throws forbidden error if user doesn't have ADMIN role", async () => {
    const res = await request(app)
      .post(url)
      .set({ authorization: `Bearer ${userToken}` })
      .send({ query: `mutation { updatePosition(id: ${position.id} name: "${position.name}") { id, name } }` })
      .expect(200)
    expect(res.body.errors[0].message).toEqual(responseMessages.common.forbidden)
  })

  it('updates position if user is authorized and params are valid', async () => {
    const newPosition = createRandomPositionData('', position.id)
    const res = await request(app)
      .post(url)
      .set({ authorization: `Bearer ${adminToken}` })
      .send({ query: `mutation { updatePosition(id: ${position.id} name: "${newPosition.name}") { id, name } }` })
      .expect(200)
    const selectedPosition = await prisma.position.findFirst({ where: { id: position.id } })
    expect(selectedPosition).toEqual(newPosition)
    expect(res.body.data.updatePosition).toEqual(parseJSONBigIntToNumber(newPosition))
  })

  it('throws GraphQL error if passed name is blank', async () => {
    const res = await request(app)
      .post(url)
      .set({ authorization: `Bearer ${adminToken}` })
      .send({ query: `mutation { updatePosition(id: ${position.id} name: "") { id, name } }` })
      .expect(200)

    expect(res.body.data.updatePosition).toBeNull()
    expect(res.body.errors[0].message).toEqual(responseMessages.position.error.blankName)
  })

  it('throws GraphQL error if passed name is already taken', async () => {
    const name: string = await (await selectRandomPosition()).name
    const res = await request(app)
      .post(url)
      .set({ authorization: `Bearer ${adminToken}` })
      .send({ query: `mutation { updatePosition(id: ${position.id} name: "${name}") { id, name } }` })
      .expect(200)

    expect(res.body.data.updatePosition).toBeNull()
    expect(res.body.errors[0].message).toEqual(responseMessages.position.error.nameAlreadyTaken)
  })

  it("throws GraphQL error if position with passed id doesn't exist", async () => {
    const position = await createInvalidPositionData()
    const res = await request(app)
      .post(url)
      .set({ authorization: `Bearer ${adminToken}` })
      .send({ query: `mutation { updatePosition(id: ${Number(position.id)} name: "${position.name}") { id, name } }` })
      .expect(200)

    expect(res.body.data.updatePosition).toBeNull()
    expect(res.body.errors[0].message).toEqual(responseMessages.position.error.notExist)
  })
})
