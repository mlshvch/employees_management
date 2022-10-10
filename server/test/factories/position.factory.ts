import { faker } from '@faker-js/faker'
import { Position, PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const createRandomPositionData = (name: string = faker.name.jobTitle(), id?: bigint | number): { id?: bigint | number, name: string } => {
  return { id, name }
}

export const createRandomPosition = async (name: string = faker.name.jobTitle()): Promise<Position> => {
  const positionNames = await prisma.position.findMany({ select: { name: true } })

  do {
    name = faker.name.jobTitle()
  } while (positionNames.includes({ name }))

  return await prisma.position.create({ data: { name } })
}

export const createInvalidPositionData = async (): Promise<{ id?: bigint | number, name: string }> => {
  const invalidId = await prisma.position.findMany({ select: { id: true } })
    .then((idList: Array<{ id: bigint }>) => { return Math.floor(Number(idList[idList.length - 1].id) + Math.floor(Math.random() * 1_000_000)) })

  return createRandomPositionData(faker.name.jobTitle(), invalidId)
}

export const selectRandomPosition = async (): Promise<Position> => {
  return await prisma.position.findMany()
    .then((positions: Position[]) => {
      return positions[Math.floor(Math.random() * (positions.length - 1))]
    })
}
