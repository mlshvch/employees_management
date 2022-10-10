import request from 'supertest'
import { signInUser } from '../factories/sign_in_user'
import { createRandomPositionData, createRandomPosition } from '../factories/position.factory'

/* eslint-disable @typescript-eslint/no-var-requires */
const app = require('../../src/app')
/* eslint-enable @typescript-eslint/no-var-requires */
const url = '/graphql'

let token: string

beforeAll(async () => {
  token = await signInUser()
})

afterAll(() => {
  app.close()
})
describe('createPosition mutation', () => {
  it('creates position if user is authorized and params are valid', async () => {
    const position = createRandomPositionData()
    await request(app)
      .post(url)
      .set({ authorization: `Bearer ${token}` })
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

  it('throws GraphQL error if position with this name already exists', async () => {
    const position = await createRandomPosition()
    const res = await request(app)
      .post(url)
      .set({ authorization: `Bearer ${token}` })
      .send({ query: `mutation { createPosition(name: "${position.name}") { id, name } }` })
      .expect(200)

    expect(res.body).toHaveProperty('errors')
    expect(res.body.data.createPosition).toBeNull()
  })
})
