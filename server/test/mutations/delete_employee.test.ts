import request from 'supertest'
import { signInUser } from '../factories/sign_in_user'
import { Employee } from '@prisma/client'
import { createRandomEmployee, createInvalidEmployee } from '../factories/employee.factory'
import { prisma } from '../../db'
import { parseJSONBigIntToNumber } from '../../helpers/parse_bigint'
/* eslint-disable @typescript-eslint/no-var-requires */
const app = require('../../src/app')
/* eslint-enable @typescript-eslint/no-var-requires */

afterAll(() => {
  app.close()
})

const url = '/graphql'
let token: string
let employee: Employee

beforeEach(async () => {
  token = await signInUser()
  employee = await createRandomEmployee()
})

describe('deleteEmployee mutation', () => {
  it('deletes employee if user signed-in and returns data of deletedEmployee', async () => {
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

  it("throws graphql error if employee doesn't exist", async () => {
    const invalidEmployee = await createInvalidEmployee()
    const res = await request(app)
      .post(url)
      .set({ authorization: `Bearer ${token}` })
      .send({
        query: `
        mutation { 
          deleteEmployee(id: ${Number(invalidEmployee.id)}) { 
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
  })
})
