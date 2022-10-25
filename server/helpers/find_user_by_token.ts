import { prisma } from '../db'

export const findUserByToken = async (token: string): Promise<any> => {
  return await prisma.$queryRaw<Array<{ id: bigint, key: string }>>`
  SELECT id, key
  FROM "User",json_each(json("User".tokens));`
    .then((users: Array<{ id: bigint | number, key: string }>) => {
      return users.find((item) => { return item.key === token })?.id
    })
}
