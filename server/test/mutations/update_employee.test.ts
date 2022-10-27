import request from 'supertest'
import { signInUser, signInAdmin } from '../factories/sign_in_user'
import { prisma } from '../../db'
import { selectRandomEmployee, createRandomEmployeeData, EmployeeType } from '../factories/employee.factory'
import { Employee, Position, Department } from '@prisma/client'
import { parseJSONBigIntToNumber } from '../../helpers/parse_bigint'
import { selectRandomPosition } from '../factories/position.factory'
import { selectRandomDepartment, createNonExistingDepartment } from '../factories/department.factory'
import { ResponseMessages, readResponseMessages } from '../../helpers/read_response_messages'
import { faker } from '@faker-js/faker'

/* eslint-disable @typescript-eslint/no-var-requires */
const app = require('../../src/app')
/* eslint-enable @typescript-eslint/no-var-requires */

afterAll(() => {
  app.close()
})

let adminToken: string
const url: string = '/graphql'
let responseMessages: ResponseMessages
beforeAll(async () => {
  adminToken = await signInAdmin()
  responseMessages = await readResponseMessages()
})

describe('updateEmployee mutation', () => {
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

  it('updates the employee if user is signed in and has ADMIN role', async () => {
    const emp: Employee = await selectRandomEmployee()
    const res = await request(app)
      .post(url)
      .set({ authorization: `Bearer ${adminToken}` })
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
      .expect(200)
    expect(res.body.data.updateEmployee).toEqual(parseJSONBigIntToNumber(emp))
  })

  it('updates the employee if user owns employee profile', async () => {
    const emp: Employee = await selectRandomEmployee()
    const token = await signInUser(emp.userId)
    const res = await request(app)
      .post(url)
      .set({ authorization: `Bearer ${token}` })
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
      .expect(200)
    expect(res.body.data.updateEmployee).toEqual(parseJSONBigIntToNumber(emp))
  })

  it('updates the employees if new name is valid', async () => {
    const emp: Employee = await selectRandomEmployee()
    const name: string = (await createRandomEmployeeData()).name
    console.log(typeof (name))
    const res = await request(app)
      .post(url)
      .set({ authorization: `Bearer ${adminToken}` })
      .send({
        query: `
        mutation {
          updateEmployee(
            id: ${emp.id},
            name: "${name}"
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
    expect(updatedUser.name).toEqual(name)
    expect(res.body.data.updateEmployee).toEqual(parseJSONBigIntToNumber(updatedUser))
  })

  it('updates the employees surname is new surname is valid', async () => {
    const emp: Employee = await selectRandomEmployee()
    const newData: EmployeeType = await createRandomEmployeeData()
    const res = await request(app)
      .post(url)
      .set({ authorization: `Bearer ${adminToken}` })
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

  it('updates the employees positionId if new positionId is valid', async () => {
    const emp: Employee = await selectRandomEmployee()
    const newData: Position = await selectRandomPosition()
    const res = await request(app)
      .post(url)
      .set({ authorization: `Bearer ${adminToken}` })
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
      .set({ authorization: `Bearer ${adminToken}` })
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

  it('updates the employees departmentId if departmentId is valid', async () => {
    const emp: Employee = await selectRandomEmployee()
    const newData: Department = await selectRandomDepartment()
    const res = await request(app)
      .post(url)
      .set({ authorization: `Bearer ${adminToken}` })
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
      .set({ authorization: `Bearer ${adminToken}` })
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
    expect(res.body.errors[0].message).toEqual(responseMessages.employee.error.blankName)
  })

  it('throws GraphQLError if provided invalid name', async () => {
    const emp: Employee = await selectRandomEmployee()
    const name: string = await faker.phone.imei()
    const res = await request(app)
      .post(url)
      .set({ authorization: `Bearer ${adminToken}` })
      .send({
        query: `
        mutation {
          updateEmployee(
            id: ${emp.id}
            name: "${name}"
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
    expect(res.body.errors[0].message).toEqual(responseMessages.employee.error.invalidName)
  })

  it('throws GraphQLError if provided empty surname', async () => {
    const emp: Employee = await selectRandomEmployee()
    const res = await request(app)
      .post(url)
      .set({ authorization: `Bearer ${adminToken}` })
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
    expect(res.body.errors[0].message).toEqual(responseMessages.employee.error.blankSurname)
  })

  it('throws GraphQLError if provided invalid surname', async () => {
    const emp: Employee = await selectRandomEmployee()
    const surname: string = await faker.phone.imei()
    const res = await request(app)
      .post(url)
      .set({ authorization: `Bearer ${adminToken}` })
      .send({
        query: `
        mutation {
          updateEmployee(
            id: ${emp.id}
            surname: "${surname}"
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
    expect(res.body.errors[0].message).toEqual(responseMessages.employee.error.invalidSurname)
  })

  it('throws GraphQLError if provided invalid departmentId', async () => {
    const emp: Employee = await selectRandomEmployee()
    const depId: number | bigint = (await createNonExistingDepartment()).id
    const res = await request(app)
      .post(url)
      .set({ authorization: `Bearer ${adminToken}` })
      .send({
        query: `
        mutation {
          updateEmployee(
            id: ${emp.id}
            departmentId: ${depId}
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
    expect(res.body.errors[0].message).toEqual(responseMessages.employee.error.invalidDepartment)
  })
})
