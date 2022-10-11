import { faker } from '@faker-js/faker'
import { Employee, PrismaClient } from '@prisma/client'
import { createNonExistingUser, createRandomUser } from './user.factory'
import { selectRandomPosition, createInvalidPositionData } from './position.factory'
import { selectRandomDepartment, createNonExistingDepartment } from './department.factory'

const prisma = new PrismaClient()

export interface EmployeeType {
  id: undefined
  userId: bigint
  name: string
  surname: string
  positionId: number | bigint
  staffMember: boolean
  departmentId: bigint
}

export const createRandomEmployeeData = async (args?: { userId?: bigint, name?: string, surname?: string, positionId?: bigint | number, staffMemeber?: boolean, departmentId?: bigint }): Promise<EmployeeType> => {
  const uniqueUsers: bigint[] = (await prisma.$queryRaw<Array<{ id: bigint }>>`
  SELECT "usr".id
  FROM "User" as usr
  WHERE NOT EXISTS 
  (SELECT *
    FROM "Employee" as "emp"
    WHERE "usr"."id" = "emp"."userId")
  `).map((value: { id: bigint }) => value.id)

  const randomUserId = uniqueUsers[Math.floor(Math.random() * (uniqueUsers.length - 1))]
  return {
    id: undefined,
    userId: args?.userId ?? uniqueUsers.length === 0 ? (await createRandomUser()).id : randomUserId,
    name: args?.name ?? faker.name.firstName(),
    surname: args?.surname ?? faker.name.lastName(),
    positionId: args?.positionId ?? (await selectRandomPosition()).id,
    staffMember: args?.staffMemeber ?? true,
    departmentId: args?.departmentId ?? (await selectRandomDepartment()).id
  }
}

export const createRandomEmployee = async (args?: EmployeeType): Promise<Employee> => {
  return await prisma.employee.create({ data: await createRandomEmployeeData(args) })
}

export const createEmployeeDataWithInvalidUserId = async (): Promise<EmployeeType> => {
  return await createRandomEmployeeData({ userId: (await createNonExistingUser()).id })
}

export const createEmployeeDataWithInvalidDepartmentId = async (): Promise<EmployeeType> => {
  return await createRandomEmployeeData({ departmentId: (await createNonExistingDepartment()).id })
}

export const createEmployeeDataWithInvalidPositionId = async (): Promise<EmployeeType> => {
  return await createRandomEmployeeData({ positionId: (await createInvalidPositionData()).id })
}

export const createRandomEmployees = async (number: number = 10): Promise<Employee[]> => {
  const list: Employee[] = []
  if (number < 1) throw new Error('negative number passed')
  for (let i = 0; i < number; i++) {
    list.push(await createRandomEmployee())
  }
  return list
}

export const selectRandomEmployee = async (): Promise<Employee> => {
  return await prisma.employee.findMany()
    .then((employees: Employee[]) => {
      return employees[Math.floor(Math.random() * (employees.length - 1))]
    })
}
