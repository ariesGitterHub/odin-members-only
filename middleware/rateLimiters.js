const rateLimit = require("express-rate-limit");

const { getAllSiteControls } = require("../db/queries/appConfigQueries");

function createRateLimiter(configGetter) {
  return async (req, res, next) => {
    try {
      // Fetch latest config from the DB
      const config = await configGetter();

      const {
        signup_limit_window_minutes,
        signup_limit_max_users,
        login_limit_window_minutes,
        login_limit_max_users,
      } = config;

      // Log the values of the four variables
      console.log("Rate Limiter Config: ", {
        signup_limit_window_minutes,
        signup_limit_max_users,
        login_limit_window_minutes,
        login_limit_max_users,
      });

      // Check which route is being hit to apply the correct limiter
      if (req.path === "/sign-up") {
        // Set up rate limiting for sign-up (guest registration)
        const signupLimiter = rateLimit({
          // windowMs: 15 * 60 * 1000, // 15 minutes
          windowMs: signup_limit_window_minutes * 60 * 1000, // 15 minutes
          // max: 5, // Limit each IP to 5 sign-ups per window
          max: signup_limit_max_users, // Limit each IP to 5 sign-ups per window
          message: "Too many sign-up attempts, please try again later.",
          standardHeaders: true,
          legacyHeaders: false,
        });

        return signupLimiter(req, res, next);
      }

      if (req.path === "/log-in") {
        // Set up rate limiting for login attempts (if guests can log in later)
        const loginLimiter = rateLimit({
          // windowMs: 5 * 60 * 1000, // 5 minutes
          windowMs: login_limit_window_minutes * 60 * 1000, // 5 minutes
          // max: 5, // Limit each IP to 3 login attempts per window
          max: login_limit_max_users, // Limit each IP to 3 login attempts per window
          message: "Too many login attempts, please try again later.",
          standardHeaders: true,
          legacyHeaders: false,
        });

        return loginLimiter(req, res, next);
      }

      // If no specific rate limiter for the path, just proceed
      return next();
    } catch (err) {
      console.error("Error in rate limiter:", err);
      return res.status(500).send("Error with rate limiter configuration.");
    }
  };
}

const rateLimiter = createRateLimiter(getAllSiteControls);

module.exports = rateLimiter;

