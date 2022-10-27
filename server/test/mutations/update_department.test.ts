import request from 'supertest'
import { signInUser, signInAdmin } from '../factories/sign_in_user'
import { faker } from '@faker-js/faker'
import { createRandomDepartment } from '../factories/department.factory'
import { prisma } from '../../db'
import { Department } from '@prisma/client'
import { createNonExistingUser } from '../factories/user.factory'
import { ResponseMessages, readResponseMessages } from '../../helpers/read_response_messages'
/* eslint-disable @typescript-eslint/no-var-requires */
const app = require('../../src/app')
/* eslint-enable @typescript-eslint/no-var-requires */

afterAll(() => {
  app.close()
})

const url: string = '/graphql'
let department: Department
let adminToken: string
let responseMessages: ResponseMessages

beforeAll(async () => {
  adminToken = await signInAdmin()
  department = await createRandomDepartment()
  responseMessages = await readResponseMessages()
})

describe('updateDepartment mutation', () => {
  it('throws unauthorized code if user is not signed in ', async () => {
    await request(app)
      .post(url)
      .send({ query: `mutation { updateDepartment(id: ${department.id}) { id } }` })
      .expect(401)
  })

  it('updates the department if user is signed in and has ADMIN role', async () => {
    await request(app)
      .post(url)
      .set({ authorization: `Bearer ${adminToken}` })
      .send({ query: `mutation { updateDepartment(id: ${department.id}) { id } }` })
      .expect(200)
  })

  it('updates the department if signed-in user is manager of the department', async () => {
    const token = await signInUser(department.managerId)
    await request(app)
      .post(url)
      .set({ authorization: `Bearer ${token}` })
      .send({ query: `mutation { updateDepartment(id: ${department.id}) { id } }` })
      .expect(200)
  })

  it('updates name', async () => {
    const newName = faker.random.word()
    const res = await request(app)
      .post(url)
      .set({ authorization: `Bearer ${adminToken}` })
      .send({ query: `mutation { updateDepartment(id: ${department.id}, name: "${newName}") { id, name } }` })
      .expect(200)
    expect(res.body.data.updateDepartmentMutation).not.toBeNull()
    expect((await prisma.department.findFirst({ where: { id: department.id }, select: { name: true } }))?.name).toEqual(newName)
  })

  it('throws error if new name is empty', async () => {
    const res = await request(app)
      .post(url)
      .set({ authorization: `Bearer ${adminToken}` })
      .send({ query: `mutation { updateDepartment(id: ${department.id}, name: "") { id, name } }` })
      .expect(200)
    expect(res.body).toHaveProperty('errors')
    expect(res.body.data.updateDepartment).toBeNull()
    expect(res.body.errors[0].message).toEqual(responseMessages.department.error.blankName)
  })

  it('throws error if name is already taken ', async () => {
    const newName: string | undefined = ((await prisma.department.findFirst({ where: { name: { not: department.name } }, select: { name: true } }))?.name)
    const res = await request(app)
      .post(url)
      .set({ authorization: `Bearer ${adminToken}` })
      .send({ query: `mutation { updateDepartment(id: ${department.id}, name: "${String(newName)}") { id, name } }` })
      .expect(200)
    expect(res.body).toHaveProperty('errors')
    expect(res.body.data.updateDepartment).toBeNull()
    expect(res.body.errors[0].message).toEqual(responseMessages.department.error.nameAlreadyTaken)
  })

  it('updates description', async () => {
    const newDescripiton = faker.lorem.sentence()
    const res = await request(app)
      .post(url)
      .set({ authorization: `Bearer ${adminToken}` })
      .send({ query: `mutation { updateDepartment(id: ${department.id}, description: "${newDescripiton}") { id, description } }` })
      .expect(200)
    expect(res.body.data.updateDepartmentMutation).not.toBeNull()
    expect((await prisma.department.findFirst({ where: { id: department.id }, select: { description: true } }))?.description).toEqual(newDescripiton)
  })

  it("throws error if user with managerId doesn't exist", async () => {
    const invalidUserId = (await createNonExistingUser()).id
    const res = await request(app)
      .post(url)
      .set({ authorization: `Bearer ${adminToken}` })
      .send({ query: `mutation { updateDepartment(id: ${department.id}, managerId: ${Number(invalidUserId)}) { id, managerId } }` })
      .expect(200)
    expect(res.body).toHaveProperty('errors')
    expect(res.body.data.updateDepartment).toBeNull()
    expect(res.body.errors[0].message).toEqual(responseMessages.department.error.invalidManager)
  })
})
