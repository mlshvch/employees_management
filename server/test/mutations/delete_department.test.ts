import request from 'supertest'
import { createRandomDepartment, createNonExistingDepartment } from '../factories/department.factory'
import { signInUser } from '../factories/sign_in_user'
import { Department } from '@prisma/client'
/* eslint-disable @typescript-eslint/no-var-requires */
const app = require('../../src/app')
/* eslint-enable @typescript-eslint/no-var-requires */

afterAll(() => {
  app.close()
})

const url = '/graphql'
let department: Department
let token: string

beforeAll(async () => {
  token = await signInUser()
  department = await createRandomDepartment()
})

describe('deleteDepartment mutation', () => {
  it('deletes department if user signed-in and returns true', async () => {
    await request(app)
      .post(url)
      .set({ authorization: `Bearer ${token}` })
      .send({ query: `mutation { deleteDepartment(id: ${department.id}) { id } }` })
      .expect(200)
  })

  it('throws unauthorized code if user is not signed in ', async () => {
    await request(app)
      .post(url)
      .send({ query: `mutation { deleteDepartment(id: ${department.id}) { id } }` })
      .expect(401)
  })

  it("throws graphql error if department doesn't exist", async () => {
    const invalidDepartment = await createNonExistingDepartment()
    const res = await request(app)
      .post(url)
      .set({ authorization: `Bearer ${token}` })
      .send({ query: `mutation { deleteDepartment(id: ${invalidDepartment.id}) { id } }` })
      .expect(200)
    expect(res.body.data.deleteDepartment).toBeNull()
    expect(res.body.errors[0].message).toEqual("department with this id doesn't exist")
  })
})
