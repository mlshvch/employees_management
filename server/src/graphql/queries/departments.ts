import { PrismaClient } from '@prisma/client'
import { GraphQLList } from 'graphql'
import { DepartmentType } from '../types/department.type'
import { parseJSONBigIntToNumber } from '../../../helpers/parse_bigint'
const prisma = new PrismaClient()

export const departmentsQuery = {
  type: new GraphQLList(DepartmentType),
  args: {},
  async resolve () {
    return (await prisma.department.findMany()).map((value) => parseJSONBigIntToNumber(value))
  }
}
