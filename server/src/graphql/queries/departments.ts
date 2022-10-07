import { PrismaClient } from '@prisma/client'
import { GraphQLList } from 'graphql'
import { DepartmentType } from '../types/department.type'

const prisma = new PrismaClient()

export const departmentsQuery = {
  type: new GraphQLList(DepartmentType),
  args: {},
  async resolve () {
    return (await prisma.department.findMany()).map((value) => JSON.parse(JSON.stringify(value, (_, v) => typeof v === 'bigint' ? Number(v) : v)))
  }
}
