const request = require('supertest')
const path = require('path');
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const authRouter = require('../routes/auth'); // Adjust the path as needed

// Setup express app and middleware for testing
const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(session({ secret: 'test', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use('/auth', authRouter);

// Mock user authentication to simplify tests
const mockUser = { id: '123', displayName: 'Test User' };
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => done(null, mockUser));

// Start server for testing
let server;
beforeAll((done) => {
  server = app.listen(3000, done);
});

afterAll((done) => {
  server.close(done);
});

describe('Auth Router Tests', () => {
  test('GET /auth/google should initiate Google authentication', async () => {
    const response = await request(server).get('/auth/google');
    expect(response.status).toBe(302);
    expect(response.headers.location).toContain('accounts.google.com');
  });

  test('GET /auth/google/callback should handle authentication callback', async () => {
    const response = await request(server).get('/auth/google/callback');
    expect(response.status).toBe(302);
    expect(response.headers.location).toEqual(expect.stringContaining('/'));
  });

  test('GET /auth/logout should log out the user and redirect', async () => {
    const response = await request(server).get('/auth/logout');
    expect(response.status).toBe(302);
    expect(response.headers.location).toEqual('/');
  });

});
