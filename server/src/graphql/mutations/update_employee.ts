import { GraphQLBoolean, GraphQLString, GraphQLNonNull, GraphQLError } from 'graphql'
import { EmployeeType } from '../types/employee.type'
import { GraphQLBigInt } from '../types/scalar/bigint.type'
import { prisma } from '../../../db'
import { Employee, User } from '@prisma/client'
import { parseJSONBigIntToNumber } from '../../../helpers/parse_bigint'
import { readResponseMessages, ResponseMessages } from '../../../helpers/read_response_messages'
import { handleValidationError } from '../../../helpers/handle_validation_error'

const responseMessages: Promise<ResponseMessages> = readResponseMessages()

const authorize = async (userId: number | bigint, employeeId: number | bigint): Promise<void> => {
  const message = (await responseMessages).common.forbidden
  const user: User | null = await prisma.user.findFirst({ where: { id: userId } })
  const employee: Employee | null = await prisma.employee.findFirst({ where: { id: employeeId } })
  if (user?.role !== 'ADMIN' && user?.id !== employee?.userId) throw new GraphQLError(message)
}

const checkEmployeeId = async (employeeId: bigint | number): Promise<void> => {
  const invalidEmploueeIdMessage = (await responseMessages).employee.error.notExist
  if ((await prisma.employee.findFirst({ where: { id: employeeId } })) == null) throw new GraphQLError(invalidEmploueeIdMessage)
}

const checkName = async (name: string): Promise<void> => {
  const blankNameMessage = (await responseMessages).employee.error.blankName
  const invalidNameMessage = (await responseMessages).employee.error.invalidName
  const invalidCharactersPattern = /^[A-z ,.'-]+$/
  if (!name) throw new GraphQLError(blankNameMessage)
  if (name.match(invalidCharactersPattern) == null) throw new GraphQLError(invalidNameMessage)
}

const checkSurname = async (name: string): Promise<void> => {
  const blankSurnameMessage = (await responseMessages).employee.error.blankSurname
  const invalidSurnameMessage = (await responseMessages).employee.error.invalidSurname
  const invalidCharactersPattern = /^[A-z ,.'-]+$/
  if (!name) throw new GraphQLError(blankSurnameMessage)
  if (name.match(invalidCharactersPattern) == null) throw new GraphQLError(invalidSurnameMessage)
}

const checkPositionId = async (positionId: bigint | number): Promise<void> => {
  const message = (await responseMessages).employee.error.invalidPosition
  if ((await prisma.position.findFirst({ where: { id: positionId } })) == null) throw new GraphQLError(message)
}

const checkDepartmentId = async (departmentId: bigint | number): Promise<void> => {
  const message = (await responseMessages).employee.error.invalidDepartment
  if ((await prisma.department.findFirst({ where: { id: departmentId } })) == null) throw new GraphQLError(message)
}

export const updateEmployeeMutation = {
  type: EmployeeType,
  args: {
    id: { type: new GraphQLNonNull(GraphQLBigInt) },
    name: { type: (GraphQLString) },
    surname: { type: (GraphQLString) },
    positionId: { type: (GraphQLBigInt) },
    staffMember: { type: GraphQLBoolean },
    departmentId: { type: (GraphQLBigInt) }
  },
  async resolve (_parent: any, args: { id: bigint | number, name?: string, surname?: string, positionId?: number | bigint, staffMember?: boolean, departmentId?: bigint | number }, cntx: any): Promise<object | GraphQLError> {
    try {
      await checkEmployeeId(args.id).catch((err) => { throw err })
      await authorize(cntx.user.id, args.id).catch((err) => { throw err })
      if (typeof (args.name) === 'string') await checkName(args.name).catch((err) => { throw err })
      if (typeof (args.surname) === 'string') await checkSurname(args.surname).catch((err) => { throw err })
      if (args.positionId) await checkPositionId(args.positionId).catch((err) => { throw err })
      if (args.departmentId) await checkDepartmentId(args.departmentId).catch((err) => { throw err })
    } catch (err: any) {
      return handleValidationError(err)
    }
    console.log(args, (await prisma.employee.findFirst({ where: { id: args.id } }))?.name)
    return await prisma.employee.update({
      where: {
        id: args.id
      },
      data: {
        name: args?.name,
        surname: args?.surname,
        positionId: args?.positionId,
        staffMember: args?.staffMember,
        departmentId: args?.departmentId
      }
    })
      .then((employee: Employee) => parseJSONBigIntToNumber(employee))
      .catch(async (_err: Error) => new GraphQLError((await responseMessages).common.internalError))
  }
}
