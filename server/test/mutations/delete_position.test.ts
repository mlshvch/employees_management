import request from 'supertest'
import { signInUser } from '../factories/sign_in_user'
import { Position } from '@prisma/client'
import { createRandomPosition, createInvalidPositionData } from '../factories/position.factory'
/* eslint-disable @typescript-eslint/no-var-requires */
const app = require('../../src/app')
/* eslint-enable @typescript-eslint/no-var-requires */

afterAll(() => {
  app.close()
})

const url = '/graphql'
let position: Position
let token: string

beforeAll(async () => {
  token = await signInUser()
})

beforeEach(async () => {
  position = await createRandomPosition()
})

describe('deletePosition mutation', () => {
  it('deletes position if user signed-in and returns true', async () => {
    await request(app)
      .post(url)
      .set({ authorization: `Bearer ${token}` })
      .send({ query: `mutation { deleteDepartment(id: ${position.id}) { id } }` })
      .expect(200)
  })

  it('throws unauthorized code if user is not signed in ', async () => {
    await request(app)
      .post(url)
      .send({ query: `mutation { deletePosition(id: ${position.id}) { id } }` })
      .expect(401)
  })

  it("throws graphql error if position doesn't exist", async () => {
    const invalidPosition = await createInvalidPositionData()
    const res = await request(app)
      .post(url)
      .set({ authorization: `Bearer ${token}` })
      .send({ query: `mutation { deletePosition(id: ${Number(invalidPosition.id)}) { id } }` })
      .expect(200)
    expect(res.body.data.deletePosition).toBeNull()
    expect(res.body).toHaveProperty('errors')
  })
})
