import { createRandomPositionData, createRandomPosition, createInvalidPositionData } from './position.factory'
import { faker } from '@faker-js/faker'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
describe('position factories', () => {
  describe('createRandomPositionData', () => {
    it('creates object of position type', () => {
      const position = createRandomPositionData()
      expect(position).toHaveProperty('id')
      expect(position).toHaveProperty('name')
    })

    it('creates object with undefinded id if it is not passed', () => {
      const position = createRandomPositionData()
      expect(position.id).toBeUndefined()
      expect(position.name).toBeTruthy()
    })

    it('creates object with passed id and name', () => {
      const id = faker.datatype.bigInt()
      const name = faker.word.noun()
      const position = createRandomPositionData(name, id)
      expect(position.id).toEqual(id)
      expect(position.name).toEqual(name)
    })
  })

  describe('createRandomPosition', () => {
    it('creates record in database', async () => {
      const position = await createRandomPosition()
      expect(await prisma.position.findFirst({ where: { id: position.id } })).toBeTruthy()
    })
  })

  describe('createInvalidPositionData', () => {
    it('returns invalid data', async () => {
      const invalidPosition = await createInvalidPositionData()
      expect(await prisma.position.findFirst({ where: { id: invalidPosition.id } })).toBeNull()
    })
  })
})
