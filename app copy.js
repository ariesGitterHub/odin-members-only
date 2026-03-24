require("dotenv").config();
require("./config/passport"); // Passport strategies

const express = require("express");
const cookieParser = require("cookie-parser");
const path = require("node:path");
const session = require("express-session");
const passport = require("passport");

const setCurrentUser = require("./middleware/setCurrentUser");
const { validateSession } = require("./middleware/sessionMiddleware");
const setPermissions = require("./middleware/setPermissions");
const errorMiddleware = require("./middleware/errorMiddleware");

const appRouter = require("./routes/appRouter");
const PORT = process.env.PORT || 3000;

const app = express();

// Catch uncaught exceptions
process.on("uncaughtException", console.error);

// App Configuration
app.use(express.static(__dirname + "/public"));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Cookie parser middleware

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Ensure this is true in production
      sameSite: "strict",
      maxAge: 1000 * 60 * 60 * 6,
    },
  }),
);

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Global User and Permissions
app.use(setCurrentUser);
app.use(setPermissions);

// Session Validation Middleware (globally applied)
app.use(validateSession);

// Routes
app.get("/", (req, res) => {
  res.redirect("/app");
});

app.use("/app", appRouter); // Mount app routes

// Error Handling
app.use(errorMiddleware); // Centralized error handler

// Start cron jobs
require("./cron/cleanup"); // Cleanup job

// Start Server
app.listen(PORT, (error) => {
  if (error) throw error;
  console.log(`Listening on port ${PORT}!`);
});
