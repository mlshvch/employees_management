import request from 'supertest'
import { signInUser, signInAdmin } from '../factories/sign_in_user'
import { createRandomDepartmentData, createRandomDepartment } from '../factories/department.factory'
import { prisma } from '../../db'
import { createNonExistingUser } from '../factories/user.factory'
import { readResponseMessages, ResponseMessages } from '../../helpers/read_response_messages'
/* eslint-disable @typescript-eslint/no-var-requires */
const app = require('../../src/app')
/* eslint-enable @typescript-eslint/no-var-requires */
const url = '/graphql'

let userToken: string
let adminToken: string
const responseMessages: Promise<ResponseMessages> = readResponseMessages()

afterAll(() => {
  app.close()
})

beforeAll(async () => {
  userToken = await signInUser()
  adminToken = await signInAdmin()
})

describe('Create Department', () => {
  it('creates department if all params passed and valid', async () => {
    const dep = await createRandomDepartmentData()
    await request(app).post(url)
      .set({ authorization: `Bearer ${adminToken}` })
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

  it('returns forbidden error if user is not admin', async () => {
    const dep = await createRandomDepartmentData()
    const res = await request(app).post(url)
      .set({ authorization: `Bearer ${userToken}` })
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
    expect(res.body.errors).toBeTruthy()
    expect(res.body.errors[0].message).toEqual((await responseMessages).common.forbidden)
  })

  it('throws unauthorized code if user is not signed-in', async () => {
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
      .set({ authorization: `Bearer ${adminToken}` })
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
    expect(res.body.errors[0].message).toEqual((await responseMessages).department.error.blankName)
  })

  it('throws error if name is already taken', async () => {
    const dep = await createRandomDepartment()
    const res = await request(app).post(url)
      .set({ authorization: `Bearer ${adminToken}` })
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
    expect(res.body).toHaveProperty('errors')
    expect(res.body.errors[0].message).toEqual((await responseMessages).department.error.nameAlreadyTaken)
  })

  it('throws error if invalid managerId is passed', async () => {
    const dep = await createRandomDepartmentData()

    const invalidUserId = (await createNonExistingUser()).id

    const res = await request(app).post(url)
      .set({ authorization: `Bearer ${adminToken}` })
      .send({
        query: `mutation {
        createDepartment(name: "${dep.name}", managerId: ${invalidUserId}, description:"${dep.description}") {
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
    expect(res.body.errors[0].message).toEqual((await responseMessages).department.error.invalidManager)
  })
})
