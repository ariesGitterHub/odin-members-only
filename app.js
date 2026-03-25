// 0. FIRST!
require("dotenv").config(); // Load environment variables
require("./config/passport"); // This initializes the Passport strategies

// 1. Imports at the top
const express = require("express");
const cookieParser = require("cookie-parser");
// const { validateSession } = require("./middleware/sessionMiddleware"); // Import the session validation middleware
const path = require("node:path");
// const bcrypt = require("bcryptjs");
const session = require("express-session");
const passport = require("passport");
const setCurrentUser = require('./middleware/setCurrentUser'); // Import the middleware
// const { body, validationResult } = require("express-validator");
const setPermissions = require("./middleware/setPermissions");

const PORT = process.env.PORT || 3000;
const appRouter = require("./routes/appRouter");
// const { log } = require("node:console"); // TODO - what is this???

// 2. Create the app
const app = express();

// Catch any uncaught exceptions to prevent Node from crashing...This prevents Node from completely crashing on unexpected errors during development. Important: This is mostly for development/debugging — you shouldn’t rely on it in production to silently swallow real bugs. Always fix the root cause.
process.on("uncaughtException", console.error);

// 3. App.config - boilerplate app configurations
app.use(express.static(__dirname + "/public"));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// 4. Global middleware
app.use(express.urlencoded({ extended: true }));

// Add cookie-parser middleware before your session validation
app.use(cookieParser()); 

// Apply session validation globally, before any routes
// app.use(validateSession);  // This checks if the user has a valid session
// const errorMiddleware = require("./middleware/errorMiddleware");
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true, // ????? This right? TODO - USE ONLY IN DEV
      // secure: process.env.NODE_ENV === "production", //TODO!
      secure: false, //localhost testing
      sameSite: "strict",
      // sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 6, // 6 hour
    },
  }),
);

// Passport Middleware setup (after session)

app.use(passport.initialize());
app.use(passport.session());
app.use(setCurrentUser);  // Use it globally
app.use(setPermissions);  // Use it globally

// 5. Routes
// -- "Home"
app.get("/", (req, res) => {
  res.redirect("/app");
});

// -- Mount app routes
app.use("/app", appRouter);

// NEW
// 6. Catch-all 404 handler (important)
// app.use((req, res, next) => {
//   const err = new Error("Not Found");
//   err.status = 404;
//   next(err);  // Forward the error to the error-handling middleware
// });

// 7. Centralized Error Handling Middleware (Generic Error and 404)
app.use(require("./middleware/errorMiddleware"));  // Handle both 404 and other errors here

// 8. Start cron jobs
require("./cron/cleanup"); // starts the daily cleanup job

// 9. Start Server
app.listen(PORT, (error) => {
  if (error) {
    throw error;
  }
  console.log(`Listening on port ${PORT}!`);
});
