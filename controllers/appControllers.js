const {
  getUsers,
  getUserById,
  // getTopics,
  getAllTopics,
  getTopicBySlug,
  getMessagesByTopicId,
  getValidMessagesByTopic,
  getMessagesByUser,
  getMessagesByTopic,
  softDeleteExpiredMessages,
  hardDeleteMessages,
  cleanupMessages,
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
  // addDateFields,
  addSessionCreateDateFields,
  addSessionUpdateDateFields,
  addZodiacSigns,
  addRealZodiacSigns,
  addChineseZodiacSigns,
  addAvatarFields,
} = require("../utils/viewFormatters");

const { hasRole, isExactRole } = require("../utils/permissions.js");

const emojiData = require("../data/NotoEmoji.json");

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

async function getYourProfile(req, res, next) {
  const users = await getUsers();

  users.forEach((user) => {
    if (user.birthdate instanceof Date) {
      user.birthdate = user.birthdate.toISOString().split("T")[0];
    }
  });


  const usersWithBirthDates = addBirthdateFields(users, calculateAge, formatShortDate);
  const usersWithAvatars = addAvatarFields(usersWithBirthDates, avatarTypeDefault);



  try {
    res.render("your-profile", {
      title: "Your Profile",
      users: usersWithAvatars,
      errors: [],
    });
  } catch (err) {
    next(err);
  }
}

async function getMemberDirectory(req, res, next) {
  try {
    res.render("member-directory", {
      title: "Member Directory",
      user: req.user,
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

    // Check avatar, if none select, gets a letter
    // const avatarLetter = avatarTypeDefault(
    //   messages.avatar_type,
    //   messages.permission_status,
    //   messages.first_name,
    // );

    // const avatarLetter = messages.map((message) => {
    //   avatarTypeDefault(
    //   message.avatar_type,
    //   message.permission_status,
    //   message.first_name,
    // )});

    // Attach avatarLetter to each message - TODO - I need to remember below!
    // const messagesWithAvatars = messages.map((message) => ({
    //   ...message,
    //   avatarLetter: avatarTypeDefault(
    //     message.avatar_type,
    //     message.permission_status,
    //     message.first_name,
    //   ),
    // }));

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

// async function getTopicBySlug(req, res, next) {
//   try {
//     const { slug } = req.params;

//     const topic = await getTopicBySlug(slug);

//     if (!topic) {
//       return res.status(404).render("404");
//     }

//     const messages = await getValidMessagesByTopic(topic.id);

//     res.render("topic", {
//       title: topic.name,
//       topic,
//       messages,
//       errors: [],
//     });
//   } catch (err) {
//     next(err);
//   }
// }

// async function getBecomeMember(req, res, next) {
//   try {
//     res.render("become-member", {
//       title: "Become Member",
//       user: req.user,
//       errors: [],
//     });
//   } catch (err) {
//     next(err);
//   }
// }

// async function getAdmin(req, res, next) {
//   const users = await getUsers();
//   const age = calculateAge(users.birthdate);
//   const formattedBirthdate = formatShortDate(users.birthdate);

//   try {
//     res.render("admin", {
//       title: "Admin",
//       users,
//       age,
//       formattedBirthdate,
//       errors: [],
//     });
//   } catch (err) {
//     next(err);
//   }
// }

// -- Log-out
// REMINDER - Don't use async or try/catch — below is the correct pattern.

async function getAdmin(req, res, next) {
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

    const usersWithBirthdates = addBirthdateFields(users, calculateAge, formatShortDate);
    const usersWithCreationDates = addSessionCreateDateFields(usersWithBirthdates, formatShortDate);
    const usersWithUpdateDates = addSessionUpdateDateFields(usersWithCreationDates, formatShortDate);
    const usersWithZodiacSigns = addZodiacSigns(usersWithUpdateDates, getZodiacSign);
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
      emojiData,
      // usersWithDates,
      // usersWithAvatars,
      errors: [],
    });
  } catch (err) {
    next(err);
  }
}

// Function to fetch individual user data for modal
// async function getUserDetails(req, res, next) {
//   const userId = req.params.id;  // Get user ID from URL parameter
//   try {
//     const user = await getUserById(userId);
//     if (user) {
//       res.json(user);  // Send user data as JSON
//     } else {
//       res.status(404).send('User not found');
//     }
//   } catch (err) {
//     next(err);
//   }
// }

// Function to fetch individual user data for modal
// Function to fetch individual user data for modal
async function getUserDetails(req, res, next) {
  const userId = req.params.id;  // Get user ID from URL parameter
  try {
    const user = await getUserById(userId);  // Replace with your actual query
    if (user.birthdate instanceof Date) {
      user.birthdate = user.birthdate.toISOString().split("T")[0];
    }

    if (user) {
      res.json(user);  // Send user data as JSON
    } else {
      res.status(404).send('User not found');
    }
  } catch (err) {
    next(err);  // Pass error to the error handling middleware
  }
}



function postLogOut(req, res, next) {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/app");
  });
}

module.exports = {
  getHome,
  getSignUp,
  getLogIn,
  getYourProfile,
  getMemberDirectory,
  getUpdateProfile,
  getChangeAvatar,
  getInfo,
  getMessageBoards,
  // getMessageBoardBySlug,
  getTopicPage,
  // getBecomeMember,
  getAdmin,
  getUserDetails,
  postLogOut,
};
