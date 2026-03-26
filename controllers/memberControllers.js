// const bcrypt = require("bcryptjs");
// const passport = require("passport");
// const { v4: uuidv4 } = require('uuid'); // To generate a session token
// const { check, validationResult } = require("express-validator");
// const { validationResult } = require("express-validator");
// const { hasRole } = require("../utils/permissions");
const { usStates } = require("../utils/usStates");

const {
  getUsers,
  getUserById,
//   insertNewUser,
//   insertAdminCreatedUser,
//   updateAdminEditedUser,
//   updateUser,
//   updateUserAvatar,
  updateUserToMember,
//   deleteUserById,
//   checkIfEmailExistsForSignUp,
//   checkIfEmailExists,
//   updateLastLogin,
} = require("../db/queries/userQueries");

const { calculateAge, formatShortDate } = require("../utils/calculateAge");

const { addBirthdateFields } = require("../utils/viewFormatters");

// CONTROLLER: GET MEMBER DIRECTORY PAGE

async function getMemberDirectory(req, res, next) {
  try {
    const users = await getUsers();

    // const usersWithAvatars = addAvatarFields(users, avatarTypeDefault);

    res.render("member-directory", {
      title: "Member Directory",
      // users: usersWithAvatars,
      users,
      errors: [],
    });
  } catch (err) {
    next(err);
  }
}

// CONTROLLER: GET MEMBER INVITE PAGE

async function getMemberInvite(req, res, next) {
  try {
    const currentUserId = req.user.id;
    const user = await getUserById(currentUserId);

    // const usersWithAvatars = addAvatarFields(users, avatarTypeDefault);

    res.render("member-invite", {
      title: "Member Invite",
      // users: usersWithAvatars,
      // user,
      // formData: user,
      // errors: [],
      user: req.user,
      // errors,
      usStates: usStates, // Pass the array to the EJS template
      formData: req.body || {},
    });
  } catch (err) {
    next(err);
  }
}

async function postMemberInviteAccepted(req, res, next) {
  console.log("Controller hit!");

  const currentUser_id = req.user.id; // Always use logged-in user ID

  const {
    permission_status,
    invite_decision,
    phone,
    street_address,
    apt_unit,
    city,
    us_state,
    zip_code,
  } = req.body;

  const errors = [];

  const validStatuses = ["guest", "member", "admin"];
  if (!validStatuses.includes(permission_status)) {
    errors.push("Invalid permission status.");
  }

  if (errors.length > 0) {
    return res.render("member-invite", {
      title: "Member Invite",
      user: req.user,
      // usStates: usStates, // Pass the array to the EJS template ?????
      errors,
      formData: req.body || {},
    });
  }

  try {
    const sanitize = (v) => (v === "" ? null : v); // Empty strings -> null

    // --- Update the user ---
    await updateUserToMember(
      currentUser_id,
      sanitize(permission_status),
      sanitize(invite_decision),
      sanitize(phone),
      sanitize(street_address),
      sanitize(apt_unit),
      sanitize(city),
      sanitize(us_state),
      sanitize(zip_code),
    );
    console.log("User inserted successfully");

    // Redirect after successful creation
    res.redirect("/app/your-profile");
    console.log("Redirected to /app/your-profile");
  } catch (err) {
    next(err);
  }
}

async function postMemberInviteDeclined(req, res, next) {
  console.log("Controller hit!");

  const currentUser_id = req.user.id; // Always use logged-in user ID

  const {
    invite_decision, // "declined"
  } = req.body;

  const errors = [];

  if (errors.length > 0) {
    return res.render("member-invite", {
      title: "Member Invite",
      user: req.user,
      errors,
      formData: req.body || {},
    });
  }

  try {
    const sanitize = (v) => (v === "" ? null : v); // Empty strings -> null

    // --- Update the user ---
    // Call the updated version of the function for only the fields you need to update.
    await updateUserToMember(
      currentUser_id, // User ID
      null, // No change to permission_status
      sanitize(invite_decision), // "declined"
      null, // No change to phone
      null, // No change to street_address
      null, // No change to apt_unit
      null, // No change to city
      null, // No change to us_state
      null, // No change to zip_code
    );
    console.log("User updated successfully");

    // Redirect after successful creation
    res.redirect("/app/your-profile");
    console.log("Redirected to /app/your-profile");
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getMemberDirectory,
  getMemberInvite,
  postMemberInviteAccepted,
  postMemberInviteDeclined,
};
