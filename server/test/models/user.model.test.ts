import { prisma } from '../../db'
import { createRandomUserData } from '../factories/user.factory'
import { faker } from '@faker-js/faker'

describe('user model', () => {
  let userData: any

  beforeEach(() => {
    userData = createRandomUserData()
  })

  it('saves to the database if all data correct', async () => {
    userData.id = faker.datatype.bigInt()
    await prisma.user.create({ data: userData })
    expect(await prisma.user.findFirst({ where: { uid: userData.uid } })).toBeTruthy()
  })

  it('save if id is not passed', async () => {
    await prisma.user.create({ data: userData })
    const selectedUser = await prisma.user.findFirstOrThrow({
      where: {
        uid: userData.uid
      }
    })
    expect(selectedUser).toBeTruthy()
    expect(selectedUser).toHaveProperty('id')
    expect(selectedUser.id).toBeTruthy()
  })

  it('save if created_at is not passed', async () => {
    delete userData.created_at
    const createdUser = await prisma.user.create({ data: userData })
    const selectedUser = await prisma.user.findFirstOrThrow({
      where: {
        uid: userData.uid
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
