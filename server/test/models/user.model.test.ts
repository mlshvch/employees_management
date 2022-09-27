import { PrismaClient } from '@prisma/client'
import { createRandomUser } from '../factories/user.factory'
import { faker } from '@faker-js/faker'

describe('user model', () => {
  const prisma = new PrismaClient()
  let userData: any

  beforeEach(() => {
    userData = createRandomUser()
  })

  it('saves to the database if all data correct', async () => {
    const createdUser = await prisma.user.create({ data: userData })
    expect(await prisma.user.findFirst()).toEqual(createdUser)
  })

  it('save if id is not passed', async () => {
    delete userData.id
    const createdUser = await prisma.user.create({ data: userData })
    const selectedUser = await prisma.user.findFirstOrThrow({
      where: {
        uid: userData.uid
      }
    })
    expect(selectedUser).toHaveProperty('id')
    expect(selectedUser).toEqual(createdUser)
  })

  it('save if created_at is not passed', async () => {
    delete userData.created_at
    const createdUser = await prisma.user.create({ data: userData })
    const selectedUser = await prisma.user.findFirstOrThrow({
      where: {
        id: userData.id
      }
    })
    expect(selectedUser).toHaveProperty('created_at')
    expect(selectedUser).toEqual(createdUser)
  })

  it('do not save if password length is less than 8 symbols', () => {
    userData.password = faker.random.alphaNumeric(Math.floor(Math.random() * 7))
    expect(userData.password.length).toBeLessThan(8)

    /* eslint-disable @typescript-eslint/no-unused-expressions */
    expect(async () => await prisma.user.create({
      data: userData
    })).toThrowError
    /* eslint-enable @typescript-eslint/no-unused-expressions */
  })
})
