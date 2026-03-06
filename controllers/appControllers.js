const bcrypt = require("bcryptjs");
// const pool = require("../db/pool"); // PostgreSQL pool
// const { hasRole, requireRole } = require("../utils/permissions.js");
const passport = require("passport");

const {
  getUsers,
  getUserById,
  checkIfEmailExists,
  insertNewUser,
  getTopicNames,
  getAllTopics,
  getTopicBySlug,
  getValidMessagesByTopic,

} = require("../db/queries");

const { calculateAge, formatShortDate } = require("../utils/calculateAge");
const { avatarTypeDefault } = require("../utils/avatarTypeDefault");
const {
  getZodiacSign,
  getRealZodiacSign,
  getChineseZodiacFull,
} = require("../utils/zodiacSigns");
const {
  addBirthdateFields,
  addSessionCreateDateFields,
  addSessionUpdateDateFields,
  addZodiacSigns,
  addRealZodiacSigns,
  addChineseZodiacSigns,
  addAvatarFields,
} = require("../utils/viewFormatters");

async function getCurrentUser(req, res, next) {
  try {
    if (req.user) {
      // Only send safe fields
      const safeUser = {
        id: req.user.id,
        first_name: req.user.first_name,
        last_name: req.user.last_name,
        email: req.user.email,
        permission_status: req.user.permission_status,
        avatarLetter: req.user.avatarLetter,
        avatar_type: req.user.avatar_type,
        avatar_color_fg: req.user.avatar_color_fg,
        avatar_color_bg_top: req.user.avatar_color_bg_top,
        avatar_color_bg_bottom: req.user.avatar_color_bg_bottom,
      };

      res.json(safeUser);
    } else {
      res.json(null); // or res.status(401).json({ user: null })
    }
  } catch (err) {
    next(err);
  }
}

// Index (Home)

async function getHome(req, res, next) {
  try {
    res.render("index", {
      title: "Home",
      user: req.user,
      errors: [],
    });
  } catch (err) {
    next(err);
  }
}

// Sign-Up

async function getSignUp(req, res, next) {
  try {
    res.render("sign-up", {
      title: "Sign Up",
      user: req.user,
      errors: [],
    });
  } catch (err) {
    next(err);
  }
}

async function postSignUp(req, res, next) {
  const {
    first_name,
    last_name,
    email,
    birthdate,
    password,
    confirm_password,
  } = req.body;
  const errors = [];

  // Simple validation checks
  if (
    !first_name ||
    !last_name ||
    !email ||
    !birthdate ||
    !password ||
    !confirm_password
  ) {
    errors.push("All fields are required.");
  }

  if (password !== confirm_password) {
    errors.push("Passwords do not match.");
  }

  if (errors.length > 0) {
    return res.render("sign-up", {
      title: "Sign Up",
      user: req.user,
      errors,
    });
  }

  try {
    // Use the query function from queries.js to check if email exists
    const existingUser = await checkIfEmailExists(email);

    if (existingUser.length > 0) {
      errors.push("Email is already taken.");
      return res.render("sign-up", {
        title: "Sign Up",
        user: req.user,
        errors,
      });
    }

    // Hash the password before saving it to the database
    const password_hash = await bcrypt.hash(password, 12);

    // Use the query function from queries.js to insert the new user
    await insertNewUser(first_name, last_name, email, birthdate, password_hash);

    // Redirect to the login page after successful sign-up
    res.redirect("/app/log-in");
  } catch (err) {
    next(err);
  }
}

// Log-In

async function getLogIn(req, res, next) {
  try {
    res.render("log-in", {
      title: "Log In",
      user: req.user,
      errors: [],
    });
  } catch (err) {
    next(err);
  }
}

async function postLogIn(req, res, next) {
  console.log("Form data:", req.body); // Log the request body to see the submitted data
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      console.error("Error during authentication:", err);
      return next(err); // handle unexpected error
    }

    if (!user) {
      console.log(
        "Authentication failed:",
        info.message || "Invalid email or password",
      );
      return res.render("log-in", {
        title: "Log In",
        errors: [info.message || "Invalid email or password"],
      });
    }

    console.log("User authenticated:", user);

    // Log the user in
    req.login(user, (err) => {
      if (err) {
        console.error("Error during login:", err);

        return next(err); // handle login error
      }

      console.log("Login successful! Redirecting to message boards...");
      // Redirect to homepage (or the intended route after successful login)
      res.redirect("/app/message-boards");
    });
  })(req, res, next);
}

// Log out the user
async function postLogOut(req, res, next) {
  try {
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      res.redirect("/app/log-in"); // Redirect to login page after logout
    });
  } catch (err) {
    next(err);
  }
}

async function getYourProfile(req, res, next) {
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
  const currentUserWithAvatar = addAvatarFields(
    [currentUserWithBirthdate],
    avatarTypeDefault,
  )[0];

  try {
    res.render("your-profile", {
      title: "Your Profile",
      currentUser: currentUserWithAvatar, // send single processed user
      errors: [],
    });
  } catch (err) {
    next(err);
  }
}

async function getUpdateProfile(req, res, next) {
  try {
    res.render("update-profile", {
      title: "Update Profile",
      user: req.user,
      errors: [],
    });
  } catch (err) {
    next(err);
  }
}

async function getChangeAvatar(req, res, next) {
  try {
    res.render("change-avatar", {
      title: "Change Avatar",
      user: req.user,
      errors: [],
    });
  } catch (err) {
    next(err);
  }
}

async function getInfo(req, res, next) {
  try {
    res.render("info", {
      title: "Site Information",
      user: req.user,
      errors: [],
    });
  } catch (err) {
    next(err);
  }
}

async function getMessageBoards(req, res, next) {
  try {
    const topics = await getAllTopics();

    res.render("message-boards", {
      title: "Message Boards",
      topics,
      errors: [],
    });
  } catch (err) {
    next(err);
  }
}

// getTopicNames

const getTopicNamesForDropdown = async (req, res, next) => {
  try {
    const topics = await getTopicNames(); // returns [{id, name}, ...]
    res.json(topics); // MUST be an array
  } catch (err) {
    next(err);
  }
}

async function getTopicPage(req, res, next) {
  try {
    const { slug } = req.params;

    // Get topic info
    const topic = await getTopicBySlug(slug);

    if (!topic) {
      return res.status(404).render("404");
    }

    // Get messages for this topic
    const messages = await getValidMessagesByTopic(topic.id);

    const messagesWithAvatars = addAvatarFields(messages, avatarTypeDefault);

    res.render("topic", {
      title: topic.name,
      topic,
      // messages,
      messages: messagesWithAvatars,
      // avatarLetter,
      errors: [],
    });
  } catch (err) {
    next(err);
  }
}

// -- Log-out

// REMINDER - Don't use async or try/catch — below is the correct pattern.

async function getMemberDirectory(req, res, next) {
  try {
    const users = await getUsers();

    const usersWithAvatars = addAvatarFields(
      users,
      avatarTypeDefault,
    );

    res.render("member-directory", {
      title: "Admin",
      users: usersWithAvatars,
      errors: [],
    });
  } catch (err) {
    next(err);
  }
}

async function getAdminPage(req, res, next) {
  try {
    const users = await getUsers();

    // const usersWithDates = users.map((user) => ({
    //   ...user,
    //   age: calculateAge(user.birthdate),
    //   formattedBirthdate: formatShortDate(user.birthdate),
    // }));

    // const usersWithAvatars = users.map((user) => ({
    //   ...user,
    //   avatarLetter: avatarTypeDefault(
    //     user.avatar_type,
    //     user.permission_status,
    //     user.first_name,
    //   ),
    // }));

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
    const usersWithZodiacSigns = addZodiacSigns(
      usersWithUpdateDates,
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
    const usersWithAvatars = addAvatarFields(
      usersWithChineseZodiacSigns,
      avatarTypeDefault,
    );

    res.render("admin", {
      title: "Admin",
      // users: usersWithDates,
      // "!!!-HERE-!!!" (see comments above in this controller)
      users: usersWithAvatars,
      // usersWithDates,
      // usersWithAvatars,
      errors: [],
    });
  } catch (err) {
    next(err);
  }
}

async function getAdminEditPage(req, res, next) {
  try {
    const userId = req.params.id;
    const user = await getUserById(userId);
    if (!user) return res.status(404).send("User not found");
    res.render("admin-edit", {
      title: "Admin Edit",
      user,
      errors: [],
    }); // Pass user to EJS view
  } catch (err) {
    next(err);
  }
}

function getAdminCreatePage(req, res, next) {
  try {
    res.render("admin-create", {
      title: "Admin Create",
      errors: [],
    }); // Just render an empty form
  } catch (err) {
    next(err);
  }
}

// Function to fetch individual user data for modal
async function getUserDetails(req, res, next) {
  const userId = req.params.id; // Get user ID from URL parameter
  try {
    const user = await getUserById(userId); // Replace with your actual query
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

module.exports = {
  getCurrentUser,
  getHome,
  getSignUp,
  postSignUp,
  getLogIn,
  postLogIn,
  postLogOut,
  getYourProfile,
  getMemberDirectory,
  getUpdateProfile,
  getChangeAvatar,
  getInfo,
  getMessageBoards,
  getTopicNamesForDropdown,
  getTopicPage,
  getAdminPage,
  getAdminEditPage,
  getAdminCreatePage,
  getUserDetails,
};
