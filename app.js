const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const passport = require("passport");
const session = require("express-session");
const morgan = require("morgan");
const flash = require("connect-flash");
const methodOverride = require("method-override");
const MongoStore = require("connect-mongo");
const { engine } = require("express-handlebars"); // Endret fra exphbs til { engine }
const connectDB = require("./config/db");
const { default: mongoose } = require("mongoose");

// Laster inn konfigurasjon
dotenv.config({ path: "./config/config.env" });

//passport config
require("./config/passport")(passport);
connectDB();

const app = express();

//body Parser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//request status
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

//Definerer custom helpers for Handlebars
const hbs = engine({
  helpers: {
    eq: (v1, v2) => v1 === v2,
  },
  defaultLayout: "main",
  extname: ".hbs",
});

// Setter opp Handlebars-motoren med de definerte hjelperne
app.engine(".hbs", hbs);
app.set("view engine", ".hbs");

//sesion
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI, // Pass inn din MongoDB URI her
    }),
  }),
);

// Logging middleware for development environment
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// flash msg
app.use(flash());

// global settings
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});

//passport
app.use(passport.initialize());
app.use(passport.session());

//src folder(parcel)
app.use(express.static(path.join(__dirname, "src")));

//overite
app.use(methodOverride("_method"));

//Routes
app.use("/", require("./routes/index"));
app.use("/auth", require("./routes/auth"));
app.use("/articles", require("./routes/articles"));

app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});

// Body parser middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Export the app module
module.exports = app;
