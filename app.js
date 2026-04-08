// *** FIRST!
require("dotenv").config(); // Load environment variables

// *** Global process error handlers (uncaught sync errors + unhandled promise rejections)
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1); // Exit safely; process manager can restart
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1); // Exit safely
});

require("./config/passport"); // This initializes the Passport strategies

// *** Imports at the top
const express = require("express");
const cookieParser = require('cookie-parser'); // Required for cookie-based token storage
const path = require("node:path");
const session = require("express-session");
const passport = require("passport");
// const crypto = require("crypto");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit"); // Import express-rate-limit

const { runRetentionJobs } = require("./jobs/retentionJobs");  // TODO - FOR DEV ONLY
const { csrfProtection, csrfTokenMiddleware, csrfErrorHandler } = require('./middleware/csrfMiddleware'); // Import CSRF middleware
const setCurrentUser = require('./middleware/setCurrentUser'); // Import the middleware
const setPermissions = require("./middleware/setPermissions");
const appRouter = require("./routes/appRouter");

const PORT = process.env.PORT || 3000;

// *** Create the app
const app = express();

// *** Express-rate-limit middleware

// Set up rate limiting for sign-up (guest registration)
const signupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 sign-ups per window
  message: 'Too many sign-up attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Set up rate limiting for message posting (guests can post)
const postLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each guest to 20 posts per window
  message: 'Too many posts from this IP, please wait a while before posting again.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Set up rate limiting for login attempts (if guests can log in later)
const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3, // Limit each IP to 3 login attempts per window
  message: 'Too many login attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

//CORS is not needed at all. My fetch/ajax requests from main.js to my backend routes are same-origin, so they won’t be blocked by the browser. I don’t need the cors middleware unless I (big IF too, later) serve my frontend from a completely separate domain or port.

// *** App.config - boilerplate app configurations
app.use(express.static(__dirname + "/public"));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// *** Middleware tp parse body
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Middleware to parse cookies (before CSRF protection)
app.use(cookieParser());

// Generate nonce per request
// app.use((req, res, next) => {
//   res.locals.nonce = crypto.randomBytes(16).toString('hex');
//   next();
// });

// *** Helmet security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        defaultSrc: ["'self'"],
        "script-src": ["'self'"],
        "style-src": ["'self'"],
        "font-src": ["'self'", "https://fonts.gstatic.com"],
        "img-src": ["'self'", "data:"],
      },
    },
  }),
);

// *** Session middleware must come before CSRF middleware (important for CSRF protection)
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true, // ????? This right? TODO - USE ONLY IN DEV
      // Only send over HTTPS in production
      // secure: process.env.NODE_ENV === "production", //TODO!
      secure: false, // use in dev
      // secure: true, // use in production
      sameSite: "strict", // use in production
      // sameSite: "lax", // use in dev
      maxAge: 1000 * 60 * 60 * 1, // 1 hour
    },
  }),
);

// *** CSRF middleware
app.use(csrfProtection);  // CSRF protection middleware to validate tokens

// CSRF token middleware to add the CSRF token to res.locals
app.use(csrfTokenMiddleware);  // This adds the token to res.locals for all GET requests

// *** Catch annoying Chrome devtools probe first
app.use((req, res, next) => {
  if (req.path === "/.well-known/appspecific/com.chrome.devtools.json") {
    return res.status(204).end();
  }
  next();
});

// *** Passport Middleware setup (after session)
app.use(passport.initialize());
app.use(passport.session());

// *** Custom global middleware
app.use(setCurrentUser);  // Use it globally
app.use(setPermissions);  // Use it globally
// app.use(checkMaintenanceMode);  // Use it globally

// // *** Apply rate limiting to routes
// app.use('/signup', signupLimiter); // Apply rate limiter to sign-up route
// app.use('/post', postLimiter); // Apply rate limiter to post route
// app.use('/login', loginLimiter); // Apply rate limiter to login route

// *** Routes
// "Home"
app.get("/", (req, res) => {
  res.redirect("/app");
});

// *** Mount app routes
app.use("/app", appRouter);

// *** Log unmathed routes (optional)
app.use((req, res, next) => {
  console.log("❌ Fell through:", req.method, req.originalUrl);
  next();
});

// *** CSRF Error Handling Middleware
app.use(csrfErrorHandler);  // CSRF error handler that sends 403 on CSRF errors

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
