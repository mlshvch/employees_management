import { createRandomUser } from './user.factory'
import { createRandomDepartment } from './department.factory'

describe('department factory', () => {
  it('returns new department when user presents', async () => {
    const user = await createRandomUser()
    const department = await createRandomDepartment(user.id)
    expect(department).toHaveProperty('id')
  })
})
