const { canPerformHasRole } = require("../utils/permissions"); // Import your permission utility

module.exports = (req, res, next) => {
  res.locals.canPerformHasRole = canPerformHasRole;
  next();
};
