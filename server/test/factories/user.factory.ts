import { faker } from '@faker-js/faker'

export function createRandomUser (): any {
  return {
    id: faker.datatype.bigInt(),
    uid: faker.internet.email(),
    password: faker.random.alphaNumeric(10),
    tokens: JSON.parse('{}'),
    created_at: new Date()
  }
}

export function createRandomUsers (number: number = 1): object[] {
  if (number < 1) throw new Error(`Negative value or zero passed\nvalue: ${number}`)
  return new Array(number).fill(createRandomUser)
}
