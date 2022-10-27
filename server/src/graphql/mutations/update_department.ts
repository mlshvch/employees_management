import { GraphQLString, GraphQLNonNull, GraphQLError } from 'graphql'
import { DepartmentType } from '../types/department.type'
import { GraphQLBigInt } from '../types/scalar/bigint.type'
import { prisma } from '../../../db'
import { parseJSONBigIntToNumber } from '../../../helpers/parse_bigint'
import { readResponseMessages, ResponseMessages } from '../../../helpers/read_response_messages'
import { User, Department } from '@prisma/client'
import { handleValidationError } from '../../../helpers/handle_validation_error'

const responseMessages: Promise<ResponseMessages> = readResponseMessages()

const checkName = async (name: string): Promise<void> => {
  const blankNameMessage = (await responseMessages).department.error.blankName
  const nameAlreadyTakenMessage = (await responseMessages).department.error.nameAlreadyTaken
  if (!name) throw new GraphQLError(blankNameMessage)
  if ((await prisma.department.findFirst({ where: { name } })) != null) throw new GraphQLError(nameAlreadyTakenMessage)
}

const checkDepartmentId = async (id: number | bigint | undefined): Promise<void> => {
  const message = (await responseMessages).department.error.notExist
  if ((await prisma.department.findFirst({ where: { id } })) == null) throw new GraphQLError(message)
}

const checkManagerId = async (managerId: bigint | number): Promise<void> => {
  const message = (await responseMessages).department.error.invalidManager
  if ((await prisma.user.findFirst({ where: { id: managerId } })) == null) throw new GraphQLError(message)
}

const authorize = async (userId: number | bigint, departmentId: bigint | number | undefined): Promise<void> => {
  const message = (await responseMessages).common.forbidden
  const user: User | null = await prisma.user.findFirst({ where: { id: userId } })
  const department: Department | null = await prisma.department.findFirst({ where: { id: departmentId } })
  if (user?.role !== 'ADMIN' && department?.managerId !== userId) throw new GraphQLError(message)
}

export const updateDepartmentMutation = {
  type: DepartmentType,
  args: {
    id: { type: new GraphQLNonNull(GraphQLBigInt) },
    name: { type: GraphQLString },
    managerId: { type: GraphQLBigInt },
    description: { type: GraphQLString }
  },
  async resolve (_parent: any, args: { id?: number | bigint, name?: string, description?: string, managerId?: number }, cntx: any) {
    try {
      await checkDepartmentId(args.id).catch((err) => { throw err })
      await authorize(cntx.user.id, args.id).catch((err) => { throw err })
      if (typeof (args?.name) === 'string') await checkName(args.name).catch((err) => { throw err })
      if (args?.managerId) await checkManagerId(args.managerId).catch((err) => { throw err })
    } catch (err: any) {
      return handleValidationError(err)
    }
    const departmentId = args.id
    delete args.id
    return await prisma.department.update({
      where: {
        id: departmentId
      },
      data: args
    })
      .then((value) => {
        return parseJSONBigIntToNumber(value)
      })
      .catch((err) => {
        return new GraphQLError((err.message.split('description:')[1]))
      })
  }
}
