const { hasRole } = require("../utils/permissions");
const { buildThreadedMessages } = require("../utils/threadUtils");

const { getAllRetentionDays } = require("../db/queries/appConfigQueries");

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
    // const currentUser = req.user || res.locals.currentUser || null;
    const currentUser = req.currentUser;

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


// CONTROLLER: GET MESSAGE BOARD TOPIC PAGE

async function getTopicPage(req, res, next) {
  try {
    const { slug } = req.params;

    const retentionDays = await getAllRetentionDays();


    // Get topic info
    const topic = await getTopicBySlug(slug);

    if (!topic) {
      return res.status(404).render("404");
    }

    // Ensure currentUser is defined (guests may be undefined)
    // const currentUser = req.user || res.locals.currentUser || null;
    const currentUser = req.currentUser;

    // Authorization check based on DB permission
    if (!hasRole(currentUser, topic.required_permission)) {
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
          retentionDays.message_soft_delete_days * 24 * 60 * 60 * 1000,
      );

      return {
        ...message,
        soft_expiry: softExpiry,
      };
    });

    // const messageLikes = makeAnotherController()

    // const messagesWithAvatars = addAvatarFields(messages, avatarTypeDefault);

    res.render("topic", {
      title: topic.name,
      config: retentionDays,
      topic,
      // messages: messagesWithAvatars,
      // messages,
      messages: messagesWithExpiry,
      currentUser,
      errors: [],
    });
  } catch (err) {
    console.error("Error in getTopicPage:", err);
    next(err); // properly forward the error
  }
}


// CONTROLLER: GET MESSAGES BY ID

// Function to fetch individual user data for modal????
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


// CONTROLLER: NEW MESSAGE (new-message.ejs)

// Use below to model postReplyMessage
async function postNewMessage(req, res, next) {
  const { topic_id, title, body } = req.body;

  // Assuming you're using session-based authentication
  // const currentUser_id = req.user.id; // or whatever key stores user_id in the session
    const currentUserId = req.currentUser.id;
    // const currentUser = req.currentUser;

  if (!currentUserId) {
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
    const newMessage = await insertMessage(
      currentUserId,
      topic_id,
      title,
      body,
    );
    res.redirect(`/app/message-boards/${topic.slug}`);
  } catch (err) {
    next(err);
  }
}


// CONTROLLER: STICKY MESSAGE TOGGLE (message-boards/topic slug)

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


// CONTROLLER: POST EDITED MESSAGE (edit-message.ejs)

async function postEditMessage(req, res, next) {
  try {
    // Extract form data
    const { targetId, title, body } = req.body;

    // Validate form data
    if (!targetId || !body) {
      return res.status(400).send("Missing required data.");
    }

    // Get the currently logged-in user ID
    // const currentUserId = req.user?.id;
    const currentUserId = req.currentUser.id;
    if (!currentUserId) {
      return res.status(401).send("User is not logged in.");
    }

    // Fetch the message from the database
    const message = await getMessageById(targetId); // assume a DB query helper
    if (!message) {
      return res.status(404).send("Message not found.");
    }
    console.log("Updated message with is_edited!:", message.is_edited);
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

// CONTROLLER: POST REPLY MESSAGE (reply-message.ejs)

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
    // const currentUserId = req.user?.id;
    const currentUserId = req.currentUser.id;
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

// CONTROLLER: DELETE MESSAGE

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

// CONTROLLER: POST LIKE (FROM BUTTON CLICK)

async function postLikeMessageToggle(req, res, next) {
  const { message_id, slug } = req.body;
  const currentUserId = req.currentUser.id; // <-- TODO - MORE OF THIS!
  try {
    await toggleLike(message_id, currentUserId);
    // console.log("User ID:", user_id); // Check the value
    // console.log("Message ID:", message_id); // Check the value

    res.redirect(`/app/message-boards/${slug}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error liking message");
  }
}

// GET TOPIC NAMES FOR NEW MESSAGE

const getTopicNamesForDropdown = async (req, res, next) => {
  try {
    // const currentUser = req.user || res.locals.currentUser || null;
    const currentUser = req.currentUser;
    const topics = await getTopicNames(); // returns [{id, name, required_permission}, ...]
    const visibleTopics = topics.filter((topic) =>
      hasRole(currentUser, topic.required_permission),
    );
    res.json(visibleTopics); // MUST be an array
  } catch (err) {
    next(err);
  }
};

// CONTROLLER: GET MESSAGES FOR A TOPIC USING THREAD PATH (buildThreadedMessages)

const getMessagesForTopic = async (req, res) => {
  const messages = await getValidMessagesByTopic(
    req.params.topicId,
    // req.user.id,
    req.currentUser.id
  );
  const threaded = buildThreadedMessages(messages);
  res.json(threaded);
};

module.exports = {
  getMessageBoards,
  getTopicPage,
  getMessageDetails,
  postNewMessage,
  postStickyMessageToggle,
  postEditMessage,
  postReplyMessage,
  deleteUserMessage,
  postLikeMessageToggle,
  getTopicNamesForDropdown,
  getMessagesForTopic,
};
