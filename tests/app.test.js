// Assuming you're using CommonJS syntax based on the context of your project
const request = require('supertest');
const path = require('path')
const { app, server } = require('../app'); // Adjust the import according to your project structure

describe('App Test', () => {
  beforeAll((done) => {
    server.listen(3001, done); 
  });

  afterAll((done) => {
    server.close(done);
  });

  test('GET / should render login page', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.text).toContain('Login with Google');
  });

  test('GET /dashboard should redirect to login page if not authenticated', async () => {
    const response = await request(app).get('/dashboard');
    expect(response.status).toBe(302);
    expect(response.headers.location).toBe('/');
  });

  test('GET /auth/google should initiate Google authentication', async () => {
    const response = await request(app).get('/auth/google');
    expect(response.status).toBe(302);
    expect(response.headers.location).toMatch(/^https:\/\/accounts\.google\.com\/o\/oauth2\/auth/);
  });
});
