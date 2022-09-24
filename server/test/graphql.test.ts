const request = require("supertest");
const app = require('../src/app')

afterAll(() => {
  app.close()
})

describe("GraphQL API", () => {
  // const request = supertest(app)

  // it("returns 'Hello World' at helloWorld query", async () => {
  //   request.post('/graphql')
  //   .send({ query: '{ user(id: 10) { id name username email } }'})
  //   .expect(200)
  //   .end((err: Error,res: Response) => {
  //     console.log(res)
  //   })
  // }) 
  it("Log the message", async () =>  {
    const res = await request(app).post('/graphql')
    .send({query: '{ helloWorld }'})
    .expect(200)
     expect(res.body).toHaveProperty('data')
     expect(res.body.data).toHaveProperty('helloWorld')
     expect(res.body.data.helloWorld).toEqual('Hello, World!')
    })
})
