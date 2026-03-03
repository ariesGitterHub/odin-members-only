// RE-EXAMINE THIS TOMORROW!!!!!

// controllers/appController.js
const bcrypt = require("bcryptjs");
const pool = require("../db/pool"); // PostgreSQL pool
const { hasRole, isExactRole } = require("../utils/permissions"); // Import role-based permission checks
const passport = require("passport"); // Passport authentication

// Display the sign-up form (GET)
async function getSignUp(req, res, next) {
  try {
    res.render("sign-up", {
      title: "Sign Up",
      user: req.user,
      errors: [],
    });
  } catch (err) {
    next(err);
  }
}

// Handle sign-up form submission (POST)
async function postSignUp(req, res, next) {
  const { username, password, confirmPassword } = req.body;
  const errors = [];

  // Simple validation checks
  if (!username || !password || !confirmPassword) {
    errors.push("All fields are required.");
  }

  if (password !== confirmPassword) {
    errors.push("Passwords do not match.");
  }

  if (errors.length > 0) {
    return res.render("sign-up", {
      title: "Sign Up",
      user: req.user,
      errors,
    });
  }

  try {
    // Check if the username already exists in the database
    const { rows } = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [username],
    );

    if (rows.length > 0) {
      errors.push("Username is already taken.");
      return res.render("sign-up", {
        title: "Sign Up",
        user: req.user,
        errors,
      });
    }

    // Hash the password before saving it to the database
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user into the database (default permission as 'guest')
    const insertResult = await pool.query(
      "INSERT INTO users (username, password, permission_status) VALUES ($1, $2, $3) RETURNING *",
      [username, hashedPassword, "guest"],
    );

    // Redirect to the login page after successful sign-up
    res.redirect("/log-in");
  } catch (err) {
    next(err);
  }
}

// Display the log-in form (GET)
async function getLogIn(req, res, next) {
  try {
    res.render("log-in", {
      title: "Log In",
      user: req.user,
      errors: [],
    });
  } catch (err) {
    next(err);
  }
}

// Handle log-in form submission (POST) using Passport authentication
async function postLogIn(req, res, next) {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err); // handle unexpected error
    }

    if (!user) {
      return res.render("log-in", {
        title: "Log In",
        errors: [info.message || "Invalid username or password"],
      });
    }

    // Log the user in
    req.login(user, (err) => {
      if (err) {
        return next(err); // handle login error
      }

      // Redirect to homepage (or the intended route after successful login)
      res.redirect("/");
    });
  })(req, res, next);
}

// Log out the user
async function logout(req, res, next) {
  try {
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      res.redirect("/log-in"); // Redirect to login page after logout
    });
  } catch (err) {
    next(err);
  }
}

// Example of a controller that checks for admin role access using hasRole
exports.adminDashboard = async (req, res) => {
  try {
    const user = req.user;

    // Check if the user has at least 'admin' role using hasRole
    if (!hasRole(user, "admin")) {
      return res
        .status(403)
        .render("403", {
          message: "You do not have permission to access this page.",
        });
    }

    // If the role check passes, render the admin dashboard page
    res.render("admin-dashboard", { user });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .render("error", {
        message: "An error occurred while loading the admin dashboard.",
      });
  }
};

// Example of a controller that checks for exact admin role access using isExactRole
exports.exactAdminDashboard = async (req, res) => {
  try {
    const user = req.user;

    // Check if the user has exactly the 'admin' role using isExactRole
    if (!isExactRole(user, "admin")) {
      return res
        .status(403)
        .render("403", {
          message: "You do not have permission to access this page.",
        });
    }

    // If the role check passes, render the exact admin dashboard page
    res.render("admin-dashboard", { user });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .render("error", {
        message: "An error occurred while loading the admin dashboard.",
      });
  }
};

// Controller for member-only area (accessible by members or higher)
exports.memberArea = async (req, res) => {
  try {
    const user = req.user;

    // Check if the user has at least 'member' role using hasRole
    if (!hasRole(user, "member")) {
      return res
        .status(403)
        .render("403", {
          message: "You must be a member to access this page.",
        });
    }

    // If the role check passes, render the member area page
    res.render("member-area", { user });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .render("error", {
        message: "An error occurred while loading the member area.",
      });
  }
};


// routes/appRouter.js
const { Router } = require('express');
const passport = require('passport');
const appController = require('../controllers/appController');
const { requireRole } = require('../utils/permissions'); // Import requireRole middleware

const appRouter = Router();

// Sign-up Routes
// Display sign-up form
appRouter.get('/sign-up', appController.getSignUp);

// Handle sign-up form submission
appRouter.post('/sign-up', appController.postSignUp);

// Log-in Routes
// Display log-in form
appRouter.get('/log-in', appController.getLogIn);

// Handle log-in form submission using Passport.js
appRouter.post('/log-in', appController.postLogIn);

// Log-out Route
// Handle log-out
appRouter.get('/log-out', appController.logout);

// Admin Dashboard (restricted to users with 'admin' role)
appRouter.get('/admin-dashboard', requireRole('admin'), appController.adminDashboard);

// Exact Admin Dashboard (strictly restricted to users with 'admin' role)
appRouter.get('/exact-admin-dashboard', requireRole('admin'), appController.exactAdminDashboard);

// Member Area (restricted to users with 'member' role or higher)
appRouter.get('/member-area', requireRole('member'), appController.memberArea);

// Example route for accessing a specific post (public)
appRouter.get('/post/:postId', appController.viewPost);

// Catch-all route for 404 errors (not found)
appRouter.use((req, res) => {
  res.status(404).render('404', { message: "Page not found" });
});

module.exports = appRouter;

// utils/permissions.js
function requireRole(requiredRole) {
  return function (req, res, next) {
    const user = req.user;
    
    if (!user) {
      return res.status(401).redirect('/log-in'); // Redirect to login if user is not authenticated
    }

    // Check if the user's role meets or exceeds the required role
    if (!hasRole(user, requiredRole)) {
      return res.status(403).render('403', { message: "You do not have permission to access this page." });
    }

    next(); // User is authorized, continue to the route handler
  };
}

module.exports = {
  requireRole,
};