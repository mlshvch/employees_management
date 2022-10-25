import { createRandomUserData, createRandomUsersData, createRandomUser, createRandomUsers } from './user.factory'
import { User } from '../../src/models/user.model'
import { prisma } from '../../db'

describe('createRandomUserData', () => {
  it('returns user', () => {
    const user: User = createRandomUserData()
    expect(user.password.length).toBe(10)
  })
})

describe('createRandomUsersData', () => {
  it('should create the only if argument is not passed', () => {
    expect(createRandomUsersData().length).toBe(1)
  })

  it('throws error if negative number or zero passed', () => {
    const NUMBER = -Math.floor(Math.random() * 100)
    expect(() => { createRandomUsersData(NUMBER) }).toThrowError(`Negative value or zero passed\nvalue: ${NUMBER}`)
    expect(() => { createRandomUsersData(0) }).toThrowError('Negative value or zero passed\nvalue: 0')
  })

  it('returns array contains passed number of users', () => {
    const number = Math.floor(Math.random() * 100) + 1
    expect(createRandomUsersData(number).length).toBe(number)
  })
})

describe('createRandomUser', () => {
  it('created valid database record', async () => {
    const user = await createRandomUser()
    expect(user).toHaveProperty('id')

    const selectedUser = await prisma.user.findFirst({
      where: { id: user.id, uid: user.uid }
    })

    expect(selectedUser).toEqual(user)
  })
})

describe('createRandomUsers', () => {
  it('creates the provided number of users', async () => {
    const usersNumber = await prisma.user.count()
    const number = Math.floor(Math.random() * 100)
    const createdUsersNumber = (await createRandomUsers(number)).count
    expect(await prisma.user.count()).toBeGreaterThanOrEqual(usersNumber + createdUsersNumber)
  })
})
