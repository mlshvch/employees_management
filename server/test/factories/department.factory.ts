import { faker } from '@faker-js/faker'
import { Department, PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export const createRandomDepartment = async (managerId: number | bigint, name: string = faker.name.jobArea(), description: string = faker.lorem.sentence()): Promise<Department> => {
  return await prisma.department.create({
    data: {
      name,
      managerId,
      description
    }
  })
}
