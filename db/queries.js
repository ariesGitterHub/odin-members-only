const pool = require("./pool");

// const getUsers = async function getUsers() {
//   const { rows } = await pool.query(`
//     SELECT
//       u.*,
//       up.avatar_type,
//       up.avatar_color_fg,
//       up.avatar_color_bg_top,
//       up.avatar_color_bg_bottom,
//       up.phone,
//       up.street_address,
//       up.apt_unit,
//       up.city,
//       up.us_state,
//       up.zip_code,
//       up.notes,
//       up.verified_by_admin
//     FROM users u
//     LEFT JOIN user_profiles up
//       ON u.id = up.user_id
//     ORDER BY u.id;
//   `);

//   return rows;
// };

// Query to get avatar-related data by user ID
// const getAvatarByUserId = `
//   SELECT
//     avatar_type,
//     avatar_color_fg,
//     avatar_color_bg_top,
//     avatar_color_bg_bottom
//   FROM user_profiles
//   WHERE user_id = $1;
// `;

const getUsers = async function getUsers() {
  const { rows } = await pool.query(`
    SELECT
      u.*,
      up.avatar_type,
      up.avatar_color_fg,
      up.avatar_color_bg_top,
      up.avatar_color_bg_bottom,
      up.phone,
      up.street_address,
      up.apt_unit,
      up.city,
      up.us_state,
      up.zip_code,
      up.notes,
      up.verified_by_admin,
      COUNT(m.id) AS message_count
    FROM users u
    LEFT JOIN user_profiles up ON u.id = up.user_id
    LEFT JOIN messages m ON u.id = m.user_id AND m.is_deleted = false
    GROUP BY u.id, up.user_id
    ORDER BY 
      CASE 
        WHEN u.permission_status = 'admin' THEN 0
        ELSE 1
      END,
      u.last_name,  -- Sort by last name in alphabetical order
      u.first_name; -- If last names are the same, then by first name
  `);

  return rows;
};

// NEW...............................................................................
const getUserById = async function getUserById(userId) {
  const { rows } = await pool.query(
    `
    SELECT
      u.*,
      up.avatar_type,
      up.avatar_color_fg,
      up.avatar_color_bg_top,
      up.avatar_color_bg_bottom,
      up.phone,
      up.street_address,
      up.apt_unit,
      up.city,
      up.us_state,
      up.zip_code,
      up.notes,
      up.verified_by_admin,
      COUNT(m.id) AS message_count
    FROM users u
    LEFT JOIN user_profiles up ON u.id = up.user_id
    LEFT JOIN messages m ON u.id = m.user_id AND m.is_deleted = false
    WHERE u.id = $1
    GROUP BY u.id, up.user_id
  `,
    [userId],
  );

  return rows[0]; // Returning only the first row (one user)
};

// const getAllTopics = async () => {
//   const query = `
//     SELECT *
//     FROM topics
//     WHERE is_active = true
//     ORDER BY sort_order;
//   `;
//   const res = await pool.query(query);
//   return res.rows;
// };

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

// const getMessagesByTopicId = async (topicId, limit = 50) => {
//   const query = `
//     SELECT
//       m.id,
//       m.topic_id,
//       m.user_id,
//       m.title,
//       m.like_count,
//       m.body,
//       m.created_at,
//       u.first_name,
//       u.last_name
//     FROM messages m
//     JOIN users u ON m.user_id = u.id
//     WHERE m.topic_id = $1
//       AND m.is_deleted = false
//       AND (m.expires_at IS NULL OR m.expires_at > NOW())
//     ORDER BY m.created_at DESC
//     LIMIT $2;
//   `;
//   const res = await pool.query(query, [topicId, limit]);
//   return res.rows;
// };

/**
 * Fetch messages that are not deleted and not expired.
 * Ordered by newest first.
 * @param limit: number of messages to return
 */
// const getValidMessages = async (limit = 50) => {
//   const query = `
//     SELECT id, topic_id, user_id, title, like_count, body, created_at, expires_at
//     FROM messages
//     WHERE is_deleted = false
//       AND (expires_at IS NULL OR expires_at > NOW())
//     ORDER BY created_at DESC
//     LIMIT $1;
//   `;
//   const res = await pool.query(query, [limit]);
//   return res.rows;
// };

// const getValidMessagesByTopic = async (topicId, limit = 50) => {
//   const query = `
//     SELECT
//       m.id,
//       m.topic_id,
//       m.user_id,
//       m.title,
//       m.like_count,
//       m.body,
//       m.created_at,
//       m.expires_at,
//       u.first_name,
//       u.last_name
//     FROM messages m
//     JOIN users u ON m.user_id = u.id
//     WHERE m.topic_id = $1
//       AND m.is_deleted = false
//       AND (m.expires_at IS NULL OR m.expires_at > NOW())
//     ORDER BY m.created_at DESC
//     LIMIT $2;
//   `;
//   const res = await pool.query(query, [topicId, limit]);
//   return res.rows;
// };

const getValidMessagesByTopic = async (topicId, limit = 50) => {
  const query = `
    SELECT 
      m.id,
      m.topic_id,
      m.user_id,
      m.title,
      m.like_count,
      m.body,
      m.created_at,
      m.expires_at,
      u.first_name,
      u.last_name,
      u.permission_status,
      up.avatar_type,
      up.avatar_color_fg,
      up.avatar_color_bg_top,
      up.avatar_color_bg_bottom
    FROM messages m
    JOIN users u ON m.user_id = u.id
    LEFT JOIN user_profiles up ON up.user_id = u.id
    WHERE m.topic_id = $1
      AND m.is_deleted = false
      AND (m.expires_at IS NULL OR m.expires_at > NOW())
    ORDER BY m.created_at DESC
    LIMIT $2;
  `;
  const res = await pool.query(query, [topicId, limit]);
  return res.rows;
};

/**
 * Soft-delete messages that have expired but are not yet marked as deleted.
 * Sets is_deleted = true and deleted_at = NOW()
 * Can be run hourly/daily via cron.
 */
const softDeleteExpiredMessages = async () => {
  const query = `
    UPDATE messages
    SET is_deleted = true,
        deleted_at = NOW()
    WHERE expires_at IS NOT NULL
      AND expires_at < NOW()
      AND is_deleted = false;
  `;
  const res = await pool.query(query);
  return res.rowCount; // number of rows updated
};

/**
 * Hard delete messages that were soft-deleted more than olderThanDays ago.
 * Frees up DB storage.
 * @param olderThanDays: number of days after which soft-deleted messages are permanently deleted
 */
const hardDeleteMessages = async (olderThanDays = 30) => {
  const query = `
    DELETE FROM messages
    WHERE is_deleted = true
      AND deleted_at < NOW() - INTERVAL $1::text;
  `;
  const res = await pool.query(query, [`${olderThanDays} days`]);
  return res.rowCount; // number of rows deleted
};

/**
 * Combined cleanup function:
 * 1. Soft-delete expired messages
 * 2. Hard-delete old soft-deleted messages
 * Can be scheduled as a cron job.
 * Runs in a single transaction so cleanup is atomic:
 * - If soft-delete fails, hard-delete is not executed
 * - If hard-delete fails, soft-deletes are rolled back
 */
const cleanupMessages = async (olderThanDays = 30) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN"); // start transaction

    const softDeletedRes = await client.query(`
      UPDATE messages
      SET is_deleted = true,
          deleted_at = NOW()
      WHERE expires_at IS NOT NULL
        AND expires_at < NOW()
        AND is_deleted = false
      RETURNING id;
    `);
    const softDeleted = softDeletedRes.rowCount;

    const hardDeletedRes = await client.query(
      `
      DELETE FROM messages
      WHERE is_deleted = true
        AND deleted_at < NOW() - INTERVAL $1::text
      RETURNING id;
    `,
      [`${olderThanDays} days`],
    );
    const hardDeleted = hardDeletedRes.rowCount;

    await client.query("COMMIT");
    return { softDeleted, hardDeleted };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

/**
 * Fetch messages by a specific user
 * @param userId: ID of the user
 * @param limit: number of messages to return
 */
// const getMessagesByUser = async (userId, limit = 50) => {
//   const query = `
//     SELECT id, topic_id, title, body, created_at, expires_at
//     FROM messages
//     WHERE user_id = $1
//       AND is_deleted = false
//       AND (expires_at IS NULL OR expires_at > NOW())
//     ORDER BY created_at DESC
//     LIMIT $2;
//   `;
//   const res = await pool.query(query, [userId, limit]);
//   return res.rows;
// };

/**
 * Fetch messages by a specific topic
 * @param topicId: ID of the topic
 * @param limit: number of messages to return
 */
const getMessagesByTopic = async (topicId, limit = 50) => {
  const query = `
    SELECT id, user_id, title, body, created_at, expires_at
    FROM messages
    WHERE topic_id = $1
      AND is_deleted = false
      AND (expires_at IS NULL OR expires_at > NOW())
    ORDER BY created_at DESC
    LIMIT $2;
  `;
  const res = await pool.query(query, [topicId, limit]);
  return res.rows;
};

//
//
//

// /**
//  * [Brief description of the query]
//  * @param params: array of query parameters (if any)
//  * @param limit: optional, number of rows to return
//  * @returns Array of result rows
//  */
// const queryTemplate = async (sql, params = []) => {
//   try {
//     const res = await pool.query(sql, params);
//     return res.rows;
//   } catch (err) {
//     console.error("Database query error:", err.message);
//     throw err;
//   }
// };

// /**
//  * Fetch messages containing a keyword in the title or body
//  * @param keyword: string to search for
//  * @param limit: optional number of rows to return
//  */
// const getMessagesByKeyword = async (keyword, limit = 50) => {
//   const sql = `
//     SELECT id, user_id, topic_id, title, body, created_at, expires_at
//     FROM messages
//     WHERE is_deleted = false
//       AND (expires_at IS NULL OR expires_at > NOW())
//       AND (title ILIKE $1 OR body ILIKE $1)
//     ORDER BY created_at DESC
//     LIMIT $2;
//   `;
//   return queryTemplate(sql, [`%${keyword}%`, limit]);
// };

// /**
//  * Update the title of a specific message
//  * @param messageId: ID of the message
//  * @param newTitle: new title string
//  * @returns Number of rows updated
//  */
// const updateMessageTitle = async (messageId, newTitle) => {
//   const sql = `
//     UPDATE messages
//     SET title = $1
//     WHERE id = $2
//       AND is_deleted = false
//   `;
//   const res = await pool.query(sql, [newTitle, messageId]);
//   return res.rowCount;
// };

// // const client = await pool.connect();
// // try {
// //   await client.query("BEGIN");
// //   await client.query("UPDATE ...");
// //   await client.query("DELETE ...");
// //   await client.query("COMMIT");
// // } catch (err) {
// //   await client.query("ROLLBACK");
// //   throw err;
// // } finally {
// //   client.release();
// // }

module.exports = {
  getUsers,
  getUserById,
  // getTopics,
  getAllTopics,
  getTopicBySlug,
  // getMessagesByTopicId,
  getValidMessagesByTopic,
  // getMessagesByUser,
  getMessagesByTopic,
  softDeleteExpiredMessages,
  hardDeleteMessages,
  cleanupMessages,
};
