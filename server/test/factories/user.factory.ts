import { faker } from '@faker-js/faker'
import { User, PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

export function createRandomUserData (uid: string = faker.internet.email(), password: string = faker.random.alphaNumeric(10)): any {
  return {
    uid,
    password,
    tokens: JSON.parse('{}'),
    created_at: new Date()
  }
}

export function createRandomUsersData (number: number = 1): Array<{ uid: string, password: string, tokens: {} }> {
  if (number < 1) throw new Error(`Negative value or zero passed\nvalue: ${number}`)
  return new Array(number).fill(true).map(() => { return createRandomUserData() })
}

export const createNonExistingUser = async (): Promise<User> => {
  const userIds = await prisma.user.findMany({ select: { id: true } })
  const invalidUser = createRandomUserData()
  invalidUser.id = Number(userIds[userIds.length - 1].id) + Math.round(Math.random() * 1_000_000)
  return invalidUser
}

export const createRandomUser = async (uid: string = faker.internet.email(), password: string = faker.random.alphaNumeric(10)): Promise<User> => {
  const user = createRandomUserData(uid, password)
  return await prisma.user.create({
    data: {
      uid: user.uid,
      password: await bcrypt.hash(user.password, 10),
      tokens: user.tokens
    }
  })
}

export const createRandomUsers = async (number: number = 1): Promise<{ count: number }> => {
  return await prisma.user.createMany({
    data: createRandomUsersData(number)
  })
}

export const selectRandomUser = async (): Promise<User> => {
  return await prisma.user.findMany()
    .then((users: User[]) => {
      if (users.length === 0) throw new Error('There are no users created. Creating the valid one')
      return users[Math.floor(Math.random() * (users.length - 1))]
    })
    .catch(async (err: Error) => {
      console.log(err.message)
      return await createRandomUser()
    })
}
