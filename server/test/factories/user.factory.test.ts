import { createRandomUser, createRandomUsers } from './user.factory'
import { User } from '../../src/models/user.model'

describe('createRandomUser', () => {
  it('returns user', () => {
    const user: User = createRandomUser()
    expect(user.password.length).toBe(10)
  })
})

describe('createRandomUsers', () => {
  it('should create the only if argument is not passed', () => {
    expect(createRandomUsers().length).toBe(1)
  })

  it('throws error if negative number or zero passed', () => {
    const NUMBER = -Math.floor(Math.random() * 100)
    expect(() => { createRandomUsers(NUMBER) }).toThrowError(`Negative value or zero passed\nvalue: ${NUMBER}`)
    expect(() => { createRandomUsers(0) }).toThrowError('Negative value or zero passed\nvalue: 0')
  })

  it('returns array contains passed number of users', () => {
    const number = Math.floor(Math.random() * 100) + 1
    expect(createRandomUsers(number).length).toBe(number)
  })
})
