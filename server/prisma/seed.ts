import { createRandomUser } from '../test/factories/user.factory'
import { createRandomDepartment } from '../test/factories/department.factory'

const DEPARTMENT_NUMBER = 5

async function seed (): Promise<void> {
  const user = await createRandomUser('alex', 'hello, world')
  for (let i = 0; i < DEPARTMENT_NUMBER; i++) {
    await createRandomDepartment(user.id)
  }
}

seed()
  .then()
  .catch((err) => {
    console.log(err)
  })
