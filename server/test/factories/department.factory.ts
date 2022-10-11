import { faker } from '@faker-js/faker'
import { Department, User } from '@prisma/client'
import { createRandomUser } from './user.factory'
import { prisma } from '../../db'

const selectRandomUser = async (): Promise<User> => {
  return await prisma.user.findMany().then(async (users: User[]): Promise<User> => { return users.length > 0 ? users[Math.floor(Math.random() * users.length)] : await createRandomUser() })
}

export const createNonExistingDepartment = async (): Promise<Department> => {
  const departmentIds = await prisma.user.findMany({ select: { id: true } })
  const invalidDepartment = await createRandomDepartment()
  invalidDepartment.id = BigInt(Number(departmentIds[departmentIds.length - 1].id) + Math.round(Math.random() * 1_000_000))
  return invalidDepartment
}

export const createRandomDepartmentData = async (managerId: number = 0): Promise<{ name: string, managerId: number | bigint, description: string }> => {
  return {
    name: faker.company.name(),
    managerId: managerId === 0 ? (await selectRandomUser()).id : managerId,
    description: faker.lorem.paragraph()
  }
}

export const createRandomDepartment = async (managerId: number | bigint = 0, name: string = faker.name.jobArea(), description: string = faker.lorem.sentence()): Promise<Department> => {
  const departmentNames: Array<{ name: string }> = await prisma.department.findMany({ select: { name: true } })
  do {
    name = faker.random.word()
  } while (departmentNames.includes({ name }))

  return await prisma.department.create({
    data: {
      name,
      managerId: managerId === 0 ? (await selectRandomUser()).id : managerId,
      description
    }
  })
}

export const selectRandomDepartment = async (): Promise<Department> => {
  return await prisma.department.findMany()
    .then((departments: Department[]) => {
      if (departments.length === 0) throw new Error('There are no departments created. Creating the valid one')
      return departments[Math.floor(Math.random() * (departments.length - 1))]
    })
    .catch(async (err: Error) => {
      console.log(err.message)
      return await createRandomDepartment()
    })
}
