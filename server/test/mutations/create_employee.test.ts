import request from 'supertest'
import { signInUser, signInAdmin } from '../factories/sign_in_user'
import { prisma } from '../../db'
import { createRandomEmployeeData, createEmployeeDataWithInvalidUserId, createEmployeeDataWithInvalidPositionId, createEmployeeDataWithInvalidDepartmentId, createRandomEmployee } from '../factories/employee.factory'
import { readResponseMessages } from '../../helpers/read_response_messages'
/* eslint-disable @typescript-eslint/no-var-requires */
const app = require('../../src/app')

/* eslint-enable @typescript-eslint/no-var-requires */
const url = '/graphql'

let adminToken: string
let userToken: string
let responseMessages: any

afterAll(() => {
  app.close()
})

beforeAll(async () => {
  responseMessages = await readResponseMessages()
  adminToken = await signInAdmin()
  userToken = await signInUser()
})

/* eslint-disable @typescript-eslint/restrict-template-expressions */
describe('Create Employee', () => {
  it('throws unauthorized code if user is not signed-in', async () => {
    const emp = await createRandomEmployeeData()
    await request(app).post(url)
      .send({
        query: `      
        mutation {
          createEmployee(
            userId: ${emp.userId}
            name: "${emp.name}"
            surname: "${emp.surname}"
            positionId: "${emp.positionId}"
            staffMember: "${emp.staffMember}"
            departmentId: "${emp.departmentId}"
          ) {
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
      .expect(401)
  })

  it('creates employee if all params passed and valid and user has admin role', async () => {
    const emp = await createRandomEmployeeData()
    await request(app)
      .post(url)
      .set({ authorization: `Bearer ${adminToken}` })
      .send({
        query: `
      mutation {
        createEmployee(
          userId: ${emp.userId}
          name: "${emp.name}"
          surname: "${emp.surname}"
          positionId: ${emp.positionId}
          staffMember: ${emp.staffMember}
          departmentId: ${emp.departmentId}
        ){
          id
          userId
          name
          surname
          positionId
          staffMember
          departmentId
        }
      }`
      })
      .expect(200)
    expect(await prisma.employee.findFirst({ where: { userId: emp.userId } })).toBeTruthy()
  })

  it('returns forbidden error if user is not admin', async () => {
    const emp = await createRandomEmployeeData()
    const res = await request(app)
      .post(url)
      .set({ authorization: `Bearer ${userToken}` })
      .send({
        query: `
      mutation {
        createEmployee(
          userId: ${emp.userId}
          name: "${emp.name}"
          surname: "${emp.surname}"
          positionId: ${emp.positionId}
          staffMember: ${emp.staffMember}
          departmentId: ${emp.departmentId}
        ){
          id
          userId
          name
          surname
          positionId
          staffMember
          departmentId
        }
      }`
      })
    expect(res.body.errors).toBeTruthy()
    expect(res.body.errors[0].message).toEqual(responseMessages.common.forbidden)
  })

  it('throws error if userId is not passed', async () => {
    const emp = await createRandomEmployeeData()
    await request(app).post(url)
      .set({ authorization: `Bearer ${adminToken}` })
      .send({
        query: `
        mutation {
          createEmployee(
            name: "${emp.name}"
            surname: "${emp.surname}"
            positionId: ${emp.positionId}
            staffMember: ${emp.staffMember}
            departmentId: ${emp.departmentId}
          ) {
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
      .expect(400)
  })

  it('throws BadRequest error if name is not passed', async () => {
    const emp = await createRandomEmployeeData()
    await request(app).post(url)
      .set({ authorization: `Bearer ${adminToken}` })
      .send({
        query: `
        mutation {
          createEmployee(
            userId: ${emp.userId}
            surname: "${emp.surname}"
            positionId: ${emp.positionId}
            staffMember: ${emp.staffMember}
            departmentId: ${emp.departmentId}
          ) {
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
      .expect(400)
  })

  it('throws BadRequest error if surname is not passed', async () => {
    const emp = await createRandomEmployeeData()
    await request(app).post(url)
      .set({ authorization: `Bearer ${adminToken}` })
      .send({
        query: `
        mutation {
          createEmployee(
            userId: ${emp.userId}
            name: "${emp.name}"
            positionId: ${emp.positionId}
            staffMember: ${emp.staffMember}
            departmentId: ${emp.departmentId}
          ) {
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
      .expect(400)
  })

  it('return data if staffMember is not passed', async () => {
    const emp = await createRandomEmployeeData()
    await request(app).post(url)
      .set({ authorization: `Bearer ${adminToken}` })
      .send({
        query: `
        mutation {
          createEmployee(
            userId: ${emp.userId}
            name: "${emp.name}"
            surname: "${emp.surname}"
            positionId: ${emp.positionId}
            departmentId: ${emp.departmentId}
          ) {
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
    expect(await prisma.employee.findFirst({ where: { userId: emp.userId } })).toBeTruthy()
  })

  it('throws BadRequest error if departmentId is not passed', async () => {
    const emp = await createRandomEmployeeData()
    await request(app).post(url)
      .set({ authorization: `Bearer ${adminToken}` })
      .send({
        query: `
        mutation {
          createEmployee(
            userId: ${emp.userId}
            name: "${emp.name}"
            surname: "${emp.surname}"
            positionId: ${emp.positionId}
            staffMember: ${emp.staffMember}
          ) {
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
      .expect(400)
  })

  it('throws GraphQL error if invalid UserId is passed', async () => {
    const emp = await createEmployeeDataWithInvalidUserId()
    const res = await request(app).post(url)
      .set({ authorization: `Bearer ${adminToken}` })
      .send({
        query: `
        mutation {
          createEmployee(
            userId: ${emp.userId}
            name: "${emp.name}"
            surname: "${emp.surname}"
            positionId: ${emp.positionId}
            staffMember: ${emp.staffMember}
            departmentId: ${emp.departmentId}
          ) {
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
    expect(res.body.data.createEmployee).toBeNull()
    expect(res.body.errors[0].message).toEqual(responseMessages.employee.error.invalidUser)
  })

  it('throws GraphQL error if provided userId has already been taken', async () => {
    const emp = await createRandomEmployee()
    const res = await request(app).post(url)
      .set({ authorization: `Bearer ${adminToken}` })
      .send({
        query: `
        mutation {
          createEmployee(
            userId: ${emp.userId}
            name: "${emp.name}"
            surname: "${emp.surname}"
            positionId: ${emp.positionId}
            staffMember: ${emp.staffMember}
            departmentId: ${emp.departmentId}
          ) {
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
    expect(res.body.data.createEmployee).toBeNull()
    expect(res.body.errors[0].message).toEqual(responseMessages.employee.error.userAlreadyTaken)
  })

  it('throws GraphQL error if invalid positionId is passed', async () => {
    const emp = await createEmployeeDataWithInvalidPositionId()
    const res = await request(app).post(url)
      .set({ authorization: `Bearer ${adminToken}` })
      .send({
        query: `
        mutation {
          createEmployee(
            userId: ${emp.userId}
            name: "${emp.name}"
            surname: "${emp.surname}"
            positionId: ${emp.positionId}
            staffMember: ${emp.staffMember}
            departmentId: ${emp.departmentId}
          ) {
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
    expect(res.body.data.createEmployee).toBeNull()
    expect(res.body.errors[0].message).toEqual(responseMessages.employee.error.invalidPosition)
  })

  it('throws GraphQL error if invalid DepartmentId is passed', async () => {
    const emp = await createEmployeeDataWithInvalidDepartmentId()
    const res = await request(app).post(url)
      .set({ authorization: `Bearer ${adminToken}` })
      .send({
        query: `
        mutation {
          createEmployee(
            userId: ${emp.userId}
            name: "${emp.name}"
            surname: "${emp.surname}"
            positionId: ${emp.positionId}
            staffMember: ${emp.staffMember}
            departmentId: ${emp.departmentId}
          ) {
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
    expect(res.body.data.createEmployee).toBeNull()
    expect(res.body.errors[0].message).toEqual(responseMessages.employee.error.invalidDepartment)
  })
})
