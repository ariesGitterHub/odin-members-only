// This code effectively performs both authentication adn authorization checks, but conceptually it’s primarily an authorization guard that includes a basic authentication check.

//This ia na Role-Based Access Control (RBAC) set up.
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

// Determines if a user can perform a given action on a resource (message, post, etc.)
// function canPerformHasRole(user, action, resource) {
//   if (!user) return false;

//   switch (action) {
//     case "sticky-post":
//       // Only admins can sticky a post
//       return hasRole(user, "admin");
//     case "delete-post":
//       // Admins can delete any post
//       // Users can delete their own posts
//       return (
//         hasRole(user, "admin") || (resource && resource.user_id === user.id)
//       );
//     case "edit":
//       // Example: users can edit their own post, admins can edit anything
//       return (
//         hasRole(user, "admin") || (resource && resource.user_id === user.id)
//       );
//     default:
//       return false;
//   }
// }


function canPerformHasRole(user, action, resource) {
  if (!user) return false;

  // Admin panel self-lockout actions
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

    case "delete-message":
      return (
        hasRole(user, "admin") || (resource && resource.user_id === user.id)
      );

    // Unused at this time...
    case "admin-edit-profile":
      return (
        hasRole(user, "admin") || (resource && resource.user_id === user.id)
      );
    // Unused at this time...
    case "admin-delete-profile":
      return (
        hasRole(user, "admin") || (resource && resource.user_id === user.id)
      );

    // Admin panel profile management actions
    case "changePermissionStatus":
    case "changeVerifiedByAdmin":
    case "changeMemberRequest":
    case "changeIsActive":
    case "noSelfDeleteByAdmin": // Unused right now until I figure out how to do it from the frontend
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
