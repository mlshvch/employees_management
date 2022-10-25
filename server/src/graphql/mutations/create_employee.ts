import { EmployeeType as GraphQLEmployeeType } from '../types/employee.type'
import { Employee } from '@prisma/client'
import { parseJSONBigIntToNumber } from '../../../helpers/parse_bigint'
import { GraphQLBoolean, GraphQLNonNull, GraphQLString, GraphQLError } from 'graphql'
import { GraphQLBigInt } from '../types/scalar/bigint.type'
import { prisma } from '../../../db'
import { readResponseMessages } from '../../../helpers/read_response_messages'
import { logger } from '../../logger'

const responseMessages = readResponseMessages()

const authorize = async (userId: bigint | number): Promise<void> => {
  const message = (await responseMessages).common.forbidden
  if ((await prisma.user.findFirst({ where: { id: userId } }))?.role !== 'ADMIN') throw new GraphQLError(message)
}

const checkUserId = async (userId: bigint | number): Promise<void> => {
  const invalidUserMessage = (await responseMessages).employee.error.invalidUser
  const alreadyTakenMessage = (await responseMessages).employee.error.userAlreadyTaken
  if ((await prisma.user.findFirst({ where: { id: userId } })) == null) throw new GraphQLError(invalidUserMessage)
  if ((await prisma.employee.findFirst({ where: { userId } })) != null) throw new GraphQLError(alreadyTakenMessage)
}

const checkPositionId = async (positionId: bigint | number): Promise<void> => {
  const message = (await responseMessages).employee.error.invalidPosition
  if ((await prisma.position.findFirst({ where: { id: positionId } })) == null) throw new GraphQLError(message)
}

const checkDepartmentId = async (departmentId: bigint | number): Promise<void> => {
  const message = (await responseMessages).employee.error.invalidDepartment
  if ((await prisma.department.findFirst({ where: { id: departmentId } })) == null) throw new GraphQLError(message)
}

export const createEmployeeMutation = {
  type: GraphQLEmployeeType,
  args: {
    userId: { type: new GraphQLNonNull(GraphQLBigInt) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    surname: { type: new GraphQLNonNull(GraphQLString) },
    positionId: { type: new GraphQLNonNull(GraphQLBigInt) },
    staffMember: { type: GraphQLBoolean },
    departmentId: { type: new GraphQLNonNull(GraphQLBigInt) }
  },
  async resolve (_parent: any, args: Employee, cntx: any): Promise<object | GraphQLError> {
    try {
      await authorize(cntx.user.id).catch((err) => { throw err })
      await checkUserId(args.userId).catch((err) => { throw err })
      await checkPositionId(args.positionId).catch((err) => { throw err })
      await checkDepartmentId(args.departmentId).catch((err) => { throw err })
    } catch (err: Error | any) {
      if (err instanceof GraphQLError) {
        return err
      } else {
        logger.error(err)
        return new GraphQLError('Validations failed')
      }
    }

    return await prisma.employee.create({ data: args })
      .then((employee) => parseJSONBigIntToNumber(employee))
      .catch((err: Error) => {
        logger.error(err)
        return new GraphQLError('Internal Error')
      })
  }
}
