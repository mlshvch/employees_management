import request from 'supertest'
import { signInUser } from '../factories/sign_in_user'
import { PrismaClient } from '@prisma/client'
import { parseJSONBigIntToNumber } from '../../helpers/parse_bigint'
import { selectRandomPosition, createInvalidPositionData } from '../factories/position.factory'
/* eslint-disable @typescript-eslint/no-var-requires */
const app = require('../../src/app')
/* eslint-enable @typescript-eslint/no-var-requires */

afterAll(() => {
  app.close()
})

const url: string = '/graphql'
let token: string
const prisma = new PrismaClient()

beforeAll(async () => {
  token = await signInUser()
})

// positions are generated in seed file
describe('position Query', () => {
  it('returns data if user is signed-in', async () => {
    await request(app).post(url)
      .set({ authorization: `Bearer ${token}` })
      .send({ query: '{ position {id, name } }' })
      .expect(200)
  })

  it('throws unauthorized error if user is not signed-in', async () => {
    await request(app).post(url)
      .send({ query: '{ position {id, name } }' })
      .expect(401)
  })

  it('returns valid data', async () => {
    const res = await request(app)
      .post(url)
      .set({ authorization: `Bearer ${token}` })
      .send({ query: '{ position {id, name } }' })
      .expect(200)
    const positions = (await prisma.position.findMany()).map((value) => parseJSONBigIntToNumber(value))
    expect(res.body.data.position).toEqual(positions)
  })

  it('returns selected data', async () => {
    const randomPosition = await selectRandomPosition()
    const data = await prisma.position.findMany({ where: { id: randomPosition.id } }).then((value) => value.map((position) => parseJSONBigIntToNumber(position)))
    const res = await request(app)
      .post(url)
      .set({ authorization: `Bearer ${token}` })
      .send({ query: `{ position(id: ${randomPosition.id}) {id, name } }` })
      .expect(200)
    expect(res.body.data.position).toEqual(data)
  })

  it('returns selected data', async () => {
    const randomPosition = await selectRandomPosition()
    const data = await prisma.position.findMany({ where: { id: randomPosition.id } }).then((value) => value.map((position) => parseJSONBigIntToNumber(position)))
    const res = await request(app)
      .post(url)
      .set({ authorization: `Bearer ${token}` })
      .send({ query: `{ position(id: ${randomPosition.id}) {id, name } }` })
      .expect(200)
    expect(res.body.data.position).toEqual(data)
  })

  it('returns empty array if data with passed params is not found', async () => {
    const invalidPosition: { id?: bigint | number, name: string } = await createInvalidPositionData()
    const res = await request(app)
      .post(url)
      .set({ authorization: `Bearer ${token}` })
      .send({ query: `{ position(id: ${Number(invalidPosition.id)}) {id, name } }` })
      .expect(200)
    expect(res.body.data.position).toEqual([])
  })
})
