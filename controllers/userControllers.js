const { validationResult } = require("express-validator");
const { usStates } = require("../utils/usStates");

const {
  getUserForModalData,
  getUserById,
  getUserProfileData,
  updateUser,
  updateUserAvatar,
  deleteUserById,
} = require("../db/queries/userQueries");

const { calculateAge, formatShortDate } = require("../utils/calculateAge");

const { addBirthdateFields } = require("../utils/viewFormatters");

// CONTROLLER: GET CURRENT USER

// Frontend fetch - function to fetch current user data for modal

// async function getfullUser(req, res, next) {
//   try {
//     if (req.fullUser) {
//       // Only send safe fields
//       const safeUser = {
//         id: req.fullUser.id,
//         email: req.fullUser.email,
//         first_name: req.fullUser.first_name,
//         last_name: req.fullUser.last_name,
//         birthdate: req.fullUser.birthdate,
//         permission_status: req.fullUser.permission_status,
//         verified_by_admin: req.fullUser.verified_by_admin,
//         guest_upgrade_invite: req.fullUser.guest_upgrade_invite,
//         invite_decision: req.fullUser.invite_decision,
//         avatar_type: req.fullUser.avatar_type,
//         avatar_color_fg: req.fullUser.avatar_color_fg,
//         avatar_color_bg_top: req.fullUser.avatar_color_bg_top,
//         avatar_color_bg_bottom: req.fullUser.avatar_color_bg_bottom,
//         phone: req.fullUser.phone,
//         street_address: req.fullUser.street_address,
//         apt_unit: req.fullUser.apt_unit,
//         city: req.fullUser.city,
//         us_state: req.fullUser.us_state,
//         zip_code: req.fullUser.zip_code,
//       };

//       res.json(safeUser);
//     } else {
//       res.json(null); // or res.status(401).json({ user: null })
//     }
//   } catch (err) {
//     next(err);
//   }
// }

async function getModalDataToFrontend(req, res, next) {
  const userId = req.user.id
  try {
  const user = await getUserForModalData(userId);

  if (!req.user) {
      res.json(null);
    } else {
      res.json(user);
    }
  } catch (err) {
    next(err);
  }
}


// CONTROLLER: GET USERS BY ID

// // Frontend fetch - function to fetch individual user data for modal
// async function getUserDetails(req, res, next) {
//   const targetId = req.params.id; // Get user ID from URL parameter
//   try {
//     const user = await getUserById(targetId); // Replace with your actual query
//   if (!user) {
//     return res.status(404).render("error", {
//       message: "User not found"
//     })
//   }
//     if (user.birthdate instanceof Date) {
//       user.birthdate = user.birthdate.toISOString().split("T")[0];
//     }

//     if (user) {
//       res.json(user); // Send user data as JSON
//     } else {
//       res.status(404).send("User not found");
//     }
//   } catch (err) {
//     next(err); // Pass error to the error handling middleware
//   }
// }

async function getUserId(req, res, next) {
  const targetId = req.params.id; // Get user ID from URL parameter
  try {
    const user = await getUserForModalData(targetId); // Replace with your actual query
  if (!user) {
    return res.status(404).render("error", {
      message: "User not found"
    })
  } else {
      res.json(user); // Send user data as JSON 
  }

  } catch (err) {
    next(err); // Pass error to the error handling middleware
  }
}

// CONTROLLER: YOUR PROFILE PAGE (your-profile.ejs)

async function getYourProfilePage(req, res, next) {
  if (!req.user) {
    return res.redirect("/app/log-in"); // User not logged in
  }

  try {
    const user = await getUserProfileData(req.user.id); 
  if (!user) {
    return res.status(404).render("error", {
      message: "User not found"
    });
  }
    // Add computed fields: age, formattedBirthdate
    // const userBirthdate = addBirthdateFields(
    //   [user], // pass as array to reuse your helper
    //   calculateAge,
    //   formatShortDate,
    // )[0]; // get first element

    const [userBirthdate] = addBirthdateFields(
      [user], // pass as array to reuse your helper
      calculateAge,
      formatShortDate,
    ); // get first element


    res.render("your-profile", {
      title: "Your Profile",
      user: userBirthdate,
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
    return res.redirect("/app/log-in"); // User not logged in
  }
  try {
    const userId = req.user.id;

    // Perform the deletion for the authenticated user (not a user provided in the body)
    await deleteUserById(userId);

    res.redirect("/app");
  } catch (err) {
    next(err);
  }
}

// CONTROLLER: EDIT PROFILE PAGE (edit-profile.ejs)

async function getEditProfile(req, res, next) {
  if (!req.user) {
    return res.redirect("/app/log-in"); // User not logged in
  }
  try {
     const user = await getUserProfileData(req.user.id);
     if (!user) {
      return res.status(404).render("error", {
        message: "User not found"
      });
    }
    //Format birthdate for input/display
    if (user.birthdate instanceof Date) {
      user.birthdate = user.birthdate.toISOString().split("T")[0];
    }
    res.render("edit-profile", {
      title: "Edit Profile",
      // user,
      usStates: usStates, // Pass the array to the EJS template   ????
      errors: [],
      formData: user,
    }); // Pass user to EJS view
  } catch (err) {
    next(err);
  }
}

async function postEditProfile(req, res, next) {

    if (!req.user) {
      return res.redirect("/app/log-in"); // User not logged in
    }

  const userId = req.user.id;

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

  try {

      const user = await getUserProfileData(userId);

      if (!user) return res.status(404).send("User not found");
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
        user,
        errors: formattedErrors,
        formData: req.body || {},
        usStates: usStates,
        csrfToken: req.csrfToken(), // Even though this is global for GET, putting this here explicitly to handle errors when validationCreateUser or validationEditUser catches an incorrect email, password, or confirm_password is used; without this here a 500 error pops off!
      });
    }

    // --- Sanitize fields ---
    const sanitize = (v) => (v === "" ? null : v);

    // If updateAdminEditedUser function tries to hash or validate an empty string, it may fail silently or throw, which could redirect to login depending on error handling.
    const passwordToUpdate = password ? password : null;

    // --- Update user in DB ---
    await updateUser(
      userId, // ID of the fullUser being edited
      sanitize(first_name),
      sanitize(last_name),
      sanitize(email),
      sanitize(birthdate),
      //   password, // hashed inside updateAdminEditedUser if provided
      passwordToUpdate,
      sanitize(phone),
      sanitize(street_address),
      sanitize(apt_unit),
      sanitize(city),
      sanitize(us_state),
      sanitize(zip_code),
    );

    res.redirect("/app/your-profile");
  } catch (err) {
    next(err);
  }
}

// CONTROLLER: CHANGE AVATAR MODAL (change-avatar.ejs)

async function postYourProfilePageAvatar(req, res, next) {
  const userId = req.user.id;

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
      userId,
      sanitize(avatar_type),
      sanitize(avatar_color_fg),
      sanitize(avatar_color_bg_top),
      sanitize(avatar_color_bg_bottom),
    );
  
    // Redirect after successful creation
    res.redirect("/app/your-profile");
  } catch (err) {
    next(err);
  }
}

module.exports = {
  // getfullUser,
  getModalDataToFrontend,
  // getUserDetails,
  getUserId,
  getYourProfilePage,
  deleteYourAccount,
  getEditProfile,
  postEditProfile,
  postYourProfilePageAvatar,
};
