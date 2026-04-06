// *** FIRST!
require("dotenv").config(); // Load environment variables
require("./config/passport"); // This initializes the Passport strategies

// *** Imports at the top
const express = require("express");
// const csrf = require("csrf");
const { runRetentionJobs } = require("./jobs/retentionJobs");  // TODO - FOR DEV ONLY
const path = require("node:path");
const session = require("express-session");
const passport = require("passport");
const setCurrentUser = require('./middleware/setCurrentUser'); // Import the middleware
const setPermissions = require("./middleware/setPermissions");
// const csrfProtection = require("../middleware/csrfProtection")
const PORT = process.env.PORT || 3000;
const appRouter = require("./routes/appRouter");
// const { log } = require("node:console"); // TODO - what is this???

// *** Create the app
const app = express();

// Catch any uncaught exceptions to prevent Node from crashing...This prevents Node from completely crashing on unexpected errors during development. Important: This is mostly for development/debugging — you shouldn’t rely on it in production to silently swallow real bugs. Always fix the root cause.
process.on("uncaughtException", console.error);

// *** App.config - boilerplate app configurations
app.use(express.static(__dirname + "/public"));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// *** Global middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// *** Session middleware must come before CSRF middleware (important for CSRF protection)

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true, // ????? This right? TODO - USE ONLY IN DEV
      // secure: process.env.NODE_ENV === "production", //TODO!
      secure: false, // use in dev
      // secure: true, // use in production
      sameSite: "strict", // use in production
      // sameSite: "lax", // use in dev
      maxAge: 1000 * 60 * 60 * 1, // 1 hour
    },
  }),
);

// *** Apply CSRF middleware (after session setup, as it depends on session)
//  app.use(csrfProtection);  // <-- CSRF middleware to verify tokens

// Passport Middleware setup (after session)

app.use(passport.initialize());
app.use(passport.session());
app.use(setCurrentUser);  // Use it globally
app.use(setPermissions);  // Use it globally
// app.use(checkMaintenanceMode);  // Use it globally

// *** Routes
// "Home"
app.get("/", (req, res) => {
  res.redirect("/app");
});

// *** Mount app routes
app.use("/app", appRouter);

// NEW - TESTING ODD 404 that keeps popping up
// Appears to b popping up from devTools.
app.use((req, res, next) => {
  console.log("❌ Fell through:", req.method, req.originalUrl);
  next();
});

// *** Catch-all 404 handler (important)
app.use((req, res, next) => {
  const err = new Error("Not Found");
  err.status = 404;
  next(err);  // Forward the error to the error-handling middleware
});

// *** Centralized Error Handling Middleware (Generic Error and 404)
app.use(require("./middleware/errorMiddleware"));  // Handle both 404 and other errors here

// *** Start cron jobs
require('./cron/retentionScheduler'); // <-- this schedules the daily retention job

(async () => {
  try {
    await runRetentionJobs(); // ensures any missed deletions happen on startup
    console.log('Retention job run on server start');
  } catch (err) {
    console.error('Error running retention job on startup:', err);
  }
})();

// *** Start Server
app.listen(PORT, (error) => {
  if (error) {
    throw error;
  }
  console.log(`Listening on port ${PORT}!`);
});

