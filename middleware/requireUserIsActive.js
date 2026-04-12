// middleware/requireUserIsActive.js

const AppError = require("../utils/AppError");

module.exports = function requireUserIsActive(req, res, next) {

  const user = req.user;

  if (!user) return next();
  if (user.is_active !== false) return next();

  return next(
    new AppError("Your account has been disabled.", 403, "ACCOUNT_DISABLED"),
  );
};;