// This code effectively performs both authentication adn authorization checks, but conceptually it’s primarily an authorization guard that includes a basic authentication check.

//This ia na Role-Based Access Control (RBAC) set up.
const ROLE_LEVEL = {
  guest: 10,
  member: 20,
  admin: 30,
  owner: 100,
};

// Authentication guard
function hasRole(user, requiredRole) {
  if (!user) return false;

  return ROLE_LEVEL[user.permission_status] >= ROLE_LEVEL[requiredRole];
}
// Authorization guard
function requireRole(requiredRole) {
  return function (req, res, next) {
    const user = res.locals.currentUser;

    if (!user) {
      return res.status(401).redirect("/app/log-in");
    }

    if (!hasRole(user, requiredRole)) {
      // return res.status(403).render("403"); // or .send("Forbidden")
      const err = new Error("Forbidden");
      err.status = 403;
      return next(err);
    }

    next();
  };
}

module.exports = {
  hasRole,
  requireRole,
};
