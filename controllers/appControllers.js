const bcrypt = require("bcryptjs");
const passport = require("passport");
const { hasRole } = require("../utils/permissions");
const { buildThreadedMessages } = require("../utils/threadUtils");
const { usStates } = require("../utils/usStates");

const {
  getUsers,
  getUserById,
  getMessageById,
  getTopicById,

  checkIfEmailExists,
  insertNewUser,
  insertAdminCreatedUser,
  updateAdminEditedUser,
  // insertNewMessage,
  // insertReplyMessage,
  insertMessage,
  updateMessage,
  stickyMessageById,
  toggleLike,
  updateUser,
  updateUserAvatar,
  updateUserToMember,
  getTopicNames,
  // getTopicNamesForPermission,
  // getTopicName,
  getAllTopics,
  getTopicBySlug,
  getValidMessagesByTopic,
  deleteUserById,
  softDeleteMessageById,
  // becomeMemberById,
  incrementReplyCount,
} = require("../db/queries");

const { calculateAge, formatShortDate } = require("../utils/calculateAge");
// const { avatarTypeDefault } = require("../utils/avatarTypeDefault");
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
  // addAvatarFields,
} = require("../utils/viewFormatters");

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

// CONTROLLER: GET MESSAGES BY ID

// Function to fetch individual user data for modal
async function getMessageDetails(req, res, next) {
  const targetId = req.params.id;
  try {
    const message = await getMessageById(targetId);

    if (message) {
      res.json(message); // Send user data as JSON
    } else {
      res.status(404).send("Message not found");
    }
  } catch (err) {
    next(err);
  }
}


// CONTROLLER: INDEX (index.ejs)

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

// CONTROLLER: SIGN-UP (sign-up.ejs)

async function getSignUp(req, res, next) {
  try {
    res.render("sign-up", {
      title: "Sign Up",
      user: req.user,
      errors: [],
      formData: req.body || {},
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
      formData: req.body || {},
    });
  }

  try {
    // Below - no id needed at sign-up, only use id for edits/updates
    // const existingUser = await checkIfEmailExists(email, user_id);
    const existingUser = await checkIfEmailExists(email);

    if (existingUser.length > 0) {
      errors.push("Email is already taken.");
      return res.render("sign-up", {
        title: "Sign Up",
        user: req.user,
        errors,
      });
    }

    const password_hash = await bcrypt.hash(password, 12);

    await insertNewUser(first_name, last_name, email, birthdate, password_hash);

    res.redirect("/app/log-in");
  } catch (err) {
    next(err);
  }
}

// CONTROLLER: LOG-IN (log-in.ejs)

async function getLogIn(req, res, next) {
  try {
    res.render("log-in", {
      title: "Log In",
      user: req.user,
      errors: [],
      formData: req.body || {},
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
        formData: req.body || {},
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
      res.redirect("/app/message-boards");
    });
  })(req, res, next);
}

// CONTROLLER: LOG-OUT

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

// CONTROLLER: INFO (info.ejs)
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

// CONTROLLER: NEW MESSAGE (new-message.ejs)
// Use below to model postReplyMessage
async function postNewMessage(req, res, next) {
  const { topic_id, title, body } = req.body;

  // Assuming you're using session-based authentication
  const currentUser_id = req.user.id; // or whatever key stores user_id in the session

  if (!currentUser_id) {
    return res.status(401).send("User is not logged in.");
  }

  try {
    // Get topic info
   const topic = await getTopicById(topic_id);

    if (!topic) {
      return res.status(404).send("Topic not found.");
    }

    // await insertNewMessage(currentUser_id, topic_id, title, body); // Pass user_id from session
    // await insertMessage(currentUser_id, topic_id, title, body); // Pass user_id from session
    const newMessage = await insertMessage(currentUser_id, topic_id, title, body);
    res.redirect(`/app/message-boards/${topic.slug}`);
  } catch (err) {
    next(err);
  }
}

// CONTROLLER: STICKY MESSAGE TOGGLE 
async function postStickyMessageToggle(req, res, next) {
 
  try {
    const { message_id, slug } = req.body;
    //  console.log("sticky:", message_id, slug);
    await stickyMessageById(message_id);
    res.redirect(`/app/message-boards/${slug}`);
  } catch (err) {
    next(err);
  }
}

// async function postReplyMessage(req, res, next) {
//   // const { topicName, topicSlug, messageTitle, body } = req.body;
//   // targetId = messageId
//   const { targetId, messageTitle, topicSlug, topicName, body } =
//     req.body;

//   // TODO - Maybe do this for clarity
//   const messageId = targetId;

//   // Assuming you're using session-based authentication
//   const currentUser_id = req.user.id; // or whatever key stores user_id in the session

//   if (!currentUser_id) {
//     return res.status(401).send("User is not logged in.");
//   }

//   try {
//     // Get topic info
//     // const messages = await getValidMessagesByTopic(messageId); //needed???

//     if (!topic) {
//       return res.status(404).send("Topic not found.");
//     }

//     await insertReplyMessage(
//       currentUser_id,
//       messageId,
//       messageTitle,
//       topicSlug,
//       topicName,
//       body,
//     ); // Pass user_id from session
//     res.redirect(`/app/message-boards/${topic.slug}`);
//   } catch (err) {
//     next(err);
//   }
// }

// async function postEditMessage(req, res, next) {
//   try {
//     // Extract form data
//     const { targetId, body } = req.body;

//     // const prefixedTitle = `↪ ${messageTitle}`;

//     // console.log("Received messageTitle:", messageTitle);
//     // console.log("Received adjusted messageTitle:", prefixedTitle);

//     // Validate form data
//     if (!targetId || !body) {
//       return res.status(400).send("Missing required data.");
//     }

//     // Get the currently logged-in user ID
//     const currentUserId = req.user?.id;
//     if (!currentUserId) {
//       return res.status(401).send("User is not logged in.");
//     }

//     // Fetch the parent message from the database
//     const message = await getMessageById(targetId); // assume a DB query helper
//     if (!message) {
//       return res.status(404).send("Message not found.");
//     }

//     // Insert the new reply message
//     // const replyMessage = await insertMessage({
//     //   title: messageTitle,
//     //   body: body,
//     //   user_id: currentUserId,
//     //   parent_message_id: parentMessage.id,
//     //   topic_id: parentMessage.topic_id,
//     //   // created_at: new Date(),
//     // });

//     const editMessage = await updateMessage(
//       currentUserId, // user_id
//       message,
//       //parentMessage.topic_id, // topic_id
//       //messageTitle, // title
//       // prefixedTitle,
//       body, // body
//       // parentMessage.message_id,
//     );

//     // Increment the reply count on the parent message
//     // await incrementReplyCount(parentMessage.message_id);

//     // Redirect back to the topic page
//     res.redirect(`/app/message-boards/${message.topic_slug}`);
//   } catch (err) {
//     next(err);
//   }
// }

// async function postEditMessage(req, res, next) {
//   try {
//     // Extract form data
//     const { targetId, title, body } = req.body;

//     // Validate form data
//     if (!targetId || !body) {
//       return res.status(400).send("Missing required data.");
//     }

//     // Get the currently logged-in user ID
//     const currentUserId = req.user?.id;
//     if (!currentUserId) {
//       return res.status(401).send("User is not logged in.");
//     }

//     // Fetch the message from the database
//     const message = await getMessageById(targetId); // assume a DB query helper
//     if (!message) {
//       return res.status(404).send("Message not found.");
//     }

//     // Check if the logged-in user is the author of the message
//     if (message.user_id !== currentUserId) {
//       return res.status(403).send("You are not the author of this message.");
//     }

//     // Update the message in the database
//     const updatedMessage = await updateMessage(
//       targetId, // message_id
//       title, // title
//       body, // body
//     );

// console.log("Message object being passed to template:", message);

//     // Redirect to the topic page
//     res.redirect(`/app/message-boards/${message.topic_slug}`);
//   } catch (err) {
//     next(err);
//   }
// }

async function postEditMessage(req, res, next) {
  try {
    // Extract form data
    const { targetId, title, body } = req.body;

    // Validate form data
    if (!targetId || !body) {
      return res.status(400).send("Missing required data.");
    }

    // Get the currently logged-in user ID
    const currentUserId = req.user?.id;
    if (!currentUserId) {
      return res.status(401).send("User is not logged in.");
    }

    // Fetch the message from the database
    const message = await getMessageById(targetId); // assume a DB query helper
    if (!message) {
      return res.status(404).send("Message not found.");
    }
console.log("Updated message with is_edited1:", message.is_edited);
    // Check if the logged-in user is the author of the message
    if (message.user_id !== currentUserId) {
      return res.status(403).send("You are not the author of this message.");
    }

    // Update the message in the database
    const updatedMessage = await updateMessage(
      targetId, // message_id
      title, // title
      body, // body
    );

    // Log updated message data to ensure it's correctly updated
console.log("Updated message with is_edited2:", message.is_edited);

    // Pass the updated message with 'is_edited' to the template
    res.redirect(`/app/message-boards/${message.topic_slug}`);
  } catch (err) {
    next(err);
  }
}

async function postReplyMessage(req, res, next) {
  try {
    // Extract form data
    const { targetId, messageTitle, body } = req.body;

    const prefixedTitle = `↪ ${messageTitle}`; 

    // console.log("Received messageTitle:", messageTitle);
    console.log("Received adjusted messageTitle:", prefixedTitle);

    // Validate form data
    if (!targetId || !body) {
      return res.status(400).send("Missing required data.");
    }

    // Get the currently logged-in user ID
    const currentUserId = req.user?.id;
    if (!currentUserId) {
      return res.status(401).send("User is not logged in.");
    }

    // Fetch the parent message from the database
    const parentMessage = await getMessageById(targetId); // assume a DB query helper
    if (!parentMessage) {
      return res.status(404).send("Parent message not found.");
    }

    // Insert the new reply message
    // const replyMessage = await insertMessage({
    //   title: messageTitle,
    //   body: body,
    //   user_id: currentUserId,
    //   parent_message_id: parentMessage.id,
    //   topic_id: parentMessage.topic_id,
    //   // created_at: new Date(),
    // });

    const replyMessage = await insertMessage(
      currentUserId, // user_id
      parentMessage.topic_id, // topic_id
      // messageTitle, // title
      prefixedTitle,
      body, // body
      parentMessage.message_id, // parent_message_id
    );

    // Increment the reply count on the parent message
    await incrementReplyCount(parentMessage.message_id);

    // Redirect back to the topic page
    res.redirect(`/app/message-boards/${parentMessage.topic_slug}`);
  } catch (err) {
    next(err);
  }
}


// CONTROLLER: DELETE MESSAGE (message-boards/topic slug)

async function deleteUserMessage(req, res, next) {
  try {
    console.log("Delete user message body sanity:", req.body);
    // slug was undefined for use in redirect, I forgot to extract it from req.body!!!!
    const { targetId, topicSlug } = req.body;
    const rowsUpdated = await softDeleteMessageById(targetId);
    if (rowsUpdated === 0) return res.status(404).send("Message not found");
    // res.redirect("/app/message-boards");
    res.redirect(`/app/message-boards/${topicSlug}`);
  } catch (err) {
    next(err);
  }
}

async function postLikeMessageToggle(req, res, next) {
  const { message_id, slug } = req.body;
  const user_id = req.user.id; // <-- TODO - MORE OF THIS!
  try {
    await toggleLike(message_id, user_id);
    // console.log("User ID:", user_id); // Check the value
    // console.log("Message ID:", message_id); // Check the value

    res.redirect(`/app/message-boards/${slug}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error liking message");
  }
}

// async function deleteUserMessage(req, res, next) {
//   try {
//     const { targetId } = req.body;
//     await softDeleteMessageById(targetId);
//     res.redirect("/app/message-boards");
//   } catch (err) {
//     next(err);
//   }
// }


// CONTROLLER: YOUR PROFILE (your-profile.ejs)

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

// CONTROLLER: EDIT PROFILE (edit-profile.ejs)
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

// CONTROLLER: CHANGE AVATAR (change-avatar.ejs)

// async function getChangeAvatar(req, res, next) {
//   try {
//     res.render("change-avatar", {
//       title: "Change Avatar",
//       user: req.user,
//       errors: [],
//     });
//   } catch (err) {
//     next(err);
//   }
// }

async function postYourProfilePageAvatar(req, res, next) {
  console.log("Controller hit!");

  const currentUser_id = req.user.id; // Always use logged-in user ID

  const {
    avatar_type,
    avatar_color_fg,
    avatar_color_bg_top,
    avatar_color_bg_bottom
  } = req.body;

  try {
    const sanitize = (v) => (v === "" ? null : v); // Empty strings -> null

    // --- Update the user ---
    await updateUserAvatar(
      currentUser_id,
      sanitize(avatar_type),
      sanitize(avatar_color_fg),
      sanitize(avatar_color_bg_top),
      sanitize(avatar_color_bg_bottom)
    );
    console.log("User avatar changes inserted successfully");

    // Redirect after successful creation
    res.redirect("/app/your-profile");
    console.log("Redirected to /app/your-profile");
  } catch (err) {
    next(err);
  }
}

// async function getUpdateProfile(req, res, next) {
//   try {
//     res.render("update-profile", {
//       title: "Update Profile",
//       user: req.user,
//       errors: [],
//     });
//   } catch (err) {
//     next(err);
//   }
// }

async function getMessageBoards(req, res, next) {
  try {
    const currentUser = req.user || res.locals.currentUser || null;

    const topics = await getAllTopics();
    const visibleTopics = topics.filter((topic) =>
      hasRole(currentUser, topic.required_permission),
    );

    res.render("message-boards", {
      title: "Message Boards",
      topics: visibleTopics,
      errors: [],
    });
  } catch (err) {
    next(err);
  }
}

// getTopicNames

// const getTopicNamesForDropdown = async (req, res, next) => {
//   try {
//     const topics = await getTopicNames(); // returns [{id, name}, ...]
//     res.json(topics); // MUST be an array
//   } catch (err) {
//     next(err);
//   }
// };



const getTopicNamesForDropdown = async (req, res, next) => {
  try {
    const currentUser = req.user || res.locals.currentUser || null;
    const topics = await getTopicNames(); // returns [{id, name, required_permission}, ...]
    const visibleTopics = topics.filter((topic) =>
      hasRole(currentUser, topic.required_permission),
    );
    res.json(visibleTopics); // MUST be an array
  } catch (err) {
    next(err);
  }
};


// const getTopicNamesForDropdown = async (req, res, next) => {
//   try {
//     const currentUser = req.user || res.locals.currentUser || null;
//     const permission = currentUser?.permission_status || "guest";

//     const topics = await getTopicNamesForPermission(permission); // returns [{id, name, required_permission}, ...]

//     res.json(topics); // MUST be an array
//   } catch (err) {
//     next(err);
//   }
// };

// async function getTopicPage(req, res, next) {
//   try {
//     const { slug } = req.params;

//     // Get topic info
//     const topic = await getTopicBySlug(slug);

//     if (!topic) {
//       return res.status(404).render("404");
//     }

//     // Get messages for this topic
//     const messages = await getValidMessagesByTopic(topic.id);

//     const messagesWithAvatars = addAvatarFields(messages, avatarTypeDefault);

//     res.render("topic", {
//       title: topic.name,
//       topic,
//       // messages,
//       messages: messagesWithAvatars,
//       // avatarLetter,
//       errors: [],
//     });
//   } catch (err) {
//     next(err);
//   }
// }

// -- Log-out

// async function requireTopicPermission(req, res, next) {
//   const { slug } = req.params;

//   const topic = await getTopicBySlug(slug);
//   if (!topic) return res.status(404).render("404");

//   const user = req.user || res.locals.currentUser || null;

//   if (!hasRole(user, topic.required_permission)) {
//     const err = new Error("Forbidden");
//     err.status = 403;
//     return next(err);
//   }

//   req.topic = topic;
//   next();
// }



async function getTopicPage(req, res, next) {
  try {
    const { slug } = req.params;

    // Get topic info
    const topic = await getTopicBySlug(slug);

    if (!topic) {
      return res.status(404).render("404");
    }

    // Ensure currentUser is defined (guests may be undefined)
    const currentUser = req.user || res.locals.currentUser || null;

    // Authorization check based on DB permission
    if (!hasRole(currentUser, topic.required_permission)) {
      const err = new Error("Forbidden: insufficient permission status.");
      err.status = 403;
      return next(err);
    }

    // Get messages for this topic
    const messages = await getValidMessagesByTopic(topic.id, 50);

    // const messageLikes = makeAnotherConrtoller()

    // const messagesWithAvatars = addAvatarFields(messages, avatarTypeDefault);

    res.render("topic", {
      title: topic.name,
      topic,
      // messages: messagesWithAvatars,
      messages,
      currentUser,
      errors: [],
    });
  } catch (err) {
    console.error("Error in getTopicPage:", err);
    next(err); // properly forward the error
  }
}

// async function getTopicPage(req, res) {
//   const topic = req.topic;

//   const messages = await getValidMessagesByTopic(topic.id);

//   res.render("topic", {
//     title: topic.name,
//     topic,
//     messages,
//   });
// }


async function getMemberDirectory(req, res, next) {
  try {
    const users = await getUsers();

    // const usersWithAvatars = addAvatarFields(users, avatarTypeDefault);

    res.render("member-directory", {
      title: "Member Directory",
      // users: usersWithAvatars,
      users,
      errors: [],
    });
  } catch (err) {
    next(err);
  }
}


async function getMemberInvite(req, res, next) {
  try {
    const currentUserId = req.user.id
    const user = await getUserById(currentUserId);

    // const usersWithAvatars = addAvatarFields(users, avatarTypeDefault);

    res.render("member-invite", {
      title: "Member Invite",
      // users: usersWithAvatars,
      // user,
      // formData: user,
      // errors: [],
      user: req.user,
      // errors,
      usStates: usStates, // Pass the array to the EJS template
      formData: req.body || {},
    });
  } catch (err) {
    next(err);
  }
}

 async function postMemberInviteAccepted(req, res, next) {

  console.log("Controller hit!");

  const currentUser_id = req.user.id; // Always use logged-in user ID

  const {
    permission_status,
    invite_decision,
    phone,
    street_address,
    apt_unit,
    city,
    us_state,
    zip_code,
  } = req.body;

  const errors = [];

  const validStatuses = ["guest", "member", "admin"];
  if (!validStatuses.includes(permission_status)) {
    errors.push("Invalid permission status.");
  }

  if (errors.length > 0) {
    return res.render("member-invite", {
      title: "Member Invite",
      user: req.user,
      errors,
      formData: req.body || {},
    });
  }

  try {
    const sanitize = (v) => (v === "" ? null : v); // Empty strings -> null

    // --- Update the user ---
    await updateUserToMember(
      currentUser_id,
      sanitize(permission_status),
      sanitize(invite_decision),
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


  // postMemberInviteDeclined,
//  async function postMemberInviteDeclined(req, res, next) {
//    console.log("Controller hit!");

//    const currentUser_id = req.user.id; // Always use logged-in user ID

//    const {
//      invite_decision,
//    } = req.body;

//    const errors = [];

//    if (errors.length > 0) {
//      return res.render("member-invite", {
//        title: "Member Invite",
//        user: req.user,
//        errors,
//        formData: req.body || {},
//      });
//    }

//    try {
//      const sanitize = (v) => (v === "" ? null : v); // Empty strings -> null

//      // --- Update the user ---
//      await updateUserToMember(currentUser_id, sanitize(invite_decision));
//      console.log("User inserted successfully");

//      // Redirect after successful creation
//      res.redirect("/app/your-profile");
//      console.log("Redirected to /app/your-profile");
//    } catch (err) {
//      next(err);
//    }
//  }

async function postMemberInviteDeclined(req, res, next) {
  console.log("Controller hit!");

  const currentUser_id = req.user.id; // Always use logged-in user ID

  const {
    invite_decision, // "declined"
  } = req.body;

  const errors = [];

  if (errors.length > 0) {
    return res.render("member-invite", {
      title: "Member Invite",
      user: req.user,
      errors,
      formData: req.body || {},
    });
  }

  try {
    const sanitize = (v) => (v === "" ? null : v); // Empty strings -> null

    // --- Update the user ---
    // Call the updated version of the function for only the fields you need to update.
    await updateUserToMember(
      currentUser_id, // User ID
      null, // No change to permission_status
      sanitize(invite_decision), // "declined"
      null, // No change to phone
      null, // No change to street_address
      null, // No change to apt_unit
      null, // No change to city
      null, // No change to us_state
      null, // No change to zip_code
    );
    console.log("User updated successfully");

    // Redirect after successful creation
    res.redirect("/app/your-profile");
    console.log("Redirected to /app/your-profile");
  } catch (err) {
    next(err);
  }
}

// CONTROLLER: ADMIN PAGE (admin.ejs) 
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
      // usersWithDates,
      // usersWithAvatars,
      errors: [],
    });
  } catch (err) {
    next(err);
  }
}

// CONTROLLER: ADMIN CREATE PAGE (admin-create.ejs)
function getAdminCreatePage(req, res, next) {
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
    notes
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
    return res.render("admin-create", {
      title: "Admin Create",
      user: req.user,
      errors,
      formData: req.body || {},
    });
  }

  try {
    // Below - no id needed at sign-up, only use id for edits/updates
    // const existingUser = await checkIfEmailExists(email, user_id);
    const existingUser = await checkIfEmailExists(email);

    if (existingUser.length > 0) {
      errors.push("Email is already taken.");
      return res.render("admin-create", {
        title: "Admin Create",
        user: req.user,
        errors,
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

    const permission_status = req.body.permission_status || "guest";

    // Insert the new admin-created user (avatar_type generated inside the function)
    await insertAdminCreatedUser(
      first_name,
      last_name,
      email,
      birthdate,
      password_hash,
      permission_status,
      notes
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
      errors: [],
      usStates: usStates, // Pass the array to the EJS template
      formData: user,
    }); // Pass user to EJS view
  } catch (err) {
    next(err);
  }
}

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
      notes
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
        sanitize(notes)
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

// async function deleteYourAccount(req, res, next) {
//   // TODO - should I use req.user here or targetId???????????

//   try {
//     const { targetId } = req.body;
//     await deleteUserById(targetId);
//     res.redirect("/app");
//   } catch (err) {
//     next(err);
//   }
// }

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

// CONTROLLER: BECOME A MEMBER (your-profile.ejs and become-member.ejs)
async function postBecomeMember(req, res, next) {
  try {
    const { targetId } = req.body;
    await becomeMemberById(targetId);
    res.redirect("/app/your-profile");
  } catch (err) {
    next(err);
  }
}

const getMessagesForTopic = async (req, res) => {
  const messages = await getValidMessagesByTopic(
    req.params.topicId,
    req.user.id,
  );
  const threaded = buildThreadedMessages(messages);
  res.json(threaded);
};

module.exports = {
  getMessagesForTopic,

  // Basic fetch
  getCurrentUser,
  getUserDetails,
  getMessageDetails,

  // No permission status needed
  getHome,
  getSignUp,
  postSignUp,
  getLogIn,
  postLogIn,

  // Admin permission status
  getAdminPage,
  getAdminCreatePage,
  postAdminCreatePage,
  deleteUserAccount,
  getAdminEditPage,
  postAdminEditPage,

  // Any user status
  getInfo,

  postNewMessage,
  getTopicNamesForDropdown,

  getMessageBoards,
  getTopicPage,

  postStickyMessageToggle,
  postEditMessage,
  postReplyMessage,
  deleteUserMessage,
  postLikeMessageToggle,

  getYourProfilePage,
  deleteYourAccount,
  postYourProfilePageEdit,
  postYourProfilePageAvatar,
  getMemberDirectory, // Member status or higher
  getMemberInvite,
  postMemberInviteAccepted,
  postMemberInviteDeclined,
  postLogOut,

  //   getCurrentUser,
  //   getUserDetails,
  //   getMessageDetails,
  // postStickyMessageToggle,
  // postLikeMessageToggle,
  //   getHome,
  //   getSignUp,
  //   postSignUp,
  //   getLogIn,
  //   postLogIn,
  //   postLogOut,
  //   getYourProfilePage,
  //   postYourProfilePageEdit,
  //   postYourProfilePageAvatar,
  //   getMemberDirectory,
  //   // getUpdateProfile,
  //   // getChangeAvatar,
  //   getInfo,
  //   postNewMessage,
  //   getMessageBoards,
  //   getTopicNamesForDropdown,
  //   // requireTopicPermission,
  //   getTopicPage,
  //   getAdminPage,
  //   getAdminCreatePage,
  //   postAdminCreatePage,
  //   getAdminEditPage,
  //   postAdminEditPage,

  //   deleteUserAccount,
  //   deleteYourAccount,
  //   deleteUserMessage,

  //   // postBecomeMember,
};
