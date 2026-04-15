const bcrypt = require("bcryptjs");
const passport = require("passport");
const { validationResult } = require("express-validator");
const passwordRules = require("../config/passwordRules");
const { isMaintenanceMode } = require("../utils/isMaintenanceMode");
const {
  insertSessionLog,
  insertNewUser,
  updateLastLogin,
} = require("../db/queries/userQueries");

// CONTROLLER: SIGN-UP PAGE (sign-up.ejs)
async function getSignUpPage(req, res, next) {
  try {
    if (await isMaintenanceMode()) {
      return res.redirect("/");
    }

    res.render("sign-up", {
      title: "Sign Up",
      errors: [],
      passwordRules,
      formData: {}, // NOTE & REMINDER: req.body is not used in GET
    });
  } catch (err) {
    next(err);
  }
}

async function postSignUpPage(req, res, next) {
  try {
    if (await isMaintenanceMode()) {
      return res.redirect("/");
    }

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const formattedErrors = [];
      const seen = new Set();

      errors.array().forEach((err) => {
        if (!seen.has(err.path)) {
          formattedErrors.push({
            field: err.path,
            message: err.msg,
          });
          seen.add(err.path); // Seen ensures only one error per field, so your EJS shows one message for password, not multiple.
        }
      });

      return res.render("sign-up", {
        title: "Sign Up",
        errors: formattedErrors,
        formData: req.body || {},
        passwordRules,
        csrfToken: req.csrfToken(),
      });
    }

       // const sanitize = (v) => (v === "" ? null : v);
    // const sanitize = (v) => (typeof v === "string" ? v.trim() : v);
    // const sanitize = (v) =>
    //   typeof v === "string" ? (v.trim() === "" ? null : v.trim()) : v;

    // const first_name = sanitize(req.body.first_name);
    // const last_name = sanitize(req.body.last_name);
    const { first_name, last_name, email, birthdate, password } = req.body;

    const password_hash = await bcrypt.hash(password, 12);

    await insertNewUser(first_name, last_name, email, birthdate, password_hash);

    return res.redirect("/app/log-in");
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
      errors: [],
      formData: {},
    });
  } catch (err) {
    next(err);
  }
}

async function postLogIn(req, res, next) {
  passport.authenticate("local", async (err, user, info) => {
    if (err) return next(err);

    if (!user) {
      return res.render("log-in", {
        title: "Log In",
        errors: [
          {
            field: "auth",
            message: info.message || "Invalid email or password",
          },
        ],
        formData: req.body || {},
        csrfToken: req.csrfToken(), // Even though this is global for GET, putting this here explicitly to handle errors when validationCreateUser or validationEditUser catches an incorrect email, password, or confirm_password is used; without this here a 500 error pops off!
      });
    }

    try {
      if ((await isMaintenanceMode()) && user.permission_status !== "admin") {
        return res.redirect("/");
      }

      console.log("🎈 User authenticated!");

      // Update last login
      await updateLastLogin(user.id);

      // Log the user in (Passport session)
      req.login(user, async (err) => {
        if (err) {
          console.error("Error during login:", err); // Log error for debugging
          return next(err);
        }

        try {
          await insertSessionLog(
            user.id,
            req.sessionID,
            req.ip,
            req.headers["user-agent"],
          );
        } catch (logErr) {
          console.error("Failed to create session log:", logErr);
        }

        if (user.permission_status === "admin") {
          res.redirect("/app/admin");
        } else {
          res.redirect("/app/message-boards");
        }
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
  getSignUpPage,
  postSignUpPage,
  getLogIn,
  postLogIn,
  postLogOut,
};
