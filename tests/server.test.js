const request = require('supertest');
const app = require('../app'); // Adjust the path as necessary

describe('GET /', () => {
  it('responds with 200 status', async () => {
    const response = await request(app).get('/');
    expect(response.statusCode).toBe(200);
  });
});
