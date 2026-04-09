const { getUserById } = require("../db/queries/userQueries"); // your DB function

module.exports = async (req, res, next) => {
  if (req.user) {
    try {
      const fullUser = await getUserById(req.user.id); // fetch full user record
      res.locals.currentUser = fullUser;
      req.currentUser = fullUser; // optional, convenient for controllers
    } catch (err) {
      return next(err);
    }
  } else {
    res.locals.currentUser = null;
    req.currentUser = null;
  }

  next();
};
