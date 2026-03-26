// const bcrypt = require("bcryptjs");
// const passport = require("passport");
// const { v4: uuidv4 } = require('uuid'); // To generate a session token
// const { check, validationResult } = require("express-validator");
// const { validationResult } = require("express-validator");
// const { hasRole } = require("../utils/permissions");
// const { buildThreadedMessages } = require("../utils/threadUtils");
// const { usStates } = require("../utils/usStates");

const {
  // getUsers,
  getUserById,
  // insertNewUser,
  // insertAdminCreatedUser,
  // updateAdminEditedUser,
  updateUser,
  updateUserAvatar,
  // updateUserToMember,
  deleteUserById,
  // checkIfEmailExistsForSignUp,
  checkIfEmailExists,
  // updateLastLogin,
} = require("../db/queries/userQueries");

const { calculateAge, formatShortDate } = require("../utils/calculateAge");

const {
  addBirthdateFields,
} = require("../utils/viewFormatters");

// CONTROLLER: GET CURRENT USER

async function getCurrentUser(req, res, next) {
  try {
    if (req.user) {
      // Only send safe fields
      const safeUser = {
        id: req.user.id,
        email: req.user.email,
        first_name: req.user.first_name,
        last_name: req.user.last_name,
        birthdate: req.user.birthdate,
        permission_status: req.user.permission_status,
        verified_by_admin: req.user.verified_by_admin,
        guest_upgrade_invite: req.user.guest_upgrade_invite,
        invite_decision: req.user.invite_decision,
        // avatarLetter: req.user.avatarLetter,
        avatar_type: req.user.avatar_type,
        avatar_color_fg: req.user.avatar_color_fg,
        avatar_color_bg_top: req.user.avatar_color_bg_top,
        avatar_color_bg_bottom: req.user.avatar_color_bg_bottom,
        phone: req.user.phone,
        street_address: req.user.street_address,
        apt_unit: req.user.apt_unit,
        city: req.user.city,
        us_state: req.user.us_state,
        zip_code: req.user.zip_code,
      };

      res.json(safeUser);
    } else {
      res.json(null); // or res.status(401).json({ user: null })
    }
  } catch (err) {
    next(err);
  }
}

// CONTROLLER: GET USERS BY ID

// Function to fetch individual user data for modal
async function getUserDetails(req, res, next) {
  const targetId = req.params.id; // Get user ID from URL parameter
  try {
    const user = await getUserById(targetId); // Replace with your actual query
    if (user.birthdate instanceof Date) {
      user.birthdate = user.birthdate.toISOString().split("T")[0];
    }

    if (user) {
      res.json(user); // Send user data as JSON
    } else {
      res.status(404).send("User not found");
    }
  } catch (err) {
    next(err); // Pass error to the error handling middleware
  }
}

// CONTROLLER: YOUR PROFILE PAGE (your-profile.ejs)

async function getYourProfilePage(req, res, next) {
  if (!req.user) {
    return res.redirect("/app/log-in"); // No logged-in user
  }

  // Clone the user so we can add computed fields
  const currentUser = { ...req.user };

  // Format birthdate for input/display
  // if (currentUser.birthdate instanceof Date) {
  //   currentUser.birthdate = currentUser.birthdate.toISOString().split("T")[0];
  // }

  // Add computed fields: age, formattedBirthdate
  const currentUserWithBirthdate = addBirthdateFields(
    [currentUser], // pass as array to reuse your helper
    calculateAge,
    formatShortDate,
  )[0]; // get first element

  // Add avatar fields
  // const currentUserWithAvatar = addAvatarFields(
  //   [currentUserWithBirthdate],
  //   avatarTypeDefault,
  // )[0];

  try {
    res.render("your-profile", {
      title: "Your Profile",
      // currentUser: currentUserWithAvatar, // send single processed user
      currentUser: currentUserWithBirthdate,
      errors: [],
    });
  } catch (err) {
    next(err);
  }
}


// CONTROLLER: DELETE VIA USER (your-profile.ejs)

async function deleteYourAccount(req, res, next) {
  try {
    // TODO - use below as the model!!!!!

    // Use req.user to ensure the logged-in user is deleting their own account
    const targetId = req.user.id;

    // Perform the deletion for the authenticated user (not a user provided in the body)
    await deleteUserById(targetId);

    res.redirect("/app");
  } catch (err) {
    next(err);
  }
}


// CONTROLLER: EDIT PROFILE MODAL (edit-profile.ejs)
async function postYourProfilePageEdit(req, res, next) {
  console.log("Controller hit!");

  const currentUser_id = req.user.id; // Always use logged-in user ID

  const {
    first_name,
    last_name,
    email,
    birthdate,
    password,
    confirm_password,
    phone,
    street_address,
    apt_unit,
    city,
    us_state,
    zip_code,
  } = req.body;

  const errors = [];

  // Simple validation checks
  if (password && password !== confirm_password) {
    errors.push("Passwords do not match.");
  }

  const existingUser = await checkIfEmailExists(email, currentUser_id);

  if (existingUser.length > 0) {
    errors.push("Email is already taken.");
    return res.render("your-profile", {
      title: "Your Profile",
      user: req.user,
      errors,
      formData: req.body || {},
    });
  }

  if (errors.length > 0) {
    return res.render("your-profile", {
      title: "Your Profile",
      user: req.user,
      errors,
      formData: req.body || {},
    });
  }

  try {
    const sanitize = (v) => (v === "" ? null : v); // Empty strings -> null

    // --- Update the user ---
    await updateUser(
      currentUser_id,
      sanitize(first_name),
      sanitize(last_name),
      sanitize(email),
      sanitize(birthdate), // Keep as string 'yyyy-MM-dd' for <input type="date">
      password, // hashed inside updateAdminEditedUser if provided
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


// CONTROLLER: CHANGE AVATAR MODAL (change-avatar.ejs)

async function postYourProfilePageAvatar(req, res, next) {
  console.log("Controller hit!");

  const currentUser_id = req.user.id; // Always use logged-in user ID

  const {
    avatar_type,
    avatar_color_fg,
    avatar_color_bg_top,
    avatar_color_bg_bottom,
  } = req.body;

  try {
    const sanitize = (v) => (v === "" ? null : v); // Empty strings -> null

    // --- Update the user ---
    await updateUserAvatar(
      currentUser_id,
      sanitize(avatar_type),
      sanitize(avatar_color_fg),
      sanitize(avatar_color_bg_top),
      sanitize(avatar_color_bg_bottom),
    );
    console.log("User avatar changes inserted successfully");

    // Redirect after successful creation
    res.redirect("/app/your-profile");
    console.log("Redirected to /app/your-profile");
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getCurrentUser,
  getUserDetails,
  getYourProfilePage,
  deleteYourAccount,
  postYourProfilePageEdit,
  postYourProfilePageAvatar,
};
