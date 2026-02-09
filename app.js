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
const PORT = process.env.PORT || 3000;
const appRouter = require("./routes/appRouter");
const { log } = require("node:console");

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

// // -- Log-out
// app.get("/log-out", (req, res, next) => {
//   req.logout((err) => {
//     if (err) return next(err);
//     res.redirect("/"); // Redirect to home after log-out
//   });
// });


// Error Handling

// -- 404 - Route not found (This should be placed before the general error handler)
app.use((req, res, next) => {
  res.status(404).render("404-500", {
    title: "404 - Not Found",
    error: "Sorry, we couldn't find the page you were looking for.",
  });
});

// -- General error handler for 500 errors (or uncaught errors)
app.use((err, req, res, next) => {
  console.error(err);

  res.status(err.status || 500).render("404-500", {
    title: "Internal Server Error",
    error:
      process.env.NODE_ENV === "production"
        ? "Something went wrong."
        : err.message,
  });
});

// Start Server
app.listen(PORT, (error) => {
  if (error) {
    throw error;
  }
  console.log(`Listening on port ${PORT}!`);
});