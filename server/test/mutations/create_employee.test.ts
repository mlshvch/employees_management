import request from 'supertest'
import { signInUser } from '../factories/sign_in_user'
import { prisma } from '../../db'
import { createRandomEmployeeData, createEmployeeDataWithInvalidUserId, createEmployeeDataWithInvalidPositionId, createEmployeeDataWithInvalidDepartmentId } from '../factories/employee.factory'
/* eslint-disable @typescript-eslint/no-var-requires */
const app = require('../../src/app')

/* eslint-enable @typescript-eslint/no-var-requires */
const url = '/graphql'

let token: string

afterAll(() => {
  app.close()
})

beforeAll(async () => {
  token = await signInUser()
})

/* eslint-disable @typescript-eslint/restrict-template-expressions */
describe('Create Department', () => {
  it('creates department if all params passed and valid', async () => {
    const emp = await createRandomEmployeeData()
    await request(app)
      .post(url)
      .set({ authorization: `Bearer ${token}` })
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

  it('throws unauthorized code if token is not signed-in', async () => {
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

  it('throws error if userId is not passed', async () => {
    const emp = await createRandomEmployeeData()
    await request(app).post(url)
      .set({ authorization: `Bearer ${token}` })
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
      .set({ authorization: `Bearer ${token}` })
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
      .set({ authorization: `Bearer ${token}` })
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
      .set({ authorization: `Bearer ${token}` })
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
      .set({ authorization: `Bearer ${token}` })
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
      .set({ authorization: `Bearer ${token}` })
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
    expect(res.body.errors).toBeDefined()
  })

  it('throws GraphQL error if invalid positionId is passed', async () => {
    const emp = await createEmployeeDataWithInvalidPositionId()
    const res = await request(app).post(url)
      .set({ authorization: `Bearer ${token}` })
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
    expect(res.body.errors).toBeDefined()
  })

  it('throws GraphQL error if invalid DepartmentId is passed', async () => {
    const emp = await createEmployeeDataWithInvalidDepartmentId()
    const res = await request(app).post(url)
      .set({ authorization: `Bearer ${token}` })
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
    expect(res.body.errors).toBeDefined()
  })
})
