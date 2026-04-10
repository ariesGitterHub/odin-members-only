// const { getUserById } = require("../db/queries/userQueries"); // your DB function

// module.exports = async (req, res, next) => {
//   if (req.user) {
//     try {
//       const fullUser = await getUserById(req.user.id); // fetch full user record
//       res.locals.fullUser = fullUser;
//       req.fullUser = fullUser; // optional, convenient for controllers
//     } catch (err) {
//       return next(err);
//     }
//   } else {
//     res.locals.fullUser = null;
//     req.fullUser = null;
//   }

//   next();
// };

// module.exports = async (req, res, next) => {
//   if (!req.user) {
//     res.locals.user = null;
//     return next();
//   }

//   try {
//     const fullUser = await getUserById(req.user.id);

//     // SINGLE SOURCE OF TRUTH
//     req.fullUser = fullUser;
//     res.locals.user = fullUser; // NOTE & REMINDER - in the view layer, there is only ONE user — the current user, no need to call this fullUser” too.

//     next();
//   } catch (err) {
//     next(err);
//   }
// };