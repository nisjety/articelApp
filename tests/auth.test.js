const request = require('supertest');
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const authRouter = require('../routes/auth'); // Ensure this path matches your project structure

// Setup express app for testing
const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(session({ secret: 'test_secret', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// Mock Passport Google OAuth strategy
passport.use(new GoogleStrategy({
  clientID: 'YOUR_TEST_CLIENT_ID',
  clientSecret: 'YOUR_TEST_CLIENT_SECRET',
  callbackURL: "/auth/google/callback"
},
function(accessToken, refreshToken, profile, cb) {
  // Mock user profile callback
  cb(null, { id: '123', displayName: 'Test User' });
}));

app.use('/auth', authRouter);

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
    // This might still redirect to Google, mocking the full OAuth flow would require intercepting this call.
    expect(response.status).toBe(302);
    // Ensure your test environment can handle redirects or mock this part
  });

  test('GET /auth/google/callback should handle authentication callback', async () => {
    // Simulate a successful authentication callback
    const response = await request(server).get('/auth/google/callback?code=mockCode');
    expect(response.status).toBe(302);
    // Adjust expectations based on your application's flow after successful authentication
    expect(response.headers.location).toEqual(expect.stringContaining('/dashboard'));
  });

  test('GET /auth/logout should log out the user and redirect', async () => {
    const response = await request(server).get('/auth/logout');
    expect(response.status).toBe(302);
    expect(response.headers.location).toEqual('/');
  });

});
