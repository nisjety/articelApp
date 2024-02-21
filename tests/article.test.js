const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const articleRouter = require('../routers/article');

// Mock middleware for authentication and authorization
const mockEnsureAuth = (req, res, next) => {
  req.user = { id: '123', displayName: 'Test User', role: 'editor' }; // Simulate an authenticated editor user
  next();
};

const mockEnsureGuest = (req, res, next) => {
  next();
};

jest.mock('../middleware/auth', () => ({
  ensureAuth: mockEnsureAuth,
  ensureGuest: mockEnsureGuest,
}));

const app = express();
app.use(bodyParser.json());
app.use('/articles', articleRouter);

describe('Article Router Tests', () => {
  let server;

  beforeAll((done) => {
    server = app.listen(3001, done); 
  });

  afterAll((done) => {
    server.close(done);
  });

  test('GET /articles should return all public articles', async () => {
    const response = await request(app).get('/articles');
    expect(response.statusCode).toBe(200);
    expect(response.type).toBe('application/json');
  });

  test('GET /articles/add should render the form for adding a new article', async () => {
    const response = await request(app).get('/articles/add');
    expect(response.statusCode).toBe(200);
  });

  test('POST /articles should create a new article and redirect', async () => {
    const newArticle = {
      title: 'New Article',
      content: 'Article content',
    };

    const response = await request(app)
      .post('/articles')
      .send(newArticle);
    
    expect(response.statusCode).toBe(302); // Assuming redirection after successful article creation
  });


});
