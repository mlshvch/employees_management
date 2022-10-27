import { EmployeeType } from '../types/employee.type'
import { GraphQLNonNull, GraphQLError } from 'graphql'
import { GraphQLBigInt } from '../types/scalar/bigint.type'
import { Employee, User } from '@prisma/client'
import { parseJSONBigIntToNumber } from '../../../helpers/parse_bigint'
import { prisma } from '../../../db'
import { readResponseMessages, ResponseMessages } from '../../../helpers/read_response_messages'
import { handleValidationError } from '../../../helpers/handle_validation_error'
import { logger } from '../../logger'

const responseMessages: Promise<ResponseMessages> = readResponseMessages()

const authorize = async (userId: number | bigint, employeeId: number | bigint): Promise<void> => {
  const message = (await responseMessages).common.forbidden
  const user: User | null = await prisma.user.findFirst({ where: { id: userId } })
  const employee: Employee | null = await prisma.employee.findFirst({ where: { id: employeeId } })
  if (user?.role !== 'ADMIN' && user?.id !== employee?.userId) throw new GraphQLError(message)
}

const checkEmployeeId = async (employeeId: number | bigint): Promise<void> => {
  const message = (await responseMessages).employee.error.notExist
  if ((await prisma.employee.findFirst({ where: { id: employeeId } })) == null) throw new GraphQLError(message)
}

export const deleteEmployeeMutation = {
  type: EmployeeType,
  args: {
    id: { type: new GraphQLNonNull(GraphQLBigInt) }
  },
  async resolve (_parent: any, args: { id: bigint | number }, cntx: any): Promise<object | GraphQLError> {
    try {
      await checkEmployeeId(args.id).catch((err) => { throw err })
      await authorize(cntx.user.id, args.id).catch((err) => { throw err })
    } catch (err: Error | GraphQLError | any) {
      return handleValidationError(err)
    }

    return await prisma.employee.delete({ where: { id: args.id } })
      .then((employee: Employee) => parseJSONBigIntToNumber(employee))
      .catch(async (err: Error) => {
        logger.error(err)
        return new GraphQLError((await responseMessages).common.internalError)
      })
  }
}
