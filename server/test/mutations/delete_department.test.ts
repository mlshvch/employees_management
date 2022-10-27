import request from 'supertest'
import { createRandomDepartment, createNonExistingDepartment } from '../factories/department.factory'
import { signInUser, signInAdmin } from '../factories/sign_in_user'
import { Department } from '@prisma/client'
import { parseJSONBigIntToNumber } from '../../helpers/parse_bigint'
import { ResponseMessages, readResponseMessages } from '../../helpers/read_response_messages'
/* eslint-disable @typescript-eslint/no-var-requires */
const app = require('../../src/app')
/* eslint-enable @typescript-eslint/no-var-requires */

const url = '/graphql'

afterAll(() => {
  app.close()
})

let department: Department
let userToken: string
let adminToken: string
let responseMessages: ResponseMessages

beforeAll(async () => {
  userToken = await signInUser()
  adminToken = await signInAdmin()
  department = await createRandomDepartment()
  responseMessages = await readResponseMessages()
})

describe('deleteDepartment mutation', () => {
  it('throws unauthorized code if user is not signed in ', async () => {
    await request(app)
      .post(url)
      .send({ query: `mutation { deleteDepartment(id: ${department.id}) { id } }` })
      .expect(401)
  })

  it("throws graphql error if user doesn't have AMDIN role", async () => {
    const res = await request(app)
      .post(url)
      .set({ authorization: `Bearer ${userToken}` })
      .send({ query: `mutation { deleteDepartment(id: ${department.id}) { id } }` })
      .expect(200)
    expect(res.body.data.deleteDepartment).toBeNull()
    expect(res.body.errors[0].message).toEqual(responseMessages.common.forbidden)
  })

  it('deletes department if user signed-in and returns department', async () => {
    const res = await request(app)
      .post(url)
      .set({ authorization: `Bearer ${adminToken}` })
      .send({ query: `mutation { deleteDepartment(id: ${department.id}) { id name managerId description createdAt } }` })
      .expect(200)
    expect(res.body.data.deleteDepartment).toEqual(parseJSONBigIntToNumber(department))
  })

  it("throws graphql error if department doesn't exist", async () => {
    const invalidDepartment = await createNonExistingDepartment()
    const res = await request(app)
      .post(url)
      .set({ authorization: `Bearer ${adminToken}` })
      .send({ query: `mutation { deleteDepartment(id: ${invalidDepartment.id}) { id } }` })
      .expect(200)
    expect(res.body.data.deleteDepartment).toBeNull()
    expect(res.body.errors[0].message).toEqual(responseMessages.department.error.notExist)
  })
})
