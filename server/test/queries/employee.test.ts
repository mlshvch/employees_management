import request from 'supertest'
import { signInUser } from '../factories/sign_in_user'
import { PrismaClient } from '@prisma/client'
import { parseJSONBigIntToNumber } from '../../helpers/parse_bigint'
import { selectRandomEmployee, createEmployeeDataWithInvalidUserId, EmployeeType } from '../factories/employee.factory'

/* eslint-disable @typescript-eslint/no-var-requires */
const app = require('../../src/app')
/* eslint-enable @typescript-eslint/no-var-requires */

afterAll(() => { app.close() })

let token: string
const url = '/graphql'
const prisma = new PrismaClient()

beforeEach(async () => { token = await signInUser() })

describe('employeeQuery', () => {
  it('returns data if user is signed-in', async () => {
    await request(app).post(url)
      .set({ authorization: `Bearer ${token}` })
      .send({ query: '{ employee { id, userId, name, surname, positionId, staffMember,departmentId } }' })
      .expect(200)
  })

  it('throws unauthorized error if user is not signed-in', async () => {
    await request(app).post(url)
      .send({ query: '{ employee { id, userId, name, surname, positionId, staffMember,departmentId } }' })
      .expect(401)
  })

  it('returns valid data', async () => {
    const res = await request(app)
      .post(url)
      .set({ authorization: `Bearer ${token}` })
      .send({ query: '{ employee { id, userId, name, surname, positionId, staffMember,departmentId } }' })
      .expect(200)
    const employees = (await prisma.employee.findMany()).map((value) => parseJSONBigIntToNumber(value))
    expect(res.body.data.employee).toEqual(employees)
  })

  it('returns selected data', async () => {
    const randomEmployee = await selectRandomEmployee()
    const data = await prisma.employee.findMany({ where: { id: randomEmployee.id } })
      .then((value) => value.map((employee) => parseJSONBigIntToNumber(employee)))
    const res = await request(app)
      .post(url)
      .set({ authorization: `Bearer ${token}` })
      .send({ query: `{ employee(id: ${randomEmployee.id}) { id, userId, name, surname, positionId, staffMember,departmentId } }` })
      .expect(200)
    expect(res.body.data.employee).toEqual(data)
  })

  it('returns selected data', async () => {
    const randomEmployee = await selectRandomEmployee()
    const data = await prisma.employee.findMany({ where: { id: randomEmployee.id } })
      .then((value) => value.map((employee) => parseJSONBigIntToNumber(employee)))
    const res = await request(app)
      .post(url)
      .set({ authorization: `Bearer ${token}` })
      .send({ query: `{ employee(id: ${randomEmployee.id}) { id, userId, name, surname, positionId, staffMember,departmentId } }` })
      .expect(200)
    expect(res.body.data.employee).toEqual(data)
  })

  it('returns empty array if passed userId is not found', async () => {
    const invalidEmployee: EmployeeType = await createEmployeeDataWithInvalidUserId()
    const res = await request(app)
      .post(url)
      .set({ authorization: `Bearer ${token}` })
      .send({ query: `{ employee(userId: ${Number(invalidEmployee.userId)}) { id, userId, name, surname, positionId, staffMember,departmentId } }` })
      .expect(200)
    expect(res.body.data.employee).toEqual([])
  })
})
