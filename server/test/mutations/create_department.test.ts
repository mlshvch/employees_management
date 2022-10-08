import request from 'supertest'
/* eslint-enable @typescript-eslint/no-var-requires */
import { signInUser } from '../factories/sign_in_user'
import { createRandomDepartmentData } from '../factories/department.factory'
import { PrismaClient } from '@prisma/client'
/* eslint-disable @typescript-eslint/no-var-requires */
const app = require('../../src/app')
const url = '/graphql'

let token: string

const prisma = new PrismaClient()

afterAll(() => {
  app.close()
})

beforeAll(async () => {
  token = await signInUser()
})

describe('Create Department', () => {
  it('creates department if all params passed and valid', async () => {
    const dep = await createRandomDepartmentData()
    await request(app).post(url)
      .set({ authorization: `Bearer ${token}` })
      .send({
        query: `mutation {
      createDepartment(name: "${dep.name}", managerId: ${dep.managerId}, description:"${dep.description}") {
        id, 
        name, 
        managerId, 
        description, 
        createdAt
      }
    }`
      })
      .expect(200)
    expect(await prisma.department.findFirst({ where: { name: dep.name } })).toBeTruthy()
  })

  it('throws unauthorized code if token is not signed-in', async () => {
    const dep = await createRandomDepartmentData()
    await request(app).post(url)
      .send({
        query: `mutation {
      createDepartment(name: "${dep.name}", managerId: ${dep.managerId}, description:"${dep.description}") {
        id, 
        name, 
        managerId, 
        description, 
        createdAt
      }
    }`
      })
      .expect(401)
  })

  it('throws error if name is not passed', async () => {
    const dep = await createRandomDepartmentData()
    const res = await request(app).post(url)
      .set({ authorization: `Bearer ${token}` })
      .send({
        query: `mutation {
      createDepartment(name: "", managerId: ${dep.managerId}, description:"${dep.description}") {
        id, 
        name, 
        managerId, 
        description, 
        createdAt
      }
    }`
      })
      .expect(200)
    expect(res.body).toHaveProperty('errors')
  })

  it('throws error if invalid managerId is passed', async () => {
    const dep = await createRandomDepartmentData()

    const userIds = await prisma.user.findMany({ select: { id: true } })
    const invalidUserId = Number(userIds[userIds.length - 1].id) + Math.random() * 1_000_000

    const res = await request(app).post(url)
      .set({ authorization: `Bearer ${token}` })
      .send({
        query: `mutation {
      createDepartment(name: "", managerId: ${invalidUserId}, description:"${dep.description}") {
        id, 
        name, 
        managerId, 
        description, 
        createdAt
      }
    }`
      })
      .expect(200)
    expect(res.body).toHaveProperty('errors')
  })
})
