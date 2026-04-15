const { validationResult } = require("express-validator");
const { usStates } = require("../utils/usStates");
const passwordRules = require("../config/passwordRules");
const {
  getUserForModalData,
  getUserProfileData,
  updateUser,
  updateUserAvatar,
  deleteUserById,
} = require("../db/queries/userQueries");
const { calculateAge, formatShortDate } = require("../utils/calculateAge");
const { addBirthdateFields } = require("../utils/viewFormatters");

// CONTROLLER: MODAL DATA FOR FRONTEND FETCH
async function getModalDataToFrontend(req, res, next) {
  try {
    if (!req.user) {
      return res.json(null);
    }

    const userId = req.user.id;
    const userData = await getUserForModalData(userId);

    return res.json(userData);
  } catch (err) {
    next(err);
  }
}

// CONTROLLER: GET USERS BY ID FOR FRONTEND FETCH
async function getUserId(req, res, next) {
  try {
    const targetId = req.params.id;
    const userId = await getUserForModalData(targetId);

    if (!userId) {
      return res.status(404).json({ error: "UserId not found" });
    } else {
      return res.json(userId);
    }
  } catch (err) {
    next(err);
  }
}

// CONTROLLER: YOUR PROFILE PAGE (your-profile.ejs)
async function getYourProfilePage(req, res, next) {
  if (!req.user) {
    return res.redirect("/app/log-in"); // User not logged in
  }

  try {
    const userProfile = await getUserProfileData(req.user.id);
    if (!userProfile) {
      return res.status(404).render("error", {
        message: "User not found",
      });
    }

    const [userBirthdate] = addBirthdateFields(
      [userProfile], // Pass as array to reuse your helper
      calculateAge,
      formatShortDate,
    );

    return res.render("your-profile", {
      title: "Your Profile",
      userProfile: userBirthdate,
      errors: [],
      reopenModal: false,
    });
  } catch (err) {
    next(err);
  }
}

// CONTROLLER: DELETE VIA USER (your-profile.ejs)
async function deleteYourAccount(req, res, next) {
  if (!req.user) {
    return res.redirect("/app/log-in");
  }

  try {
    // Block admins from deleting their own accounts
    if (req.user.permission_status === "admin") {
      const err = new Error("Admins cannot delete their own accounts.");
      err.status = 403;
      err.code = "ADMIN_SELF_DELETE_BLOCKED"; // FIX: structured error
      return next(err);
    }

    await deleteUserById(req.user.id);
    return res.redirect("/app");
  } catch (err) {
    next(err);
  }
}

// CONTROLLER: EDIT PROFILE PAGE (edit-profile.ejs)
async function getEditProfilePage(req, res, next) {
  if (!req.user) {
    return res.redirect("/app/log-in");
  }
  try {
    const userProfile = await getUserProfileData(req.user.id);
    if (!userProfile) {
      return res.status(404).render("error", {
        message: "User profile not found",
      });
    }

    //Format birthdate for input/display
    if (userProfile.birthdate instanceof Date) {
      userProfile.birthdate = userProfile.birthdate.toISOString().split("T")[0];
    }

    return res.render("edit-profile", {
      title: "Edit Profile",
      userProfile,
      usStates,
      errors: [],
      formData: userProfile,
      passwordRules,
    });
  } catch (err) {
    next(err);
  }
}

// async function postEditProfilePage(req, res, next) {
//   try {
//   if (!req.user) {
//     return res.redirect("/app/log-in");
//   }

//   const userId = req.user.id;
//   const {
//     first_name,
//     last_name,
//     email,
//     birthdate,
//     password,
//     confirm_password,
//     phone,
//     street_address,
//     apt_unit,
//     city,
//     us_state,
//     zip_code,
//   } = req.body;

//     const userProfile = await getUserProfileData(userId);

//     if (!userProfile) return res.status(404).send("User profile not found");

//     // --- Run validation from middleware ---
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       const formattedErrors = [];
//       const seen = new Set();
//       errors.array().forEach((err) => {
//         if (!seen.has(err.path)) {
//           formattedErrors.push({ param: err.path, msg: err.msg });
//           seen.add(err.path);
//         }
//       });

//       return res.render("edit-profile", {
//         title: "Edit Profile",
//         userProfile,
//         errors: formattedErrors,
//         formData: req.body || {},
//         usStates,
//         passwordRules,
//         csrfToken: req.csrfToken(), // Even though this is global for GET, putting this here explicitly to handle errors when validationCreateUser or validationEditUser catches an incorrect email, password, or confirm_password is used; without this here a 500 error pops off!
//       });
//     }

//     // Sanitize fields
//     // const sanitize = (v) => (v === "" ? null : v);
//     // const sanitize = (v) => (typeof v === "string" ? v.trim() : v);
//     const sanitize = (v) =>
//       typeof v === "string" ? (v.trim() === "" ? null : v.trim()) : v;

//     // If updateAdminEditedUser function tries to hash or validate an empty string, it may fail silently or throw, which could redirect to login depending on error handling.
//     const passwordToUpdate = password ? password : null;

//     await updateUser(
//       userId,
//       sanitize(first_name),
//       sanitize(last_name),
//       sanitize(email),
//       sanitize(birthdate),
//       //   password, // hashed inside updateAdminEditedUser if provided
//       passwordToUpdate,
//       sanitize(phone),
//       sanitize(street_address),
//       sanitize(apt_unit),
//       sanitize(city),
//       sanitize(us_state),
//       sanitize(zip_code),
//     );

//     return res.redirect("/app/your-profile");
//   } catch (err) {
//     next(err);
//   }
// }

async function postEditProfilePage(req, res, next) {
  try {
    if (!req.user) {
      return res.redirect("/app/log-in");
    }

    const userId = req.user.id;

    const userProfile = await getUserProfileData(userId);

    if (!userProfile) return res.status(404).send("User profile not found");

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

      return res.render("edit-profile", {
        title: "Edit Profile",
        userProfile,
        errors: formattedErrors,
        formData: req.body || {},
        usStates,
        passwordRules,
        csrfToken: req.csrfToken(), // Even though this is global for GET, putting this here explicitly to handle errors when validationCreateUser or validationEditUser catches an incorrect email, password, or confirm_password is used; without this here a 500 error pops off!
      });
    }
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


    // If updateAdminEditedUser function tries to hash or validate an empty string, it may fail silently or throw, which could redirect to login depending on error handling.
    const passwordToUpdate = password ? password : null;

    await updateUser(
      userId,
      first_name,
      last_name,
      email,
      birthdate,
      //   password, // hashed inside updateAdminEditedUser if provided
      passwordToUpdate,
      phone,
      street_address,
      apt_unit,
      city,
      us_state,
      zip_code,
    );

    return res.redirect("/app/your-profile");
  } catch (err) {
    next(err);
  }
}

// CONTROLLER: CHANGE AVATAR MODAL (change-avatar.ejs)
// async function postYourProfilePageAvatar(req, res, next) {
//   if (!req.user) {
//     return res.redirect("/app/log-in");
//   }

//   const userId = req.user.id;

//   const {
//     avatar_type,
//     avatar_color_fg,
//     avatar_color_bg_top,
//     avatar_color_bg_bottom,
//   } = req.body;

//   try {
//     const sanitize = (v) => (typeof v === "string" ? v.trim() : v);

//     await updateUserAvatar(
//       userId,
//       sanitize(avatar_type),
//       sanitize(avatar_color_fg),
//       sanitize(avatar_color_bg_top),
//       sanitize(avatar_color_bg_bottom),
//     );

//     return res.redirect("/app/your-profile");
//   } catch (err) {
//     next(err);
//   }
// }

async function postYourProfilePageAvatar(req, res, next) {
  try {
  if (!req.user) {
    return res.redirect("/app/log-in");
  }

  const userId = req.user.id;

  const {
    avatar_type,
    avatar_color_fg,
    avatar_color_bg_top,
    avatar_color_bg_bottom,
  } = req.body;

  await updateUserAvatar(
    userId,
    avatar_type,
    avatar_color_fg,
    avatar_color_bg_top,
    avatar_color_bg_bottom,
  );

    return res.redirect("/app/your-profile");
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getModalDataToFrontend,
  getUserId,
  getYourProfilePage,
  deleteYourAccount,
  getEditProfilePage,
  postEditProfilePage,
  postYourProfilePageAvatar,
};
