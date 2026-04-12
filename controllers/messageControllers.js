const { hasRole } = require("../utils/permissions");
const { buildThreadedMessages } = require("../utils/threadUtils");

const { getAllSiteControls } = require("../db/queries/appConfigQueries");

const {
  getMessageById,
  getTopicById,
  getTopicNames,
  insertMessage,
  getAllTopics,
  getTopicBySlug,
  getValidMessagesByTopic,
  updateMessage,
  stickyMessageById,
  softDeleteMessageById,
  incrementReplyCount,
  toggleLike,
} = require("../db/queries/messageQueries");

// CONTROLLER: GET MESSAGE BOARD PAGE

async function getMessageBoards(req, res, next) {
  try {
    const user = req.user;

    const topics = await getAllTopics();

    const visibleTopics = topics.filter((topic) =>
      hasRole(user, topic.required_permission),
    );

    // res.render("message-boards", {
    return res.render("message-boards", {
      title: "Message Boards",
      topics: visibleTopics,
      errors: [],
    });
  } catch (err) {
    next(err);
  }
}

// CONTROLLER: GET MESSAGE BOARD TOPIC PAGE

async function getTopicPage(req, res, next) {
  try {
    const { slug } = req.params;

    const siteSettings = await getAllSiteControls();

    // Get topic info
    const topic = await getTopicBySlug(slug);

    if (!topic) {
      return res.status(404).render("404");
    }

    // Ensure user is defined (guests may be undefined)
    const user = req.user;

    // Authorization check based on DB permission
    if (!hasRole(user, topic.required_permission)) {
      const err = new Error("Forbidden: insufficient permission status.");
      err.status = 403;
      return next(err);
    }

    // Get messages for this topic
    const messages = await getValidMessagesByTopic(topic.id, 50);

    const messagesWithExpiry = messages.map((message) => {
      const createdAt = new Date(message.created_at);

      const softExpiry = new Date(
        createdAt.getTime() +
          siteSettings.message_soft_delete_days * 24 * 60 * 60 * 1000,
      );

      return {
        ...message,
        soft_expiry: softExpiry,
      };
    });

    // res.render("topic", {
    return res.render("topic", {
      title: topic.name,
      config: siteSettings,
      topic,
      messages: messagesWithExpiry,
      user,
      errors: [],
    });
  } catch (err) {
    console.error("Error in getTopicPage:", err);
    next(err); // properly forward the error
  }
}

// // CONTROLLER: MESSAGE DETAILS

// async function getMessageDetails(req, res, next) {
//   const targetId = req.params.id;
//   try {
//     const message = await getMessageById(targetId);

//     if (message) {
//       res.json(message); // Send user data as JSON
//     } else {
//       res.status(404).send("Message not found");
//     }
//   } catch (err) {
//     next(err);
//   }
// }

async function getMessageDetails(req, res, next) {
  try {
    const message = await getMessageById(req.params.id);

    if (!message) {
      return res.status(404).send("Message not found");
    }

    return res.json(message);
  } catch (err) {
    next(err);
  }
}

// CONTROLLER: GET MAX CHARS FOR USE IN FRONTEND FILE miscFunctions.js VIA FETCH IN dataFetchers.js

// async function getMaxMessageChars(req, res, next) {
//   try {
//     const config = await getAllSiteControls();

//     if (config && typeof config.max_message_chars !== "undefined") {
//       res.json({ maxChars: config.max_message_chars });
//     } else {
//       res.status(404).send("Maximum message characters not found");
//     }
//   } catch (err) {
//     next(err);
//   }
// }

async function getMaxMessageChars(req, res, next) {
  try {
    const config = await getAllSiteControls();

    if (!config?.max_message_chars) {
      return res.status(404).send("Maximum message characters not found");
    }

    return res.json({ maxChars: config.max_message_chars });
  } catch (err) {
    next(err);
  }
}

// CONTROLLER: NEW MESSAGE (new-message.ejs)

// Use below to model postReplyMessage
async function postNewMessage(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).send("User is not logged in");
    }
  const userId = req.user.id;
  const { topic_id, title, body } = req.body;

  // Assuming you're using session-based authentication
  

  // if (!userId) {
  //   return res.status(401).send("User is not logged in.");
  // }

  // try {
    // Get topic info
    const topic = await getTopicById(topic_id);

    if (!topic) {
      return res.status(404).send("Topic not found.");
    }

    const newMessage = await insertMessage(
      userId,
      topic_id,
      title,
      body,
    );
    // res.redirect(`/app/message-boards/${topic.slug}`);
    return res.redirect(`/app/message-boards/${topic.slug}`);
  } catch (err) {
    next(err);
  }
}

// CONTROLLER: STICKY MESSAGE TOGGLE (message-boards/topic slug)

async function postStickyMessageToggle(req, res, next) {
  try {
    const { message_id, slug } = req.body;
    await stickyMessageById(message_id);
    // res.redirect(`/app/message-boards/${slug}`);
    return res.redirect(`/app/message-boards/${slug}`);
  } catch (err) {
    next(err);
  }
}

// CONTROLLER: POST EDITED MESSAGE (edit-message.ejs)

async function postEditMessage(req, res, next) {
  try {

    if (!req.user) {
      return res.status(401).send("User not logged in");
    }
    // Extract form data
    const { targetId, title, body } = req.body;

    // Validate form data
    if (!targetId || !body) {
      return res.status(400).send("Missing required data.");
    }

    // Get the currently logged-in user ID
    // const userId = req.user.id;
    // if (!userId) {
    //   return res.status(401).send("User is not logged in.");
    // }

    // Fetch the message from the database
    const message = await getMessageById(targetId); // assume a DB query helper
    if (!message) {
      return res.status(404).send("Message not found.");
    }

    // Check if the logged-in user is the author of the message
    // if (message.user_id !== userId) {
    if (message.user_id !== req.user.id) {
      return res.status(403).send("You are not the author of this message.");
    }

    // Update the message in the database
    const updatedMessage = await updateMessage(
      targetId, // message_id
      title,
      body,
    );

    // Pass the updated message with 'is_edited' to the template
    // res.redirect(`/app/message-boards/${message.topic_slug}`);
    return res.redirect(`/app/message-boards/${message.topic_slug}`);
  } catch (err) {
    next(err);
  }
}

// CONTROLLER: POST REPLY MESSAGE (reply-message.ejs)

async function postReplyMessage(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).send("User not logged in");
    }

    // Extract form data
    const { targetId, messageTitle, body } = req.body;

    // const prefixedTitle = `↪ ${messageTitle}`;

    // Validate form data
    if (!targetId || !body) {
      return res.status(400).send("Missing required data.");
    }

    // Get the currently logged-in user ID
    const userId = req.user.id;
    if (!userId) {
      return res.status(401).send("User is not logged in.");
    }

    // Fetch the parent message from the database
    const parentMessage = await getMessageById(targetId); // assume a DB query helper

    if (!parentMessage) {
      return res.status(404).send("Parent message not found.");
    }

     const prefixedTitle = `↪ ${messageTitle}`;

    // Insert the new reply message

    const replyMessage = await insertMessage(
      userId,
      parentMessage.topic_id,
      prefixedTitle,
      body,
      parentMessage.message_id, // parent_message_id
    );

    // Increment the reply count on the parent message
    await incrementReplyCount(parentMessage.message_id);

    // Redirect back to the topic page
    // res.redirect(`/app/message-boards/${parentMessage.topic_slug}`);
    return res.redirect(`/app/message-boards/${parentMessage.topic_slug}`);
  } catch (err) {
    next(err);
  }
}

// CONTROLLER: DELETE MESSAGE

async function deleteUserMessage(req, res, next) {
  try {
    const { targetId, topicSlug } = req.body;

    const rowsUpdated = await softDeleteMessageById(targetId);
    
    // if (rowsUpdated === 0) return res.status(404).send("Message not found");

    if (!rowsUpdated) {
      return res.status(404).send("Message not found");
    }
    // res.redirect(`/app/message-boards/${topicSlug}`);
    return res.redirect(`/app/message-boards/${topicSlug}`);
  } catch (err) {
    next(err);
  }
}

// CONTROLLER: POST LIKE (FROM BUTTON CLICK)

async function postLikeMessageToggle(req, res, next) {

  try {

    if (!req.user) {
      return res.status(401).send("User not logged in");
    }

    const { message_id, slug } = req.body;
    // const userId = req.user.id;

    await toggleLike(message_id, req.user.id);

    // res.redirect(`/app/message-boards/${slug}`);
    return res.redirect(`/app/message-boards/${slug}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error liking message");
  }
}

// GET TOPIC NAMES FOR NEW MESSAGE

const getTopicNamesForDropdown = async (req, res, next) => {
  try {
    const user = req.user;
    const topics = await getTopicNames(); // returns [{id, name, required_permission}, ...]
    const visibleTopics = topics.filter((topic) =>
      hasRole(user, topic.required_permission),
    );
    // res.json(visibleTopics); // Must be an array
    return res.json(visibleTopics); // Must be an array
  } catch (err) {
    next(err);
  }
};

// CONTROLLER: GET MESSAGES FOR A TOPIC USING THREAD PATH (buildThreadedMessages)

// const getMessagesForTopic = async (req, res) => {
//   const messages = await getValidMessagesByTopic(
//     req.params.topicId,
//     req.user.id,
//   );
//   const threaded = buildThreadedMessages(messages);
//   res.json(threaded);
// };

async function getMessagesForTopic(req, res, next) {
  try {
    const messages = await getValidMessagesByTopic(
      req.params.topicId,
      req.user?.id,
    );

    const threaded = buildThreadedMessages(messages);

    return res.json(threaded);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getMessageBoards,
  getTopicPage,
  getMessageDetails,
  postNewMessage,
  getMaxMessageChars,
  postStickyMessageToggle,
  postEditMessage,
  postReplyMessage,
  deleteUserMessage,
  postLikeMessageToggle,
  getTopicNamesForDropdown,
  getMessagesForTopic,
};
