// PostgreSQL queries for the Neighborhood Message Board
// Requires: node-postgres client (pg)
const pool = require("./pool");

/**
 * Fetch messages that are not deleted and not expired.
 * Ordered by newest first.
 * @param limit: number of messages to return
 */
const getValidMessages = async (limit = 50) => {
  const query = `
    SELECT id, topic_id, user_id, title, body, created_at, expires_at
    FROM messages
    WHERE is_deleted = false
      AND (expires_at IS NULL OR expires_at > NOW())
    ORDER BY created_at DESC
    LIMIT $1;
  `;
  const res = await pool.query(query, [limit]);
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
const getMessagesByUser = async (userId, limit = 50) => {
  const query = `
    SELECT id, topic_id, title, body, created_at, expires_at
    FROM messages
    WHERE user_id = $1
      AND is_deleted = false
      AND (expires_at IS NULL OR expires_at > NOW())
    ORDER BY created_at DESC
    LIMIT $2;
  `;
  const res = await pool.query(query, [userId, limit]);
  return res.rows;
};

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

/**
 * [Brief description of the query]
 * @param params: array of query parameters (if any)
 * @param limit: optional, number of rows to return
 * @returns Array of result rows
 */
const queryTemplate = async (sql, params = []) => {
  try {
    const res = await pool.query(sql, params);
    return res.rows;
  } catch (err) {
    console.error("Database query error:", err.message);
    throw err;
  }
};


/**
 * Fetch messages containing a keyword in the title or body
 * @param keyword: string to search for
 * @param limit: optional number of rows to return
 */
const getMessagesByKeyword = async (keyword, limit = 50) => {
  const sql = `
    SELECT id, user_id, topic_id, title, body, created_at, expires_at
    FROM messages
    WHERE is_deleted = false
      AND (expires_at IS NULL OR expires_at > NOW())
      AND (title ILIKE $1 OR body ILIKE $1)
    ORDER BY created_at DESC
    LIMIT $2;
  `;
  return queryTemplate(sql, [`%${keyword}%`, limit]);
};

/**
 * Update the title of a specific message
 * @param messageId: ID of the message
 * @param newTitle: new title string
 * @returns Number of rows updated
 */
const updateMessageTitle = async (messageId, newTitle) => {
  const sql = `
    UPDATE messages
    SET title = $1
    WHERE id = $2
      AND is_deleted = false
  `;
  const res = await pool.query(sql, [newTitle, messageId]);
  return res.rowCount;
};

// const client = await pool.connect();
// try {
//   await client.query("BEGIN");
//   await client.query("UPDATE ...");
//   await client.query("DELETE ...");
//   await client.query("COMMIT");
// } catch (err) {
//   await client.query("ROLLBACK");
//   throw err;
// } finally {
//   client.release();
// }

module.exports = {
  getValidMessages,
  getMessagesByUser,
  getMessagesByTopic,
  softDeleteExpiredMessages,
  hardDeleteMessages,
  cleanupMessages,
};
