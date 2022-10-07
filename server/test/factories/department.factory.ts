import { faker } from '@faker-js/faker'
import { Department, PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export const createRandomDepartment = async (managerId: number | bigint, name: string = faker.name.jobArea()): Promise<Department> => {
  return await prisma.department.create({
    data: {
      name,
      managerId
    }
  })
}
