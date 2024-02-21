// Import jest, supertest, and your app, server, and io modules
import { app, server, io } from '../app';
import request from 'supertest';


describe('App Test', () => {
  // Use beforeAll and afterAll to start and stop the server before and after all tests
  beforeAll((done) => {
    server.listen(done);
  });

  afterAll((done) => {
    server.close(done);
  });

  // Use afterEach to clear all the mocks after each test
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test case for the GET / route that checks if it renders the login page
  test('GET / should render login page', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.text).toContain('Login with Google');
  });

  // Test case for the GET /dashboard route that checks if it redirects to the login page if not authenticated
  test('GET /dashboard should redirect to login page if not authenticated', async () => {
    const response = await request(app).get('/dashboard');
    expect(response.status).toBe(302);
    expect(response.headers.location).toBe('/');
  });

  // Test case for the GET /auth/google route that checks if it initiates the Google authentication
  test('GET /auth/google should initiate Google authentication', async () => {
    const response = await request(app).get('/auth/google');
    expect(response.status).toBe(302);
    expect(response.headers.location).toMatch(
      /^https:\/\/accounts\.google\.com\/o\/oauth2\/auth/
    );
  });

  // Test case for the GET /auth/google/callback route that checks if it handles the Google authentication callback
  test('GET /auth/google/callback should handle Google authentication callback', async () => {
    // Mock the passport authenticate middleware to simulate a successful authentication
    jest.mock('passport', () => ({
      authenticate: () => (req, res, next) => {
        req.user = { id: '123', displayName: 'Test User' };
        next();
      },
    }));

    const response = await request(app).get('/auth/google/callback');
    expect(response.status).toBe(302);
    expect(response.headers.location).toBe('/dashboard');
  });

  // Test case for the GET /auth/logout route that checks if it logs out the user and redirects to the home page
  test('GET /auth/logout should log out the user and redirect to home page', async () => {
    // Mock the passport authenticate middleware to simulate an authenticated user
    jest.mock('passport', () => ({
      authenticate: () => (req, res, next) => {
        req.user = { id: '123', displayName: 'Test User' };
        next();
      },
    }));

    // Mock the req.logout function to simulate a successful logout
    const mockLogout = jest.fn();
    app.use((req, res, next) => {
      req.logout = mockLogout;
      next();
    });

    const response = await request(app).get('/auth/logout');
    expect(response.status).toBe(302);
    expect(response.headers.location).toBe('/');
    expect(mockLogout).toHaveBeenCalled();
  });

  // Test case for the WebSocket connection that checks if it emits and receives messages
  test('WebSocket connection should emit and receive messages', (done) => {
    const client = io('http://localhost:3000');
    client.on('connect', () => {
      client.emit('join', 'test-room');
      // Complete the test case by adding the missing code
      client.on('message', (message) => {
        expect(message).toBe('Hello! Message from server.');
        client.disconnect();
        done();
      });
    });
  });

  // Test case for the POST /articles route that checks if it creates a new article and redirects to the dashboard page
  test('POST /articles should create a new article and redirect to dashboard page', async () => {
    // Mock the passport authenticate middleware to simulate an authenticated user
    jest.mock('passport', () => ({
      authenticate: () => (req, res, next) => {
        req.user = { id: '123', displayName: 'Test User' };
        next();
      },
    }));

    // Create a mock article object
    const mockArticle = {
      title: 'Test Article',
      content: 'This is a test article.',
    };

    const response = await request(app).post('/articles').send(mockArticle);
    expect(response.status).toBe(302);
    expect(response.headers.location).toBe('/dashboard');
  });

  // Add more test cases for the other routes and functionalities of your app
  // For example, you can write test cases for the PUT /articles/:id, DELETE /articles/:id, and GET /articles/:id routes
});
