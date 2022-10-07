import { faker } from '@faker-js/faker'
import { User, PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export function createRandomUserData (): any {
  return {
    uid: faker.internet.email(),
    password: faker.random.alphaNumeric(10),
    tokens: JSON.parse('{}'),
    created_at: new Date()
  }
}

export function createRandomUsersData (number: number = 1): Array<{ uid: string, password: string, tokens: {} }> {
  if (number < 1) throw new Error(`Negative value or zero passed\nvalue: ${number}`)
  return new Array(number).fill(true).map(() => { return createRandomUserData() })
}

export const createRandomUser = async (): Promise<User> => {
  return await prisma.user.create({ data: createRandomUserData() })
}

export const createRandomUsers = async (number: number = 1): Promise<{ count: number }> => {
  return await prisma.user.createMany({
    data: createRandomUsersData(number)
  })
}
