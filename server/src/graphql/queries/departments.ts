import { prisma } from '../../../db'
import { GraphQLList } from 'graphql'
import { DepartmentType } from '../types/department.type'
import { parseJSONBigIntToNumber } from '../../../helpers/parse_bigint'

export const departmentsQuery = {
  type: new GraphQLList(DepartmentType),
  args: {},
  async resolve () {
    return (await prisma.department.findMany()).map((value) => parseJSONBigIntToNumber(value))
  }
}
