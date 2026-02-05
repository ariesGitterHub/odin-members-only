// 0. FIRST!
require("dotenv").config(); // Load environment variables

// 1. Imports at the top
const express = require("express");
const path = require("node:path");
const session = require("express-session");
// const passport = require("passport");
// const { Pool } = require("pg");
// const bcrypt = require("bcryptjs");
// const LocalStrategy = require("passport-local").Strategy;
// const { body, validationResult } = require("express-validator");

const appRouter = require("./routes/appRouter");

// 2. Create the app
const app = express();

// 3. App.config - boilerplate app configurations
app.use(express.static(__dirname + "/public"));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// 4. Global middleware
app.use(express.urlencoded({ extended: true }));

app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 1000 * 60 * 60, // 1 hour
    },
  }),
);

// Passport Middleware setup (after session)

// app.use(passport.initialize());
// app.use(passport.session());

// Passport LocalStrategy + serialize/deserialize
// -- Serialize / Deserialize
// TODO - HANDLED BY config/passport.js - link to...

// Routes
// -- "Home"
// -- Login Form
app.get("/", (req, res) => {
  res.redirect("/app");
});

// -- Mount app routes
app.use("/app", appRouter);


// Start Server
app.listen(3000, (err) => {
  if (err) throw err;
  console.log("App listening on port 3000!");
});