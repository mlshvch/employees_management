import { createRandomUser } from '../test/factories/user.factory'
import { createRandomDepartment } from '../test/factories/department.factory'
import { createRandomPosition } from '../test/factories/position.factory'
import { createRandomEmployees } from '../test/factories/employee.factory'

const DEPARTMENT_NUMBER = 5
const POSITION_NUMBER = 10
const USER_NUMBER = 7

async function seed (): Promise<void> {
  const user = await createRandomUser('alex', 'hello, world')

  for (let i = 0; i < DEPARTMENT_NUMBER; i++) {
    await createRandomDepartment(user.id)
  }

  for (let i = 0; i < POSITION_NUMBER; i++) {
    await createRandomPosition()
  }

  for (let i = 0; i < USER_NUMBER; i++) {
    await createRandomUser()
  }

  await createRandomEmployees(USER_NUMBER)
}

seed()
  .catch((err) => {
    console.log(err)
  })
