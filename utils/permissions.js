const ROLE_LEVEL = {
  guest: 1,
  member: 2,
  admin: 3,
};

function hasRole(user, requiredRole) {
  if (!user) return false;

  return ROLE_LEVEL[user.permission_status] >= ROLE_LEVEL[requiredRole];
}

function requireRole(requiredRole) {
  return function (req, res, next) {
    const user = res.locals.currentUser;

    if (!user) {
      return res.status(401).redirect("/login");
    }

    if (!hasRole(user, requiredRole)) {
      return res.status(403).render("403"); // or .send("Forbidden")
    }

    next();
  };
}

module.exports = {
  hasRole,
  requireRole,
};
