const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const { usStates } = require("../utils/usStates");
const passwordRules = require("../config/passwordRules"); 

const {
  // getUsers,
  getUsersForAdmin,
  // getUserById,
  getUserByIdForAdmin,
  insertAdminCreatedUser,
  updateAdminEditedUser,
  deleteUserById,
} = require("../db/queries/userQueries");

const {
  getAllSiteControls,
  updateAllSiteControls,
} = require("../db/queries/appConfigQueries");

const { getMessages } = require("../db/queries/messageQueries");

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
    const users = await getUsersForAdmin();
    const messages = await getMessages();
    const siteControls = await getAllSiteControls();

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

    res.render("admin", {
      title: "Admin Panel",
      users: usersWithChineseZodiacSigns,
      messages,
      config: siteControls,
      errors: [],
      query: req.query, // add this for messages about site settings changes!!!
    });
  } catch (err) {
    next(err);
  }
}

async function postNewSiteSettingsAdminPage(req, res, next) {
  try {
    const {
      message_soft_delete_days,
      message_hard_delete_days,
      session_hard_delete_days,
      signup_limit_window_minutes,
      signup_limit_max_users,
      login_limit_window_minutes,
      login_limit_max_users,
      max_message_chars,
      maintenance_mode,
      admin_emoji,
      member_emoji,
      guest_emoji,
    } = req.body;

    // Basic validation
    const values = [
      message_soft_delete_days,
      message_hard_delete_days,
      session_hard_delete_days,
      signup_limit_window_minutes,
      signup_limit_max_users,
      login_limit_window_minutes,
      login_limit_max_users,
      max_message_chars,
    ];

    const parsedValues = values.map((v) => Number(v));

    const hasInvalid = parsedValues.some((v) => Number.isNaN(v) || v < 0);

    if (hasInvalid) {
      // I could also store this in a flash message, not a fan of flash though
      return res.redirect("/app/admin?error=invalid-input");
    }

    // Handle maintenance_mode separately since it's a boolean
    const isMaintenanceModeEnabled = maintenance_mode === "on"; // I can adjust this based on your form input

    const emojis = [admin_emoji, member_emoji, guest_emoji];

    // Call the query
    await updateAllSiteControls(
      parsedValues[0],
      parsedValues[1],
      parsedValues[2],
      parsedValues[3],
      parsedValues[4],
      parsedValues[5],
      parsedValues[6],
      parsedValues[7],
      isMaintenanceModeEnabled, // maintenance_mode as boolean
      emojis[0],
      emojis[1],
      emojis[2],
    );

    // ✅ Redirect on success
    return res.redirect("/app/admin?success=site-settings-updated");
  } catch (err) {
    console.error("Error updating site settings:", err);

    // Pass to global error handler
    return next(err);
  }
}

// CONTROLLER: ADMIN CREATE PAGE (admin-create.ejs)

async function getAdminCreatePage(req, res, next) {
  try {
    res.render("admin-create", {
      title: "Admin Create",
      errors: [],
      formData: req.body || {},
      passwordRules,
    }); // Just render an empty form
  } catch (err) {
    next(err);
  }
}

async function postAdminCreatePage(req, res, next) {
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

  try {
    // Run middleware validation results
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
        passwordRules,
        csrfToken: req.csrfToken(), // Even though this is global for GET, putting this here explicitly to handle errors when validationCreateUser or validationEditUser catches an incorrect email, password, or confirm_password is used; without this here a 500 error pops off!
      });
    }

    // Hash the password before saving
    const password_hash = await bcrypt.hash(password, 12);

    const notes = req.body.notes || "Admin created user.";

    // Insert the new admin-created user (avatar_type generated inside the function)
    await insertAdminCreatedUser(
      first_name,
      last_name,
      email,
      birthdate,
      password_hash,
      notes,
    );

    // Redirect after successful creation
    res.redirect("/app/admin");
  } catch (err) {
    next(err);
  }
}

// CONTROLLER: ADMIN EDIT PAGE (admin-edit.ejs)

async function getAdminEditPage(req, res, next) {

  const user = req.user; // current user, to avoid header from displaying the data of the user whose profile the admin is looking at.

  try {
    const userProfileId = req.params.id;
    // const user = await getUserById(userId);
    // const user = await getUsersForAdmin(userId);
    const userProfile = await getUserByIdForAdmin(userProfileId); // The profile of the user the admin is looking at, avoids collision with header's use of "user".
    const siteControls = await getAllSiteControls();

    //Format birthdate for input/display
    if (userProfile.birthdate instanceof Date) {
      userProfile.birthdate = userProfile.birthdate.toISOString().split("T")[0];
    }
    if (!userProfile) return res.status(404).send("User profile not found");
    res.render("admin-edit", {
      title: "Admin Edit",
      user,
      userProfile,
      usStates: usStates, // Pass the array to the EJS template
      config: siteControls,
      errors: [],
      formData: userProfile,
      passwordRules,
    }); // Pass user to EJS view
  } catch (err) {
    next(err);
  }
}

async function postAdminEditPage(req, res, next) {
  const user = req.user; // current user, to avoid header from displaying the data of the user whose profile the admin is looking at.

  const userProfileId = parseInt(req.params.id, 10); // the user being edited
  // const user = await getUserById(userId); 
  // const user = await getUsersForAdmin(userId); 
  const userProfile = await getUserByIdForAdmin(userProfileId); // // The profile of the user the admin is looking at, avoids collision with header's use of "user".
  const siteControls = await getAllSiteControls();

  if (!userProfile) return res.status(404).send("User profile not found");

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

  try {
    // --- Run validation from middleware ---
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const formattedErrors = [];
      const seen = new Set();
      errors.array().forEach((err) => {
        if (!seen.has(err.path)) {
          formattedErrors.push({ param: err.path, msg: err.msg });
          seen.add(err.path);
        }
      });

      return res.render("admin-edit", {
        title: "Admin Edit",
        user,
        userProfile,
        config: siteControls,
        errors: formattedErrors,
        formData: req.body || {},
        usStates: usStates,
        passwordRules,
        csrfToken: req.csrfToken(), // Even though this is global for GET, putting this here explicitly to handle errors when validationCreateUser or validationEditUser catches an incorrect email, password, or confirm_password is used; without this here a 500 error pops off!
      });
    }

    // --- Sanitize fields ---
    const sanitize = (v) => (v === "" ? null : v);
    const toBool = (v) => {
      if (v === undefined || v === null) return null;
      if (typeof v === "boolean") return v;
      return v === "true";
    };

    const safeVerifiedByAdmin = toBool(verified_by_admin);
    const safeGuestUpgradeInvite = toBool(guest_upgrade_invite);
    const safeIsActive = toBool(is_active);

    // If updateAdminEditedUser function tries to hash or validate an empty string, it may fail silently or throw, which could redirect to login depending on error handling.
    const passwordToUpdate = password ? password : null;

    // Update user in DB
    await updateAdminEditedUser(
      userProfileId, // ID of the user being edited
      sanitize(first_name),
      sanitize(last_name),
      sanitize(email),
      sanitize(birthdate),
      //   password, // hashed inside updateAdminEditedUser if provided
      passwordToUpdate,
      permission_status,
      safeVerifiedByAdmin,
      safeGuestUpgradeInvite,
      invite_decision,
      safeIsActive,
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

    res.redirect("/app/admin");
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
  postNewSiteSettingsAdminPage,
  getAdminCreatePage,
  postAdminCreatePage,
  getAdminEditPage,
  postAdminEditPage,
  deleteUserAccount,
};
