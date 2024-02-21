const request = require('supertest');
const router = require('../routers/article');

// Create a mock app and server
const express = require('express');
const app = express();
app.use(router);
const server = app.listen(3000);

// Use describe to group your test cases into a suite
describe('Article Router Test', () => {
  // Use afterAll to close the server after all the test cases are done
  afterAll((done) => {
    server.close(done);
  });

  test('GET /articles should return all the public articles in JSON format', (done) => {
    // Use the request function to send an HTTP request to the route that you want to test
    request(app)
      .get('/articles')
      .set('Accept', 'application/json')
      // Use the expect function to make assertions about the response that you receive
      .expect(200)
      .expect('Content-Type', /json/)
      .expect((res) => {
        // Add any other assertions that you need
        expect(res.body).toHaveLength(2);
        expect(res.body[0].title).toBe('Test Article 1');
        expect(res.body[0].status).toBe('public');
      })
      // Use the end function to end the test case and pass a callback function
      .end((err, res) => {
        // Handle any errors or call the done function
        if (err) return done(err);
        done();
      });
  });

  // Test case for the GET /articles/add route
test('GET /articles/add should render the form to add a new article for editors and redirect to the login page for others', async () => {
    // Mock the passport authenticate middleware to simulate an editor user
    jest.mock('passport', () => ({
      authenticate: () => (req, res, next) => {
        req.user = { id: '123', displayName: 'Test Editor', role: 'editor' };
        next();
      },
    }));
  
    // Use the request function to send an HTTP GET request to the /articles/add route
    const response = await request(app).get('/articles/add');
    // Use the expect function to make assertions about the response status and text
    expect(response.status).toBe(200);
    expect(response.text).toContain('Add Article');
  
    // Mock the passport authenticate middleware to simulate an unauthenticated user
    jest.mock('passport', () => ({
      authenticate: () => (req, res, next) => {
        req.user = null;
        next();
      },
    }));
  
    // Use the request function to send another HTTP GET request to the /articles/add route
    const response2 = await request(app).get('/articles/add');
    // Use the expect function to make assertions about the response status and headers
    expect(response2.status).toBe(302);
    expect(response2.headers.location).toBe('/');
  });

  // Test case for the POST /articles route
test('POST /articles should create a new article and redirect to the dashboard page for editors and return an error for others', async () => {
    // Mock the passport authenticate middleware to simulate an editor user
    jest.mock('passport', () => ({
      authenticate: () => (req, res, next) => {
        req.user = { id: '123', displayName: 'Test Editor', role: 'editor' };
        next();
      },
    }));
  
    // Create a mock article object
    const mockArticle = {
      title: 'Test Article',
      content: 'This is a test article.',
    };
  
    // Use the request function to send an HTTP POST request to the /articles route with the mock article object
    const response = await request(app).post('/articles').send(mockArticle);
    // Use the expect function to make assertions about the response status and headers
    expect(response.status).toBe(302);
    expect(response.headers.location).toBe('/dashboard');
  
    // Mock the passport authenticate middleware to simulate a non-editor user
    jest.mock('passport', () => ({
      authenticate: () => (req, res, next) => {
        req.user = { id: '456', displayName: 'Test User', role: 'user' };
        next();
      },
    }));
  
    // Use the request function to send another HTTP POST request to the /articles route with the mock article object
    const response2 = await request(app).post('/articles').send(mockArticle);
    // Use the expect function to make assertions about the response status and text
    expect(response2.status).toBe(403);
    expect(response2.text).toContain('You are not authorized to perform this action');
  });  

  // Test case for the PUT /articles/:id route
test('PUT /articles/:id should update an existing article and redirect to the dashboard page for the author or an editor and return an error for others', async () => {
    // Mock the passport authenticate middleware to simulate an author user
    jest.mock('passport', () => ({
      authenticate: () => (req, res, next) => {
        req.user = { id: '123', displayName: 'Test Author', role: 'user' };
        next();
      },
    }));
  
    // Create a mock article object
    const mockArticle = {
      title: 'Test Article',
      content: 'This is a test article.',
    };
  
    // Use the request function to send an HTTP PUT request to the /articles/:id route with the mock article object
    const response = await request(app).put('/articles/1').send(mockArticle);
    // Use the expect function to make assertions about the response status and headers
    expect(response.status).toBe(302);
    expect(response.headers.location).toBe('/dashboard');
  
    // Mock the passport authenticate middleware to simulate an editor user
    jest.mock('passport', () => ({
      authenticate: () => (req, res, next) => {
        req.user = { id: '456', displayName: 'Test Editor', role: 'editor' };
        next();
      },
    }));
  
    // Use the request function to send another HTTP PUT request to the /articles/:id route with the mock article object
    const response2 = await request(app).put('/articles/1').send(mockArticle);
    // Use the expect function to make assertions about the response status and headers
    expect(response2.status).toBe(302);
    expect(response2.headers.location).toBe('/dashboard');
  
    // Mock the passport authenticate middleware to simulate a non-author and non-editor user
    jest.mock('passport', () => ({
      authenticate: () => (req, res, next) => {
        req.user = { id: '789', displayName: 'Test User', role: 'user' };
        next();
      },
    }));
  
    // Use the request function to send another HTTP PUT request to the /articles/:id route with the mock article object
    const response3 = await request(app).put('/articles/1').send(mockArticle);
    // Use the expect function to make assertions about the response status and text
    expect(response3.status).toBe(403);
    expect(response3.text).toContain('You are not authorized to perform this action');
  });

  // Test case for the DELETE /articles/:id route
test('DELETE /articles/:id should delete an existing article and redirect to the dashboard page for the author or an editor and return an error for others', async () => {
    // Mock the passport authenticate middleware to simulate an author user
    jest.mock('passport', () => ({
      authenticate: () => (req, res, next) => {
        req.user = { id: '123', displayName: 'Test Author', role: 'user' };
        next();
      },
    }));
  
    // Use the request function to send an HTTP DELETE request to the /articles/:id route
    const response = await request(app).delete('/articles/1');
    // Use the expect function to make assertions about the response status and headers
    expect(response.status).toBe(302);
    expect(response.headers.location).toBe('/dashboard');
  
    // Mock the passport authenticate middleware to simulate an editor user
    jest.mock('passport', () => ({
      authenticate: () => (req, res, next) => {
        req.user = { id: '456', displayName: 'Test Editor', role: 'editor' };
        next();
      },
    }));
  
    // Use the request function to send another HTTP DELETE request to the /articles/:id route
    const response2 = await request(app).delete('/articles/1');
    // Use the expect function to make assertions about the response status and headers
    expect(response2.status).toBe(302);
    expect(response2.headers.location).toBe('/dashboard');
  
    // Mock the passport authenticate middleware to simulate a non-author and non-editor user
    jest.mock('passport', () => ({
      authenticate: () => (req, res, next) => {
        req.user = { id: '789', displayName: 'Test User', role: 'user' };
        next();
      },
    }));
  
    // Use the request function to send another HTTP DELETE request to the /articles/:id route
    const response3 = await request(app).delete('/articles/1');
    // Use the expect function to make assertions about the response status and text
    expect(response3.status).toBe(403);
    expect(response3.text).toContain('You are not authorized to perform this action');
  });  
  

});
