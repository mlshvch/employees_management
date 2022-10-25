import request from 'supertest'
import { signInAdmin, signInUser } from '../factories/sign_in_user'
import { Employee } from '@prisma/client'
import { createRandomEmployee } from '../factories/employee.factory'
import { prisma } from '../../db'
import { parseJSONBigIntToNumber } from '../../helpers/parse_bigint'
import { readResponseMessages, ResponseMessages } from '../../helpers/read_response_messages'
import { findUserByToken } from '../../helpers/find_user_by_token'
/* eslint-disable @typescript-eslint/no-var-requires */
const app = require('../../src/app')
/* eslint-enable @typescript-eslint/no-var-requires */

afterAll(() => {
  app.close()
})

const url = '/graphql'
let userToken: string
let adminToken: string
let employee: Employee
let responseMessages: ResponseMessages

beforeAll(async () => {
  responseMessages = await readResponseMessages()
})

beforeEach(async () => {
  userToken = await signInUser()
  adminToken = await signInAdmin()
  employee = await createRandomEmployee()
})

describe('deleteEmployee mutation', () => {
  it('throws unauthorized code if user is not signed in ', async () => {
    await request(app)
      .post(url)
      .send({
        query: `
            mutation {
            deleteEmployee(
            id: ${employee.id}
                    ) {
                    id,
                    userId,
                    name,
                    surname,
                    positionId,
                    staffMember,
                    departmentId
                    }
                    }`
      })
      .expect(401)
  })

  it("returns forbidden error if employee's profile doesn't belong to user", async () => {
    const userId = await findUserByToken(userToken)
    const employee = await prisma.employee.findFirst({
      where: {
        userId: {
          not: userId
        }
      }
    })
    const res = await request(app)
      .post(url)
      .set({ authorization: `Bearer ${userToken}` })
      .send({
        query: `
        mutation {
        deleteEmployee(id: ${Number(employee?.id)}) {
                id
                userId
                name
                surname
                positionId
                staffMember
                departmentId
                }
                }
        `
      })
      .expect(200)
    expect(res.body.data.deleteEmployee).toBeNull()
    expect(res.body.errors[0].message).toEqual(responseMessages.common.forbidden)
  })

  it('deletes employee if user has ADMIN role', async () => {
    const res = await request(app)
      .post(url)
      .set({ authorization: `Bearer ${adminToken}` })
      .send({
        query: `
            mutation {
            deleteEmployee(id: ${employee.id}) {
                    id
                    userId
                    name
                    surname
                    positionId
                    staffMember
                    departmentId
                    }
                    }
            `
      })
      .expect(200)
    expect(res.body.data.deleteEmployee).toEqual(parseJSONBigIntToNumber(employee))
    expect(await prisma.employee.findFirst({ where: { id: employee.id } })).toBeNull()
  })

  it('deletes employee if user is signed-in and owns employee profile', async () => {
    const token: string = (await signInUser(employee.userId))
    const res = await request(app)
      .post(url)
      .set({ authorization: `Bearer ${token}` })
      .send({
        query: `
        mutation {
          deleteEmployee(id: ${employee.id}) {
            id
            userId
            name
            surname
            positionId
            staffMember
            departmentId
          }
        }
        `
      })
      .expect(200)
    expect(res.body.data.deleteEmployee).toEqual(parseJSONBigIntToNumber(employee))
    expect(await prisma.employee.findFirst({ where: { id: employee.id } })).toBeNull()
  })

  it("throws graphql error if employee doesn't exist", async () => {
    const invalidEmployeeId = Number(await prisma.employee.count() * 1_000_000)
    const res = await request(app)
      .post(url)
      .set({ authorization: `Bearer ${adminToken}` })
      .send({
        query: `
        mutation { 
          deleteEmployee(id: ${invalidEmployeeId}) { 
            id,
            userId,
            name,
            surname,
            positionId,
            staffMember,
            departmentId
          }
        }`
      })
      .expect(200)
    expect(res.body.data.deleteEmployee).toBeNull()
    expect(res.body).toHaveProperty('errors')
    expect(res.body.errors[0].message).toEqual(responseMessages.employee.error.notExist)
  })
})
