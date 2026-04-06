const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const { usStates } = require("../utils/usStates");

const {
  getUsers,
  getUserById,
  insertAdminCreatedUser,
  updateAdminEditedUser,
  deleteUserById,
  // checkIfEmailExists,
} = require("../db/queries/userQueries");

const { getAllSiteControls, updateAllSiteControls } = require("../db/queries/appConfigQueries");

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
    const users = await getUsers();
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
      maintenance_mode,
    } = req.body;

    // Basic validation
    const values = [
      message_soft_delete_days,
      message_hard_delete_days,
      session_hard_delete_days,
    ];

    const parsedValues = values.map((v) => Number(v));

    const hasInvalid = parsedValues.some((v) => Number.isNaN(v) || v < 0);

    if (hasInvalid) {
      // You could also store this in a flash message
      return res.redirect("/app/admin?error=invalid-input");
    }

    // Now we handle maintenance_mode separately since it's a boolean
    const isMaintenanceModeEnabled = maintenance_mode === "on"; // You can adjust this based on your form input

    // ✅ Call your query
    await updateAllSiteControls(
      parsedValues[0],
      parsedValues[1],
      parsedValues[2],
      isMaintenanceModeEnabled, // maintenance_mode as boolean
    );

    // ✅ Redirect on success
    return res.redirect("/app/admin?success=site-settings-updated");
  } catch (err) {
    console.error("Error updating site settings:", err);

    // Option 1 (recommended): pass to global error handler
    return next(err);

    // Option 2 (alternative): redirect with error
    // return res.redirect("/admin?error=update-failed");
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

  // Simple validation checks -- OLD
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

  // Check if password is the same -- OLD
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
    const userId = req.params.id;
    const user = await getUserById(userId);

    //Format birthdate for input/display
    if (user.birthdate instanceof Date) {
      user.birthdate = user.birthdate.toISOString().split("T")[0];
    }
    if (!user) return res.status(404).send("User not found");
    res.render("admin-edit", {
      title: "Admin Edit",
      user,
      usStates: usStates, // Pass the array to the EJS template
      errors: [],
      formData: user,
    }); // Pass user to EJS view
  } catch (err) {
    next(err);
  }
}

async function postAdminEditPage(req, res, next) {
  console.log("Controller hit!");

  const userId = parseInt(req.params.id, 10); // the user being edited
  const user = await getUserById(userId); // fetch target user

  if (!user) return res.status(404).send("User not found");

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
        // user: targetUser, // show the user being edited
        user,
        errors: formattedErrors,
        formData: req.body || {},
        usStates: usStates,
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
      userId, // ID of the user being edited
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

    console.log("User updated successfully");

    res.redirect("/app/admin");
  } catch (err) {
    next(err);
  }
}

// CONTROLLER: DELETE VIA USER (your-profile.ejs) OR DELETE VIA ADMIN (admin.ejs)

async function deleteUserAccount(req, res, next) {
  try {
    // targetId from req.body of user account's id number to be deleted.
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
