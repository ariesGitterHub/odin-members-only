// const { v4: uuidv4 } = require('uuid'); // To generate a session token
const { validationResult } = require("express-validator");
const { usStates } = require("../utils/usStates");

const {
  getUserById,
  updateUser,
  updateUserAvatar,
  deleteUserById,
  // checkIfEmailExists,
} = require("../db/queries/userQueries");

const { calculateAge, formatShortDate } = require("../utils/calculateAge");

const {
  addBirthdateFields,
} = require("../utils/viewFormatters");


// CONTROLLER: GET CURRENT USER

// Frontend fetch - function to fetch current user data for modal

// async function getCurrentUser(req, res, next) {
//   try {
//     if (req.user) {
//       // Only send safe fields
//       const safeUser = {
//         id: req.user.id,
//         email: req.user.email,
//         first_name: req.user.first_name,
//         last_name: req.user.last_name,
//         birthdate: req.user.birthdate,
//         permission_status: req.user.permission_status,
//         verified_by_admin: req.user.verified_by_admin,
//         guest_upgrade_invite: req.user.guest_upgrade_invite,
//         invite_decision: req.user.invite_decision,
//         // avatarLetter: req.user.avatarLetter,
//         avatar_type: req.user.avatar_type,
//         avatar_color_fg: req.user.avatar_color_fg,
//         avatar_color_bg_top: req.user.avatar_color_bg_top,
//         avatar_color_bg_bottom: req.user.avatar_color_bg_bottom,
//         phone: req.user.phone,
//         street_address: req.user.street_address,
//         apt_unit: req.user.apt_unit,
//         city: req.user.city,
//         us_state: req.user.us_state,
//         zip_code: req.user.zip_code,
//       };

//       res.json(safeUser);
//     } else {
//       res.json(null); // or res.status(401).json({ user: null })
//     }
//   } catch (err) {
//     next(err);
//   }
// }

async function getCurrentUser(req, res, next) {
  try {
    if (req.currentUser) {
      // Only send safe fields
      const safeUser = {
        id: req.currentUser.id,
        email: req.currentUser.email,
        first_name: req.currentUser.first_name,
        last_name: req.currentUser.last_name,
        birthdate: req.currentUser.birthdate,
        permission_status: req.currentUser.permission_status,
        verified_by_admin: req.currentUser.verified_by_admin,
        guest_upgrade_invite: req.currentUser.guest_upgrade_invite,
        invite_decision: req.currentUser.invite_decision,
        // avatarLetter: req.currentUser.avatarLetter,
        avatar_type: req.currentUser.avatar_type,
        avatar_color_fg: req.currentUser.avatar_color_fg,
        avatar_color_bg_top: req.currentUser.avatar_color_bg_top,
        avatar_color_bg_bottom: req.currentUser.avatar_color_bg_bottom,
        phone: req.currentUser.phone,
        street_address: req.currentUser.street_address,
        apt_unit: req.currentUser.apt_unit,
        city: req.currentUser.city,
        us_state: req.currentUser.us_state,
        zip_code: req.currentUser.zip_code,
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

// Frontend fetch - function to fetch individual user data for modal
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
  // const currentUser = { ...req.user };
  const currentUser = req.currentUser;

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
      reopenModal: false,
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
    // const targetId = req.user.id;
    const currentUserId = req.currentUser.id;

    // Perform the deletion for the authenticated user (not a user provided in the body)
    await deleteUserById(currentUserId);

    res.redirect("/app");
  } catch (err) {
    next(err);
  }
}


// TODO - delete later!
// CONTROLLER: EDIT PROFILE MODAL (edit-profile.ejs)
// async function postYourProfilePageEdit(req, res, next) {
//   console.log("Controller hit!");

//   // const currentUser_id = req.user.id; // Always use logged-in user ID
//   const targetId = req.user.id;
//   const currentUser = await getUserById(targetId);
//   console.log("postYourProfilePageEdit", currentUser);
  

//   // Add computed fields: age, formattedBirthdate
//   const currentUserWithBirthdate = addBirthdateFields(
//     [currentUser], // pass as array to reuse your helper
//     calculateAge,
//     formatShortDate,
//   )[0]; // get first element

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

//   const errors = [];

//   // Simple validation checks
//   if (password && password !== confirm_password) {
//     errors.push("Passwords do not match.");
//     console.log(errors);
    
//   }

//   // const existingUser = await checkIfEmailExists(email, currentUser_id);
//   const existingUser = await checkIfEmailExists(email, targetId);

//   if (existingUser.length > 0) {
//     errors.push("Email is already taken.");
//        console.log(errors);
//     return res.render("your-profile", {
//       title: "Your Profile",
//       // user: req.user,
//       // currentUser,
//       user: currentUserWithBirthdate,
//       errors,
//       formData: req.body || {},
//     });
//   }

//   try {
//     const sanitize = (v) => (v === "" ? null : v); // Empty strings -> null

//     // --- Update the user ---
//     await updateUser(
//       // currentUser_id,
//       targetId,
//       sanitize(first_name),
//       sanitize(last_name),
//       sanitize(email),
//       sanitize(birthdate), // Keep as string 'yyyy-MM-dd' for <input type="date">
//       password, // hashed inside updateAdminEditedUser if provided
//       sanitize(phone),
//       sanitize(street_address),
//       sanitize(apt_unit),
//       sanitize(city),
//       sanitize(us_state),
//       sanitize(zip_code),
//     );
//     console.log("User inserted successfully");

//     // Redirect after successful creation
//     res.redirect("/app/your-profile");
//     console.log("Redirected to /app/your-profile");
//   } catch (err) {
//     next(err);
//   }
// }

// async function postYourProfilePageEdit(req, res, next) {
//   console.log("Controller hit!");

//   // const currentUser_id = req.user.id; // Always use logged-in user ID
//   const targetId = req.user.id;
//   const targetCurrentUser = await getUserById(targetId);
//   console.log("postYourProfilePageEdit", targetCurrentUser);

//     if (!targetCurrentUser) return res.status(404).send("User not found");

//   // Add computed fields: age, formattedBirthdate
//   const currentUserWithBirthdate = addBirthdateFields(
//     [targetCurrentUser], // pass as array to reuse your helper
//     calculateAge,
//     formatShortDate,
//   )[0]; // get first element

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

//   // const errors = [];

//   // // Simple validation checks
//   // if (password && password !== confirm_password) {
//   //   errors.push("Passwords do not match.");
//   //   console.log(errors);
//   // }

//   // // const existingUser = await checkIfEmailExists(email, currentUser_id);
//   // const existingUser = await checkIfEmailExists(email, targetId);

//   // if (existingUser.length > 0) {
//   //   errors.push("Email is already taken.");
//   //   console.log(errors);
//   //   return res.render("your-profile", {
//   //     title: "Your Profile",
//   //     // user: req.user,
//   //     // currentUser,
//   //     user: currentUserWithBirthdate,
//   //     errors,
//   //     formData: req.body || {},
//   //   });
//   // }

//   try {
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

//       return res.render("your-profile", {
//         title: "Your Profile",
//         // user: req.user,
//         // currentUser,
//         currentUser: currentUserWithBirthdate,
//         // errors,
//         errors: formattedErrors,
//         formData: req.body || {},
//         // reopenModal: "edit-profile",
//         reopenModal: true,
//       });
//     }

//     const sanitize = (v) => (v === "" ? null : v); // Empty strings -> null

//      const passwordToUpdate = password ? password : null;

//     // --- Update the user ---
//     await updateUser(
//       // currentUser_id,
//       targetId,
//       sanitize(first_name),
//       sanitize(last_name),
//       sanitize(email),
//       sanitize(birthdate), // Keep as string 'yyyy-MM-dd' for <input type="date">
//       // password, // hashed inside updateAdminEditedUser if provided
//       passwordToUpdate,
//       sanitize(phone),
//       sanitize(street_address),
//       sanitize(apt_unit),
//       sanitize(city),
//       sanitize(us_state),
//       sanitize(zip_code),
//     );
//     console.log("User inserted successfully");

//     // Redirect after successful creation
//     res.redirect("/app/your-profile");
//     console.log("Redirected to /app/your-profile");
//   } catch (err) {
//     next(err);
//   }
// }

// CONTROLLER: EDIT PROFILE PAGE (edit-profile.ejs)
async function getEditProfile(req, res, next) {
  try {
    // const targetId = req.user.id;
    // const currentUser = await getUserById(targetId);

    // const targetId = req.currentUser.id;
    const currentUser = req.currentUser;

    //Format birthdate for input/display
    if (currentUser.birthdate instanceof Date) {
      currentUser.birthdate = currentUser.birthdate.toISOString().split("T")[0];
    }
    if (!currentUser) return res.status(404).send("User not found");
    res.render("edit-profile", {
      title: "Edit Profile",
      currentUser,
      usStates: usStates, // Pass the array to the EJS template   ????
      errors: [],
      formData: currentUser,
    }); // Pass user to EJS view
  } catch (err) {
    next(err);
  }
}

async function postEditProfile(req, res, next) {
  console.log("Controller hit!");

  // const targetId = req.user.id;
  // const currentUser = await getUserById(targetId); // fetch target user

  const currentUserId = req.currentUser.id;
  const currentUser = req.currentUser;

  if (!currentUser) return res.status(404).send("User not found");

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
        currentUser,
        errors: formattedErrors,
        formData: req.body || {},
        usStates: usStates,
      });
    }

    // --- Sanitize fields ---
    const sanitize = (v) => (v === "" ? null : v);

    // If updateAdminEditedUser function tries to hash or validate an empty string, it may fail silently or throw, which could redirect to login depending on error handling.
    const passwordToUpdate = password ? password : null;

    // --- Update user in DB ---
    await updateUser(
      currentUserId, // ID of the currentUser being edited
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

    console.log("User updated successfully");

    res.redirect("/app/your-profile");
  } catch (err) {
    next(err);
  }
}


// CONTROLLER: CHANGE AVATAR MODAL (change-avatar.ejs)

async function postYourProfilePageAvatar(req, res, next) {
  console.log("Controller hit!");

  // const currentUser_id = req.user.id; // Always use logged-in user ID
  // const targetId = req.currentUser.id;
  const currentUserId = req.currentUser.id;

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
      // currentUser_id,
      currentUserId,
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
  // postYourProfilePageEdit,
  getEditProfile,
  postEditProfile,
  postYourProfilePageAvatar,
};
