import request = require('supertest')

/* eslint-disable @typescript-eslint/no-var-requires */
const app = require('../src/app')
/* eslint-enable @typescript-eslint/no-var-requires */

afterAll(() => {
  app.close()
})

describe('GraphQL API', () => {
  it('Log the message', async () => {
    const res = await request(app).post('/graphql')
      .send({ query: '{ helloWorld }' })
      .expect(200)
    expect(res.body).toHaveProperty('data')
    expect(res.body.data).toHaveProperty('helloWorld')
    expect(res.body.data.helloWorld).toEqual('Hello, World!')
  })
})
