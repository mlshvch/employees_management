import { GraphQLNonNull, GraphQLError } from 'graphql'
import { GraphQLBigInt } from '../types/scalar/bigint.type'
import { prisma } from '../../../db'
import { DepartmentType } from '../types/department.type'
import { parseJSONBigIntToNumber } from '../../../helpers/parse_bigint'
import { ResponseMessages, readResponseMessages } from '../../../helpers/read_response_messages'
import { handleValidationError } from '../../../helpers/handle_validation_error'
import { logger } from '../../logger'

const responseMessages: Promise<ResponseMessages> = readResponseMessages()

const authorize = async (userId: number): Promise<void> => {
  const message = (await responseMessages).common.forbidden
  if ((await prisma.user.findFirst({ where: { id: userId } }))?.role !== 'ADMIN') throw new GraphQLError(message)
}

const checkDepartmentId = async (departmentId: number | bigint): Promise<void> => {
  const message = (await responseMessages).department.error.notExist
  if ((await prisma.department.findFirst({ where: { id: departmentId } })) == null) throw new GraphQLError(message)
}

export const deleteDepartmentMutation = {
  type: DepartmentType,
  args: {
    id: { type: new GraphQLNonNull(GraphQLBigInt) }
  },
  async resolve (_parent: any, args: { id: bigint | number }, cntx: any): Promise<object | GraphQLError> {
    try {
      await authorize(cntx.user.id).catch((err: GraphQLError | Error) => { throw err })
      await checkDepartmentId(args.id).catch((err: GraphQLError | Error) => { throw err })
    } catch (err: any) {
      return handleValidationError(err)
    }

    return await prisma.department.delete({ where: { id: args.id } })
      .then((result) => parseJSONBigIntToNumber(result))
      .catch(async (err) => {
        logger.error(err)
        return new GraphQLError((await responseMessages).common.internalError)
      })
  }
}
