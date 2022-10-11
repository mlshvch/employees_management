import request from 'supertest'
import { signInUser } from '../factories/sign_in_user'
import { prisma } from '../../db'
import { selectRandomEmployee, createRandomEmployeeData, EmployeeType } from '../factories/employee.factory'
import { Employee, Position, Department } from '@prisma/client'
import { parseJSONBigIntToNumber } from '../../helpers/parse_bigint'
import { selectRandomPosition } from '../factories/position.factory'
import { selectRandomDepartment } from '../factories/department.factory'

/* eslint-disable @typescript-eslint/no-var-requires */
const app = require('../../src/app')
/* eslint-enable @typescript-eslint/no-var-requires */

afterAll(() => {
  app.close()
})

let token: string
const url: string = '/graphql'

beforeAll(async () => {
  token = await signInUser()
})

describe('updateEmployee mutation', () => {
  it('updates the employee if user is signed in', async () => {
    const emp: Employee = await selectRandomEmployee()
    const newData: EmployeeType = await createRandomEmployeeData()
    const res = await request(app)
      .post(url)
      .set({ authorization: `Bearer ${token}` })
      .send({
        query: `
        mutation {
          updateEmployee(
            id: ${emp.id}
            name: "${newData.name}"
          ) {
            id,
            userId,
            name,
            surname,
            positionId,
            staffMember,
            departmentId
          }
        }
      `
      })
      .expect(200)
    expect((await prisma.employee.findFirstOrThrow({ where: { id: emp.id } })).name).toEqual(newData.name)
    expect(res.body.data).toBeTruthy()
  })

  it('throws unauthorized code if user is not signed in ', async () => {
    const emp = await selectRandomEmployee()
    await request(app)
      .post(url)
      .send({
        query: `
        mutation {
          updateEmployee(
            id: ${emp.id}
          ) {
            id,
            userId,
            name,
            surname,
            positionId,
            staffMember,
            departmentId
          }
        }
      `
      })
      .expect(401)
  })

  it('updates the employees name', async () => {
    const emp: Employee = await selectRandomEmployee()
    const newData: EmployeeType = await createRandomEmployeeData()
    const res = await request(app)
      .post(url)
      .set({ authorization: `Bearer ${token}` })
      .send({
        query: `
        mutation {
          updateEmployee(
            id: ${emp.id}
            name: "${newData.name}"
          ) {
            id,
            userId,
            name,
            surname,
            positionId,
            staffMember,
            departmentId
          }
        }
      `
      })
      .expect(200)
    const updatedUser: Employee = await prisma.employee.findFirstOrThrow({ where: { id: emp.id } })
    expect(updatedUser.name).toEqual(newData.name)
    expect(res.body.data.updateEmployee).toEqual(parseJSONBigIntToNumber(updatedUser))
  })

  it('updates the employees surname', async () => {
    const emp: Employee = await selectRandomEmployee()
    const newData: EmployeeType = await createRandomEmployeeData()
    const res = await request(app)
      .post(url)
      .set({ authorization: `Bearer ${token}` })
      .send({
        query: `
        mutation {
          updateEmployee(
            id: ${emp.id}
            surname: "${newData.surname}"
          ) {
            id,
            userId,
            name,
            surname,
            positionId,
            staffMember,
            departmentId
          }
        }
      `
      })
      .expect(200)
    const updatedUser: Employee = await prisma.employee.findFirstOrThrow({ where: { id: emp.id } })
    expect(updatedUser.surname).toEqual(newData.surname)
    expect(res.body.data.updateEmployee).toEqual(parseJSONBigIntToNumber(updatedUser))
  })

  it('updates the employees positionId', async () => {
    const emp: Employee = await selectRandomEmployee()
    const newData: Position = await selectRandomPosition()
    const res = await request(app)
      .post(url)
      .set({ authorization: `Bearer ${token}` })
      .send({
        query: `
        mutation {
          updateEmployee(
            id: ${emp.id}
            positionId: ${newData.id}
          ) {
            id,
            userId,
            name,
            surname,
            positionId,
            staffMember,
            departmentId
          }
        }
      `
      })
      .expect(200)
    const updatedUser: Employee = await prisma.employee.findFirstOrThrow({ where: { id: emp.id } })
    expect(updatedUser.positionId).toEqual(newData.id)
    expect(res.body.data.updateEmployee).toEqual(parseJSONBigIntToNumber(updatedUser))
  })

  it('updates the employees staffMember status', async () => {
    const emp = await selectRandomEmployee()
    const res = await request(app)
      .post(url)
      .set({ authorization: `Bearer ${token}` })
      .send({
        query: `
        mutation {
          updateEmployee(
            id: ${emp.id}
            staffMember: false
          ) {
            id,
            userId,
            name,
            surname,
            positionId,
            staffMember,
            departmentId
          }
        }
      `
      })
      .expect(200)
    const updatedUser: Employee = await prisma.employee.findFirstOrThrow({ where: { id: emp.id } })
    expect(updatedUser.staffMember).toBeFalsy()
    expect(res.body.data.updateEmployee).toEqual(parseJSONBigIntToNumber(updatedUser))
  })

  it('updates the employees departmentId', async () => {
    const emp: Employee = await selectRandomEmployee()
    const newData: Department = await selectRandomDepartment()
    const res = await request(app)
      .post(url)
      .set({ authorization: `Bearer ${token}` })
      .send({
        query: `
        mutation {
          updateEmployee(
            id: ${emp.id}
            departmentId: ${newData.id}
          ) {
            id,
            userId,
            name,
            surname,
            positionId,
            staffMember,
            departmentId
          }
        }
      `
      })
      .expect(200)
    const updatedUser: Employee = await prisma.employee.findFirstOrThrow({ where: { id: emp.id } })
    expect(updatedUser.departmentId).toEqual(newData.id)
    expect(res.body.data.updateEmployee).toEqual(parseJSONBigIntToNumber(updatedUser))
  })

  it('throws GraphQLError if provided empty name', async () => {
    const emp: Employee = await selectRandomEmployee()
    const res = await request(app)
      .post(url)
      .set({ authorization: `Bearer ${token}` })
      .send({
        query: `
        mutation {
          updateEmployee(
            id: ${emp.id}
            name: ""
          ) {
            id,
            userId,
            name,
            surname,
            positionId,
            staffMember,
            departmentId
          }
        }
      `
      })
      .expect(200)
    expect(res.body.data.updateEmployee).toBeNull()
    expect(res.body.errors[0].message).toEqual('name can not be blank')
  })

  it('throws GraphQLError if provided empty surname', async () => {
    const emp: Employee = await selectRandomEmployee()
    const res = await request(app)
      .post(url)
      .set({ authorization: `Bearer ${token}` })
      .send({
        query: `
        mutation {
          updateEmployee(
            id: ${emp.id}
            surname: ""
          ) {
            id,
            userId,
            name,
            surname,
            positionId,
            staffMember,
            departmentId
          }
        }
      `
      })
      .expect(200)
    expect(res.body.data.updateEmployee).toBeNull()
    expect(res.body.errors[0].message).toEqual('surname can not be blank')
  })
})
