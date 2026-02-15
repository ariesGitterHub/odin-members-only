const {
  getUsers,
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
  try {
    res.render("your-profile", {
      title: "Your Profile",
      user: req.user,
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
    const messagesWithAvatars = messages.map((message) => ({
      ...message,
      avatarLetter: avatarTypeDefault(
        message.avatar_type,
        message.permission_status,
        message.first_name,
      ),
    }));

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



async function getBecomeMember(req, res, next) {
  try {
    res.render("become-member", {
      title: "Become Member",
      user: req.user,
      errors: [],
    });
  } catch (err) {
    next(err);
  }
}

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

    const usersWithDates = users.map((user) => ({
      ...user,
      age: calculateAge(user.birthdate),
      formattedBirthdate: formatShortDate(user.birthdate),
    }));

    res.render("admin", {
      title: "Admin",
      users: usersWithDates,
      errors: [],
    });
  } catch (err) {
    next(err);
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
  getBecomeMember,
  getAdmin,
  postLogOut,
};
