// 0. FIRST!
require("dotenv").config(); // Load environment variables
require("./config/passport"); // This initializes the Passport strategies
// 1. Imports at the top
const express = require("express");
const path = require("node:path");
// const bcrypt = require("bcryptjs");
const session = require("express-session");
const passport = require("passport");
// const { body, validationResult } = require("express-validator");

const PORT = process.env.PORT || 3000;
const appRouter = require("./routes/appRouter");
const { log } = require("node:console");
// const permissions = require("./utils/permissions");
const { avatarTypeDefault } = require("./utils/avatarTypeDefault");
const { addAvatarFields } = require("./utils/viewFormatters");

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

app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true, // ????? This right?
      // secure: process.env.NODE_ENV === "production", //TODO!
      secure: false, //localhost testing
      sameSite: "strict",
      // sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 6, // 6 hour
    },
  }),
);

// app.use(async (req, res, next) => {
//   try {
//     if (req.session.userId) {
//       const user = await getUserById(req.session.userId);
//       res.locals.currentUser = user;
//     } else {
//       res.locals.currentUser = null;
//     }
//     next();
//   } catch (err) {
//     next(err);
//   }
// });

// app.use((req, res, next) => {
//   res.locals.currentUser = req.session.user || null;
//   next();
// });

// Passport Middleware setup (after session)

app.use(passport.initialize());
app.use(passport.session());

// Passport LocalStrategy + serialize/deserialize
// -- Serialize / Deserialize
// TODO - HANDLED BY config/passport.js - link to...

// NOTE - BELOW IS WRONG USING PASSPORT...
// app.use((req, res, next) => {
//   res.locals.currentUser = req.session.user || null;
//   res.locals.permissions = permissions;
//   next();
// });
// The fix:

app.use((req, res, next) => {
  if (req.user) {
    // Make a shallow copy
    const user = { ...req.user };

    // Add avatar info (reusing your helper)
    const processedUser = addAvatarFields([user], avatarTypeDefault)[0];

    // Optionally format birthdate, age, or other profile fields
    // const processedUserWithBirthdate = addBirthdateFields(
    //   [processedUser],
    //   calculateAge,
    //   formatShortDate,
    // )[0];

    // res.locals.currentUser = processedUserWithBirthdate;
    res.locals.currentUser = processedUser;
  } else {
    res.locals.currentUser = null;
  }

  next();
});

// app.use((req, res, next) => {
//   res.locals.currentUser = req.user || null;
//   res.locals.permissions = permissions;
//   next();
// });

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

// // -- 404 - Route not found (This should be placed before the general error handler)
// app.use((req, res, next) => {
//   res.status(404).render("404-500", {
//     title: "404 - Not Found",
//     error: "Sorry, we couldn't find the page you were looking for.",
//   });
// });

// // -- General error handler for 500 errors (or uncaught errors)
// app.use((err, req, res, next) => {
//   console.error(err);

//   res.status(err.status || 500).render("404-500", {
//     title: "Internal Server Error",
//     error:
//       process.env.NODE_ENV === "production"
//         ? "Something went wrong."
//         : err.message,
//   });
// });

app.use((err, req, res, next) => {
  console.error(err);

  const status = err.status || 500;

  let title;
  let message;

  if (status === 403) {
    title = "403 - Forbidden";
    message = "You do not have permission to access this resource.";
  } else if (status === 404) {
    title = "404 - Not Found";
    message = "Sorry, we couldn't find the page you were looking for.";
  } else {
    title = "500 - Internal Server Error";
    message =
      process.env.NODE_ENV === "production"
        ? "Something went wrong."
        : err.message;
  }

  res.status(status).render("error-page", {
    title,
    error: message,
  });
});

// Start cron jobs
require("./cron/cleanup"); // starts the daily cleanup job

// Start Server
app.listen(PORT, (error) => {
  if (error) {
    throw error;
  }
  console.log(`Listening on port ${PORT}!`);
});

// async function getHash () {
// const hashThatPassword = await bcrypt.hash(process.env.ADMIN_FAST_PASSWORD, 12);
// console.log(hashThatPassword);
// }
// getHash();