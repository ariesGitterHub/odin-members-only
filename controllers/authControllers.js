const bcrypt = require("bcryptjs");
const passport = require("passport");
const { validationResult } = require("express-validator");

const {
  insertSessionLog,
  insertNewUser,
  updateLastLogin,
} = require("../db/queries/userQueries");


// CONTROLLER: SIGN-UP PAGE (sign-up.ejs)

async function getSignUp(req, res, next) {
  try {
    res.render("sign-up", {
      title: "Sign Up",
      // user: req.user,
      errors: [],
      formData: req.body || {},
    });
  } catch (err) {
    next(err);
  }
}

async function postSignUp(req, res, next) {
  const {
    first_name,
    last_name,
    email,
    birthdate,
    password,
    confirm_password,
  } = req.body;

  try {

    // Run middleware validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const formattedErrors = [];
      const seen = new Set();
      errors.array().forEach((err) => {
        if (!seen.has(err.path)) {
          formattedErrors.push({ param: err.path, msg: err.msg });
          seen.add(err.path); // seen ensures only one error per field, so your EJS shows one message for password, not multiple.
        }
      });

      return res.render("sign-up", {
        title: "Sign Up",
        errors: formattedErrors,
        formData: req.body || {},
      });
    }

    // Hash password and insert new user
    const password_hash = await bcrypt.hash(password, 12);
    await insertNewUser(first_name, last_name, email, birthdate, password_hash);

    // Redirect after success
    res.redirect("/app/log-in");
  } catch (err) {
    console.error("Error during sign-up:", err);
    next(err);
  }
}


// CONTROLLER: LOG-IN PAGE (log-in.ejs)

async function getLogIn(req, res, next) {
  try {
    res.render("log-in", {
      title: "Log In",
      // user: req.user,
      errors: [],
      formData: req.body || {},
    });
  } catch (err) {
    next(err);
  }
}

// async function postLogIn(req, res, next) {
//   // console.log("Form data:", req.body); // Log the request body to see the submitted data
//   passport.authenticate("local", async (err, user, info) => {
//     if (err) {
//       console.error("Error during authentication:", err);
//       return next(err); // handle unexpected error
//     }

//     if (!user) {
//       console.log(
//         "Authentication failed:",
//         info.message || "Invalid email or password",
//       );
//       return res.render("log-in", {
//         title: "Log In",
//         errors: [info.message || "Invalid email or password"],
//         formData: req.body || {},
//       });
//     }

//     // TODO - THIS SHOWS THE HASH
//     // console.log("User authenticated:", user);
//     console.log("User authenticated!!!!! 🎈");

//     try {
//       // Update the user's last login timestamp
//       await updateLastLogin(user.id);

//       // Log the user in (via Passport session)
//       req.login(user, (err) => {
//         if (err) {
//           console.error("Error during login:", err);
//           return next(err); // Handle login errors
//         }

//         // console.log("Login successful! Redirecting to message boards...");
//         res.redirect("/app/message-boards"); // Redirect to message boards after login
//       });
//     } catch (err) {
//       console.error("Error updating last login:", err);
//       return next(err); // Handle any error with updating the last login
//     }
//   })(req, res, next); // Execute the Passport authentication logic
// }

const { createSessionLog } = require("../db/queries/userQueries"); // import the helper

async function postLogIn(req, res, next) {
  passport.authenticate("local", async (err, user, info) => {
    if (err) return next(err);

    if (!user) {
      return res.render("log-in", {
        title: "Log In",
        errors: [info.message || "Invalid email or password"],
        formData: req.body || {},
      });
    }

    console.log("User authenticated!!!!! 🎈");

    try {
      // Update last login
      await updateLastLogin(user.id);

      // Log the user in (Passport session)
      req.login(user, async (err) => {
        if (err) return next(err);
// console.log("Session ID:", req.sessionID);
        // ✅ Insert session log AFTER login
        try {
          await insertSessionLog(
            user.id,
            req.sessionID,
            req.ip,
            req.headers["user-agent"],
          );
        } catch (logErr) {
          console.error("Failed to create session log:", logErr);
          // You can decide: ignore or fail login
        }

        res.redirect("/app/message-boards"); // Redirect after successful login
      });
    } catch (err) {
      console.error("Error updating last login:", err);
      return next(err);
    }
  })(req, res, next);
}


// CONTROLLER: LOG-OUT



async function postLogOut(req, res, next) {
  try {
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      res.redirect("/app/log-in"); // Redirect to login page after logout
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getSignUp,
  postSignUp,
  getLogIn,
  postLogIn,
  postLogOut,
};