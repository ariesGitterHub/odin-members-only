const pool = require("../pool");

// QUERY: GET ALL MESSAGES

const getMessages = async () => {
  const query = `
    SELECT *
    FROM messages m
  `;

  try {
    const { rows } = await pool.query(query);
    return rows; // Returns all messages
  } catch (err) {
    console.error("Error retrieving messages:", err);
    throw err; // Optionally, rethrow the error or handle it as needed
  }
};

// QUERY: GET MESSAGES BY ID

const getMessageById = async (targetId) => {
  const query = `
  SELECT 
    m.id AS message_id, 
    m.parent_message_id,
    m.topic_id,
    m.user_id AS message_user_id,
    m.like_count,
    m.reply_count,    
    m.title,
    m.body,
    m.is_edited,    
    m.created_at,
    m.updated_at,
    -- m.expires_at,
    m.is_sticky,
    m.is_deleted,
    m.deleted_at,
    u.id AS user_id,
    u.first_name,
    u.last_name,
    u.email,
    t.name AS topic_name,
    t.slug AS topic_slug
  FROM messages m
  JOIN users u ON m.user_id = u.id 
  LEFT JOIN topics t ON m.topic_id = t.id 
  WHERE m.is_deleted = false
  AND m.id = $1;
  `;

  const res = await pool.query(query, [targetId]);

  if (res.rowCount === 0) {
    return null; // not found
  }

  return res.rows[0]; // the message object
};

// QUERY: GET TOPICS BY ID

const getTopicById = async (topic_id) => {
  const query = `
    SELECT *
    FROM topics
    WHERE id = $1
    AND is_active = true
    LIMIT 1;
  `;
  const res = await pool.query(query, [topic_id]);
  return res.rows[0];
};

// QUERY: GET TOPIC LIST FOR DROPDOWN IN NEW MESSAGE (new-message.ejs)

const getTopicNames = async () => {
  const { rows } = await pool.query(`
    SELECT id, name, required_permission
    FROM topics
    WHERE is_active = true
    ORDER BY sort_order;
  `);

  return rows;
};

// QUERY: INSERT INTO NEW MESSAGE (new-message.ejs) OR REPLY MESSAGE (reply-message.ejs)

const insertMessage = async (
  user_id,
  topic_id,
  title,
  body,
  parent_message_id = null,
) => {
  const client = await pool.connect();
  try {
    let res;

    // If there's no parent_message_id, it's a top-level message
    if (!parent_message_id) {
      // Top-level message
      res = await client.query(
        `
        INSERT INTO messages (topic_id, user_id, title, body, thread_path)
        VALUES ($1, $2, $3, $4, DEFAULT)
        RETURNING id;
        `,
        [topic_id, user_id, title, body],
      );

      const messageId = res.rows[0].id;

      // Update thread_path to its own id
      await client.query(`UPDATE messages SET thread_path = $1 WHERE id = $2`, [
        messageId.toString(),
        messageId,
      ]);

      return { id: messageId };
    } else {
      // Reply to existing message
      // Get parent's thread_path
      const parentRes = await client.query(
        `SELECT thread_path FROM messages WHERE id = $1`,
        [parent_message_id],
      );
      if (!parentRes.rows[0]) throw new Error("Parent message not found");

      const parentPath = parentRes.rows[0].thread_path;

      // Insert reply
      res = await client.query(
        `
        INSERT INTO messages (topic_id, user_id, title, body, parent_message_id, thread_path)
        VALUES ($1, $2, $3, $4, $5, DEFAULT)
        RETURNING id;
        `,
        [topic_id, user_id, title, body, parent_message_id],
      );

      const messageId = res.rows[0].id;

      // Set proper thread_path
      // Update thread_path after insert (this could be done at insert time, depending on DB)

      const threadPath = `${parentPath}/${messageId}`;
      await client.query(`UPDATE messages SET thread_path = $1 WHERE id = $2`, [
        threadPath,
        messageId,
      ]);

      return { id: messageId };
    }
  } catch (err) {
    console.error("Error inserting message:", err);
    throw err;
  } finally {
    client.release();
  }
};

// QUERY: TOPICS FOR MESSAGE BOARD (message-boards.ejs)

const getAllTopics = async () => {
  const { rows } = await pool.query(`
    SELECT
      t.*,
      COUNT(m.id) AS message_count
    FROM topics t
    LEFT JOIN messages m 
      ON m.topic_id = t.id
      AND m.is_deleted = false
    WHERE t.is_active = true
    GROUP BY t.id
    ORDER BY t.sort_order;
  `);

  return rows;
};

// QUERY TOPIC SLUGS FOR MESSAGE BOARD TOPIC ROUTES (topic.ejs and message-card.ejs)

const getTopicBySlug = async (slug) => {
  const query = `
    SELECT *
    FROM topics
    WHERE LOWER(slug) = LOWER($1)
      AND is_active = true
    LIMIT 1;
  `;
  const res = await pool.query(query, [slug]);
  return res.rows[0];
};

// QUERY: MESSAGES BY TOPIC (topic.ejs and message-card.ejs) - SIMPLE FLAT THREAD VERSION - NOTE - KEEP FOR REFERENCE

// This uses simple, flat threads; contrast with the thread path approach below

// const getValidMessagesByTopic = async (messageId, userId, limit = 50) => {
//   const query = `
//     SELECT
//       m.id,
//       m.parent_message_id,
//       m.topic_id,
//       m.user_id,
//       m.title,
//       m.like_count,
//       m.reply_count,
//       m.body,
//       m.created_at,
//       m.expires_at,
//       m.is_sticky,
//       ml.user_id AS is_liked_by_user_id,
//       u.first_name,
//       u.last_name,
//       u.permission_status,
//       up.avatar_type,
//       up.avatar_color_fg,
//       up.avatar_color_bg_top,
//       up.avatar_color_bg_bottom
//     FROM messages m
//     JOIN users u ON m.user_id = u.id
//     LEFT JOIN user_profiles up ON up.user_id = u.id
//     -- below is new
//       LEFT JOIN message_likes ml
//       ON ml.message_id = m.id
//       AND ml.user_id = $2
//     WHERE m.topic_id = $1
//       AND m.is_deleted = false
//       AND (m.expires_at IS NULL OR m.expires_at > NOW())
//     ORDER BY
//       m.is_sticky DESC,
//       -- m.created_at DESC
//       -- changed from above due to reordering when the like button was clicked
//       --m.id
//       -- Below groups parent + replies together.
//       COALESCE(m.parent_message_id, m.id),
//       m.created_at
//     LIMIT $3;
//   `;
//   const res = await pool.query(query, [messageId, userId, limit]);
//   return res.rows;
// };

// QUERY: MESSAGES BY TOPIC (topic.ejs and message-card.ejs) - THREAD PATH APPROACH

// This uses the thread path approach; contrast with simple, flat threads above
const getValidMessagesByTopic = async (topicId, userId, limit = 50) => {
  const query = `
    SELECT 
      m.id,
      m.parent_message_id,
      m.topic_id,
      m.user_id,
      m.title,
      m.like_count,
      m.reply_count,
      m.body,
      m.is_edited, 
      m.created_at,
      m.updated_at,
      -- m.expires_at,
      m.is_sticky,
      ml.user_id AS is_liked_by_user_id,
      u.first_name,
      u.last_name,
      u.permission_status,
      u.verified_by_admin,
      up.avatar_type,
      up.avatar_color_fg,
      up.avatar_color_bg_top,
      up.avatar_color_bg_bottom
    FROM messages m
    JOIN users u ON m.user_id = u.id
    LEFT JOIN user_profiles up ON up.user_id = u.id
    LEFT JOIN message_likes ml 
      ON ml.message_id = m.id
      AND ml.user_id = $2
    WHERE m.topic_id = $1
      AND m.is_deleted = false
      -- AND (m.expires_at IS NULL OR m.expires_at > NOW())
    ORDER BY 
      m.is_sticky DESC,
      m.thread_path
    LIMIT $3;
  `;
  const res = await pool.query(query, [topicId, userId, limit]);
  return res.rows;
};

// QUERY: UPDATE MESSAGE (edit-message.ejs)

const updateMessage = async (targetId, title, body) => {
  const client = await pool.connect();
  const queryText = `
    UPDATE messages
    SET title = $1, body = $2, updated_at = CURRENT_TIMESTAMP, is_edited = TRUE
    WHERE id = $3
    RETURNING id;
  `;
  const queryValues = [title, body, targetId];

  try {
    await client.query("BEGIN"); // Start the transaction
    const result = await client.query(queryText, queryValues);

    if (result.rowCount === 0) {
      throw new Error("No message found with that ID.");
    }
    await client.query("COMMIT"); // Commit the transaction
    return result.rows[0]; // Return the updated message (optional)
  } catch (err) {
    await client.query("ROLLBACK"); // Rollback if any error occurs
    console.error("Error updating message:", err);
    throw err;
  } finally {
    client.release(); // Always release the client back to the pool
  }
};

// QUERY: STICKY BUTTON FOR MESSAGES (message-card.ejs)

const stickyMessageById = async (message_id) => {
  const client = await pool.connect();
  try {
    await client.query(
      `
      UPDATE messages
      SET is_sticky = NOT is_sticky
      WHERE id = $1;
      `,
      [message_id],
    );
  } catch (err) {
    console.error("Error toggling sticky message:", err);
    throw err;
  } finally {
    client.release();
  }
};

// QUERY: DELETE MESSAGE BUTTON BY USER OR ADMIN (message-card.ejs)

const softDeleteMessageById = async (targetId) => {
  const query = `
    UPDATE messages
    SET is_deleted = true,
        deleted_at = NOW()
    WHERE id = $1
      AND is_deleted = false;
  `;
  const res = await pool.query(query, [targetId]);
  return res.rowCount; // number of rows updated
};

// QUERY: REPLY MESSAGE BUTTON INCREMENTOR (message-card.ejs)

const incrementReplyCount = async (parent_message_id) => {
  const client = await pool.connect();
  try {
    const res = await client.query(
      `UPDATE messages
       SET reply_count = reply_count + 1
       WHERE id = $1
       RETURNING reply_count`,
      [parent_message_id],
    );
    return res.rows[0].reply_count; // return the new count if you want
  } catch (err) {
    console.error("Error incrementing reply count:", err);
    throw err;
  } finally {
    client.release();
  }
};

// QUERY: LIKE MESSAGE BUTTON (message-card.ejs)

const toggleLike = async (messageId, userId) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN"); // Start a transaction

    // Check if the user has already liked the message
    const { rows: likeRows } = await client.query(
      `
      SELECT * FROM message_likes
      WHERE message_id = $1 AND user_id = $2;
    `,
      [messageId, userId],
    );

    if (likeRows.length > 0) {
      // User has already liked the message, so remove the like (delete)
      await client.query(
        `
        DELETE FROM message_likes
        WHERE message_id = $1 AND user_id = $2;
      `,
        [messageId, userId],
      );
    } else {
      // User hasn't liked the message, so insert a new like
      await client.query(
        `
        INSERT INTO message_likes (message_id, user_id)
        VALUES ($1, $2);
      `,
        [messageId, userId],
      );
    }

    // Update the like_count in the messages table
    await client.query(
      `
      UPDATE messages
      SET like_count = (SELECT COUNT(*) FROM message_likes WHERE message_id = $1)
      WHERE id = $1;
    `,
      [messageId],
    );

    await client.query("COMMIT"); // Commit the transaction
  } catch (err) {
    await client.query("ROLLBACK"); // Rollback on error
    console.error("Error toggling like:", err);
    throw err;
  } finally {
    client.release(); // Release the client
  }
};

module.exports = {
  getMessages,
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
};
