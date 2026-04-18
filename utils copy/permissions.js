// This code effectively performs both authentication and authorization checks, but conceptually it’s primarily an authorization guard that includes a basic authentication check.

//This is a Role-Based Access Control (RBAC) set up.
const ROLE_LEVEL = {
  guest: 10,
  member: 20,
  admin: 30
};

// Authentication guard
function hasRole(user, requiredRole) {
  if (!user) return false;

  return ROLE_LEVEL[user.permission_status] >= ROLE_LEVEL[requiredRole];
}
// Authorization guard
function requireRole(requiredRole) {
  return function (req, res, next) {
    const user = req.user; // Use req.user (instead of const user = res.locals.fullUser;) as Passport attaches the user to req object

    if (!user) {
      return res.status(401).redirect("/app/log-in");
    }

    if (!hasRole(user, requiredRole)) {
      const err = new Error("Forbidden");
      err.status = 403;
      return next(err);
    }

    next();
  };
}

// Determines if a user can perform a given action on a resource (message, post, etc.)
function canPerformHasRole(user, action, resource) {
  if (!user) return false;

  // Admin panel self-lockout prevention actions
  const selfLockoutActions = [
    "changePermissionStatus",
    "changeVerifiedByAdmin",
    "changeMemberRequest",
    "changeIsActive",
    "noSelfDeleteByAdmin", // Unused right now until I figure out how to do it from the frontend
  ];

  // Prevent admin from acting on themselves for these sensitive fields
  if (user.id === resource?.id && selfLockoutActions.includes(action)) {
    return false;
  }

  switch (action) {
    // Post-related actions (not related to admin panel)
    case "sticky-message":
      return hasRole(user, "admin");

    // Admin or author only - only the admin or the user who wrote the message may delete it.
    case "admin-or-author":
      return (
        hasRole(user, "admin") ||
        (resource && resource.user_id === user.id)
      );

    // Author only - only the author/writer of a message can edit it
    case "author-only":
      return resource && resource.user_id === user.id;

    // Members only (members and admin level users only)
    case "members-only":
      return (
        hasRole(user, "admin") ||
        hasRole(user, "member")
      );

    // Admin only
    case "admin-only":
      return (
        hasRole(user, "admin")
      );

    // This is a test for member upgrade, must have permission_status === guest, verified_by_admin === true, and guest_upgrade_invite === true to be able to see button.
    case "guest-members-upgrade":
      return hasRole(user, "guest") && user.verified_by_admin === true && user.guest_upgrade_invite === true && user.is_active === true && user.invite_decision === "none";

    // Admin panel profile management actions
    case "changePermissionStatus":
    case "changeVerifiedByAdmin":
    case "changeMemberRequest":
    case "changeIsActive":
      //case "noSelfDeleteByAdmin": // Unused right now until I figure out how to do it from the frontend
      return hasRole(user, "admin"); // Only admins can change others, self-target already blocked

    default:
      return false;
  }
}

module.exports = {
  hasRole,
  requireRole,
  canPerformHasRole,
};
