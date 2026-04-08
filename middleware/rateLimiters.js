const rateLimit = require("express-rate-limit");

    // Set up rate limiting for sign-up (guest registration)
    const signupLimiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
      // windowMs: config.signup_limit_window_minutes * 60 * 1000, // 15 minutes
        max: 5, // Limit each IP to 5 sign-ups per window
      // max: config.signup_limit_max_users, // Limit each IP to 5 sign-ups per window
      message: "Too many sign-up attempts, please try again later.",
      standardHeaders: true,
      legacyHeaders: false,
    });

    // Set up rate limiting for login attempts (if guests can log in later)
    const loginLimiter = rateLimit({
        windowMs: 5 * 60 * 1000, // 5 minutes
      // windowMs: config.login_limit_window_minutes * 60 * 1000, // 5 minutes
        max: 5, // Limit each IP to 3 login attempts per window
      // max: config.login_limit_max_users, // Limit each IP to 3 login attempts per window
      message: "Too many login attempts, please try again later.",
      standardHeaders: true,
      legacyHeaders: false,
    });

    // NOT USED CURRENTLY - MAYBE AT A LATER DATE
    // Set up rate limiting for message posting (guests can post)
    // const postLimiter = rateLimit({
    //   windowMs: 15 * 60 * 1000, // 15 minutes
    //   max: 20, // Limit each guest to 20 posts per window
    //   message: 'Too many posts from this IP, please wait a while before posting again.',
    //   standardHeaders: true,
    //   legacyHeaders: false,
    // });



module.exports = { 
    signupLimiter,
    loginLimiter,
    // postLimiter, 
 };
