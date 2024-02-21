const request = require("supertest");
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const { Strategy } = require("passport-strategy");
const authRouter = require("../routes/auth"); // Adjust the path as needed

// Define the MockStrategy class
class MockStrategy extends Strategy {
  constructor() {
    super();
    this.name = "mock"; // Give a name to the strategy
  }

  authenticate(req, options) {
    const user = { id: "123", displayName: "Test User" }; // Simulated user object
    this.success(user);
  }
}

// Initialize express app
const app = express();

// Middleware setup
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    secret: "test secret",
    resave: false,
    saveUninitialized: true,
  }),
);
app.use(passport.initialize());
app.use(passport.session());

// Use the mock strategy
passport.use(new MockStrategy());

// Serialize and deserialize user (adjust according to your needs)
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) =>
  done(null, { id: "123", displayName: "Test User" }),
);

// Use the auth router
app.use("/auth", authRouter);

// Start server for testing
let server;
beforeAll((done) => {
  server = app.listen(3000, done);
});

afterAll((done) => {
  server.close(done);
});

describe("Auth Router Tests", () => {
  test("GET /auth/google should initiate Google authentication", async () => {
    const response = await request(server).get("/auth/google");
    expect(response.status).toBe(302);
    expect(response.headers.location).toContain("accounts.google.com");
  });

  test("GET /auth/google/callback should handle authentication callback", async () => {
    // Adjust this test to simulate a more realistic scenario
    const response = await request(server).get(
      "/auth/google/callback?code=mockCode",
    );
    // Assuming the callback leads to a dashboard or similar page upon successful authentication
    expect(response.status).toBe(302);
    expect(response.headers.location).toEqual(
      expect.stringContaining("/dashboard"),
    ); // Adjust based on your app's flow
  });

  test("GET /auth/logout should log out the user and redirect", async () => {
    const response = await request(server).get("/auth/logout");
    expect(response.status).toBe(302);
    expect(response.headers.location).toEqual("/");
  });
});
