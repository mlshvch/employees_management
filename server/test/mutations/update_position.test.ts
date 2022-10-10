import request from 'supertest'
import { signInUser } from '../factories/sign_in_user'
import { createRandomPosition, createInvalidPositionData } from '../factories/position.factory'
import { Position } from '@prisma/client'

/* eslint-disable @typescript-eslint/no-var-requires */
const app = require('../../src/app')
/* eslint-enable @typescript-eslint/no-var-requires */
const url = '/graphql'

let token: string
let position: Position
beforeAll(async () => {
  token = await signInUser()
  position = await createRandomPosition()
})

afterAll(() => {
  app.close()
})
describe('updatePosition mutation', () => {
  it('updates position if user is authorized and params are valid', async () => {
    await request(app)
      .post(url)
      .set({ authorization: `Bearer ${token}` })
      .send({ query: `mutation { updatePosition(id: ${position.id} name: "${position.name}") { id, name } }` })
      .expect(200)
  })

  it('throws unauthorized error if user is not signed in', async () => {
    await request(app)
      .post(url)
      .send({ query: `mutation { updatePosition(id: ${position.id} name: "${position.name}") { id, name } }` })
      .expect(401)
  })

  it('throws GraphQL error if passed name is blank', async () => {
    const res = await request(app)
      .post(url)
      .set({ authorization: `Bearer ${token}` })
      .send({ query: `mutation { updatePosition(id: ${position.id} name: "") { id, name } }` })
      .expect(200)

    expect(res.body).toHaveProperty('errors')
    expect(res.body.data.updatePosition).toBeNull()
  })

  it("throws GraphQL error if position with passed id doesn't exist", async () => {
    const position = await createInvalidPositionData()
    const res = await request(app)
      .post(url)
      .set({ authorization: `Bearer ${token}` })
      .send({ query: `mutation { updatePosition(id: ${Number(position.id)} name: "${position.name}") { id, name } }` })
      .expect(200)

    expect(res.body).toHaveProperty('errors')
    expect(res.body.data.updatePosition).toBeNull()
  })
})
