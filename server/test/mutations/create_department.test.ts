import request from 'supertest'
import { signInUser } from '../factories/sign_in_user'
import { createRandomDepartmentData } from '../factories/department.factory'
import { prisma } from '../../db'
import { createNonExistingUser } from '../factories/user.factory'
import { readResponseMessages } from '../../helpers/read_response_messages'
/* eslint-disable @typescript-eslint/no-var-requires */
const app = require('../../src/app')
/* eslint-enable @typescript-eslint/no-var-requires */
const url = '/graphql'

let token: string
const responseMessages = readResponseMessages()

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
    expect(res.body.errors[0].message).toEqual((await responseMessages).department.error.blank_name)
  })

  it('throws error if invalid managerId is passed', async () => {
    const dep = await createRandomDepartmentData()

    const invalidUserId = (await createNonExistingUser()).id

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
