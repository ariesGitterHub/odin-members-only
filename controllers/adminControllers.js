const bcrypt = require("bcryptjs");
// const passport = require("passport");
// const { v4: uuidv4 } = require('uuid'); // To generate a session token
// const { check, validationResult } = require("express-validator");
const { validationResult } = require("express-validator");
// const { hasRole } = require("../utils/permissions");
const { usStates } = require("../utils/usStates");

const {
  getUsers,
  getUserById,
//   insertNewUser,
  insertAdminCreatedUser,
  updateAdminEditedUser,
//   updateUser,
//   updateUserAvatar,
//   updateUserToMember,
  deleteUserById,
//   checkIfEmailExistsForSignUp,
  checkIfEmailExists,
//   updateLastLogin,
} = require("../db/queries/userQueries");

const {
  getMessages,
//   getMessageById,
//   getTopicById,
//   getTopicNames,
//   insertMessage,
//   getAllTopics,
//   getTopicBySlug,
//   getValidMessagesByTopic,
//   updateMessage,
//   stickyMessageById,
//   softDeleteMessageById,
//   incrementReplyCount,
//   toggleLike,
//   // TODO - get these working as CRON jobs
//   softDeleteExpiredMessages,
//   hardDeleteMessages,
//   cleanupMessages,
} = require("../db/queries/messageQueries");

const { calculateAge, formatShortDate } = require("../utils/calculateAge");

const {
  getZodiacSign,
  getRealZodiacSign,
  getChineseZodiacFull,
} = require("../utils/zodiacSigns");

const {
  addBirthdateFields,
  addSessionCreateDateFields,
  addSessionUpdateDateFields,
  addSessionLastLoginDateFields,
  addZodiacSigns,
  addRealZodiacSigns,
  addChineseZodiacSigns,
} = require("../utils/viewFormatters");


// CONTROLLER: ADMIN PAGE (admin.ejs)

async function getAdminPage(req, res, next) {
  try {
    const users = await getUsers();
    const messages = await getMessages();

    const usersWithBirthdates = addBirthdateFields(
      users,
      calculateAge,
      formatShortDate,
    );
    const usersWithCreationDates = addSessionCreateDateFields(
      usersWithBirthdates,
      formatShortDate,
    );
    const usersWithUpdateDates = addSessionUpdateDateFields(
      usersWithCreationDates,
      formatShortDate,
    );
    const usersWithLastLoginDates = addSessionLastLoginDateFields(
      usersWithUpdateDates,
      formatShortDate,
    );
    const usersWithZodiacSigns = addZodiacSigns(
      usersWithLastLoginDates,
      getZodiacSign,
    );
    const usersWithRealZodiacSigns = addRealZodiacSigns(
      usersWithZodiacSigns,
      getRealZodiacSign,
    );
    const usersWithChineseZodiacSigns = addChineseZodiacSigns(
      usersWithRealZodiacSigns,
      getChineseZodiacFull,
    );
    // NOTE - that usersWithDates is added into the const below...because there can only be a single "users" far below (see "!!!-HERE-!!!") on "users: usersWithAvatars" or it blows a 500 error.
    // const usersWithAvatars = addAvatarFields(
    //   usersWithChineseZodiacSigns,
    //   avatarTypeDefault,
    // );

    res.render("admin", {
      title: "Admin",
      // users: usersWithDates,
      // "!!!-HERE-!!!" (see comments above in this controller)
      // users: usersWithAvatars,
      users: usersWithChineseZodiacSigns,
      messages,
      // usersWithDates,
      // usersWithAvatars,
      errors: [],
    });
  } catch (err) {
    next(err);
  }
}

// CONTROLLER: ADMIN CREATE PAGE (admin-create.ejs)

async function getAdminCreatePage(req, res, next) {
  try {
    res.render("admin-create", {
      title: "Admin Create",
      errors: [],
      formData: req.body || {},
    }); // Just render an empty form
  } catch (err) {
    next(err);
  }
}

async function postAdminCreatePage(req, res, next) {
  console.log("Controller hit!");
  console.log("req.user:", req.user);
  console.log("req.body:", req.body);

  const {
    first_name,
    last_name,
    email,
    birthdate,
    password,
    confirm_password,
    notes,
  } = req.body;
  const errors = [];

  // Simple validation checks
  // if (
  //   !first_name ||
  //   !last_name ||
  //   !email ||
  //   !birthdate ||
  //   !password ||
  //   !confirm_password
  // ) {
  //   errors.push("All fields are required.");
  // }

  // if (password !== confirm_password) {
  //   errors.push("Passwords do not match.");
  // }

  // if (errors.length > 0) {
  //   return res.render("admin-create", {
  //     title: "Admin Create",
  //     user: req.user,
  //     errors,
  //     formData: req.body || {},
  //   });
  // }

  try {
    // Below - no id needed at sign-up, only use id for edits/updates
    // const existingUser = await checkIfEmailExists(email, user_id);
    // const existingUser = await checkIfEmailExists(email);

    // if (existingUser.length > 0) {
    //   errors.push("Email is already taken.");
    //   return res.render("admin-create", {
    //     title: "Admin Create",
    //     user: req.user,
    //     errors,
    //     formData: req.body || {},
    //   });
    // }

    // Run validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const formattedErrors = [];
      const seen = new Set();
      errors.array().forEach((err) => {
        if (!seen.has(err.path)) {
          formattedErrors.push({ param: err.path, msg: err.msg });
          seen.add(err.path); // seen ensures only one error per field, so your EJS shows one message for password, not multiple.
        }
      });

      return res.render("admin-create", {
        title: "Admin Create",
        errors: formattedErrors,
        formData: req.body || {},
      });
    }

    // Hash the password before saving
    const password_hash = await bcrypt.hash(password, 12);
    console.log("Password hashed");

    // let notes = req.body.notes;
    // if (!notes) notes = "Admin created user.";
    const notes = req.body.notes || "Admin created user.";
    console.log("Notes created");

    // const permission_status = req.body.permission_status || "guest";

    // Insert the new admin-created user (avatar_type generated inside the function)
    await insertAdminCreatedUser(
      first_name,
      last_name,
      email,
      birthdate,
      password_hash,
      // permission_status,
      notes,
    );
    console.log("User inserted successfully");

    // Redirect after successful creation
    res.redirect("/app/admin");
    console.log("Redirected to /app/admin");
  } catch (err) {
    next(err);
  }
}


// CONTROLLER: ADMIN EDIT PAGE (admin-edit.ejs)

async function getAdminEditPage(req, res, next) {
  try {
    const targetId = req.params.id;
    const user = await getUserById(targetId);

    //Format birthdate for input/display
    if (user.birthdate instanceof Date) {
      user.birthdate = user.birthdate.toISOString().split("T")[0];
    }
    if (!user) return res.status(404).send("User not found");
    res.render("admin-edit", {
      title: "Admin Edit",
      user,
      usStates: usStates, // Pass the array to the EJS template   ????    
      errors: [],
      formData: user,
    }); // Pass user to EJS view
  } catch (err) {
    next(err);
  }
}

//Keep while I refactor validation into this...
async function postAdminEditPage(req, res, next) {
  console.log("Controller hit!");

  const user_id = req.params.id;

  const {
    first_name,
    last_name,
    email,
    birthdate,
    password,
    confirm_password,
    permission_status,
    verified_by_admin,
    guest_upgrade_invite,
    invite_decision,
    is_active,
    avatar_type,
    avatar_color_fg,
    avatar_color_bg_top,
    avatar_color_bg_bottom,
    phone,
    street_address,
    apt_unit,
    city,
    us_state,
    zip_code,
    notes,
  } = req.body;

  const errors = [];

  // Simple validation checks
  // if (
  //   !first_name ||
  //   !last_name ||
  //   !email ||
  //   !birthdate ||
  //   !permission_status ||
  //   !member_request ||
  //   !active_status ||
  //   !verified_by_admin
  // ) {
  //   errors.push("All fields are required.");
  // }

  if (password && password !== confirm_password) {
    errors.push("Passwords do not match.");
  }

  const existingUser = await checkIfEmailExists(email, user_id);

  if (existingUser.length > 0) {
    errors.push("Email is already taken.");
    return res.render("admin-edit", {
      title: "Admin Edit",
      user: req.user,
      errors,
      formData: req.body || {},
    });
  }

  if (errors.length > 0) {
    return res.render("admin-edit", {
      title: "Admin Edit",
      user: req.user,
            //  usStates: usStates, // Pass the array to the EJS template  ????  
      errors,
      formData: req.body || {},
    });
  }

  try {
    const sanitize = (v) => (v === "" ? null : v); // Empty strings -> null

    const toBool = (v) => {
      if (v === undefined || v === null) return null;
      if (typeof v === "boolean") return v;
      return v === "true";
    };

    // Convert boolean-like form values
    const safeVerifiedByAdmin = toBool(verified_by_admin);
    const safeGuestUpgradeInvite = toBool(guest_upgrade_invite);
    const safeIsActive = toBool(is_active);

    // Convert form "true"/"false" strings from <select> inputs into real booleans.
    // Or, more explicitly...the following happens...
    // Form select elements send strings, not booleans ("true" / "false"), as HTML <select> fields always submit values as strings ("true" or "false").
    // Below converts them to real booleans by comparing to the string "true".
    // In comparing to "true" converts the value into a proper boolean:
    // "true" === "true" → true
    // "false" === "true" → false
    // This safely converts form values to booleans for the database.
    // const safeMemberRequest =
    //   member_request === "true" || member_request === true;
    // const safeIsActive = is_active === "true" || is_active === true;
    // const safeVerifiedByAdmin =
    //   verified_by_admin === "true" || verified_by_admin === true;
    // // Insert the new admin-created user (avatar_type generated inside the function)
    // const sanitize = (v) => (v === "" ? null : v);

    // --- Update the user ---
    await updateAdminEditedUser(
      user_id,
      sanitize(first_name),
      sanitize(last_name),
      sanitize(email),
      sanitize(birthdate), // Keep as string 'yyyy-MM-dd' for <input type="date">
      password, // hashed inside updateAdminEditedUser if provided
      permission_status, // ENUM string, defaults handled in updateAdminEditedUser if needed
      safeVerifiedByAdmin, // Boolean
      safeGuestUpgradeInvite, // Boolean
      invite_decision, // ENUM string, defaults handled in updateAdminEditedUser if needed
      safeIsActive, // Boolean
      sanitize(avatar_type),
      sanitize(avatar_color_fg),
      sanitize(avatar_color_bg_top),
      sanitize(avatar_color_bg_bottom),
      sanitize(phone),
      sanitize(street_address),
      sanitize(apt_unit),
      sanitize(city),
      sanitize(us_state),
      sanitize(zip_code),
      sanitize(notes),
    );
    console.log("User inserted successfully");

    // Redirect after successful creation
    res.redirect("/app/admin");
    console.log("Redirected to /app/admin");
  } catch (err) {
    next(err);
  }
}


// CONTROLLER: DELETE VIA USER (your-profile.ejs) OR DELETE VIA ADMIN (admin.ejs)

async function deleteUserAccount(req, res, next) {
  try {
    const { targetId } = req.body;
    await deleteUserById(targetId);
    res.redirect("/app/admin");
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAdminPage,
  getAdminCreatePage,
  postAdminCreatePage,
  getAdminEditPage,
  postAdminEditPage,
  deleteUserAccount,
};