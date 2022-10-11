import { faker } from "@faker-js/faker"
import { Employee, PrismaClient } from '@prisma/client';
import { selectRandomUser, createNonExistingUser } from './user.factory';
import { selectRandomPosition, createInvalidPositionData } from './position.factory';
import { selectRandomDepartment, createNonExistingDepartment } from './department.factory';

const prisma = new PrismaClient

interface EmployeeType
{
  id: undefined
  userId: bigint, 
  name: string, 
  surname: string, 
  positionId: number | bigint, 
  staffMember: boolean, 
  departmentId: bigint
}

export const createRandomEmployeeData = async(args? : {userId?: bigint, name?:string, surname?: string, positionId?: bigint | number, staffMemeber?: boolean, departmentId?: bigint}): Promise<EmployeeType>  => {
  return {
    id: undefined,
    userId: args?.userId || (await selectRandomUser()).id,
    name: args?.name || faker.name.firstName(),
    surname: args?.surname || faker.name.lastName(),
    positionId: args?.positionId || (await selectRandomPosition()).id,
    staffMember: args?.staffMemeber || true,
    departmentId: args?.departmentId || (await selectRandomDepartment()).id
  }
}

export const createRandomEmployee = async (args?: EmployeeType): Promise<Employee> => {
  return await prisma.employee.create({data: await createRandomEmployeeData(args) })
}

export const createEmployeeDataWithInvalidUserId = async () => {
  return createRandomEmployeeData({userId: (await createNonExistingUser()).id})
}

export const createEmployeeDataWithInvalidDepartmentId = async () => {
  return createRandomEmployeeData({departmentId: (await createNonExistingDepartment()).id})
}

export const createEmployeeDataWithInvalidPositionId = async () => {
  return createRandomEmployeeData({positionId: (await createInvalidPositionData()).id })
}

export const createRandomEmployees = async (number: number = 10): Promise<Employee[]> => {
  let list: Employee[] = []
  if (number < 1) throw new Error('negative number passed')
  for(let i=0; i< number; i++) {
    list.push(await createRandomEmployee())
  }
  return list
}
