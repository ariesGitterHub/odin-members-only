// PostgreSQL queries for the Neighborhood Message Board
// Requires: node-postgres client (pg)
const pool = require("./pool");

const getValidMessages = async (client, limit = 50) => {
  /**
   * Fetch messages that are not deleted and not expired.
   * Ordered by newest first.
   * @param client: pg Client or PoolClient
   * @param limit: number of messages to return
   */
  const query = `
    SELECT id, topic_id, user_id, title, body, created_at, expires_at
    FROM messages
    WHERE is_deleted = false
      AND (expires_at IS NULL OR expires_at > NOW())
    ORDER BY created_at DESC
    LIMIT $1;
  `;
  const res = await client.query(query, [limit]);
  return res.rows;
};

const softDeleteExpiredMessages = async (client) => {
  /**
   * Soft-delete messages that have expired but are not yet marked as deleted.
   * Sets is_deleted = true and deleted_at = NOW()
   * Can be run hourly/daily via cron.
   */
  const query = `
    UPDATE messages
    SET is_deleted = true,
        deleted_at = NOW()
    WHERE expires_at IS NOT NULL
      AND expires_at < NOW()
      AND is_deleted = false;
  `;
  const res = await client.query(query);
  return res.rowCount; // number of rows updated
};

const hardDeleteMessages = async (client, olderThanDays = 30) => {
  /**
   * Hard delete messages that were soft-deleted more than olderThanDays ago.
   * Frees up DB storage.
   */
  const query = `
    DELETE FROM messages
    WHERE is_deleted = true
      AND deleted_at < NOW() - INTERVAL '${olderThanDays} days';
  `;
  const res = await client.query(query);
  return res.rowCount; // number of rows deleted
};

const cleanupMessages = async (client, olderThanDays = 30) => {
  /**
   * Combined cleanup function:
   * 1. Soft-delete expired messages
   * 2. Hard-delete old soft-deleted messages
   * Can be scheduled as a cron job.
   */
  const softDeleted = await softDeleteExpiredMessages(client);
  const hardDeleted = await hardDeleteMessages(client, olderThanDays);

  return {
    softDeleted,
    hardDeleted,
  };
};

// Optional: fetch messages by user
const getMessagesByUser = async (client, userId, limit = 50) => {
  const query = `
    SELECT id, topic_id, title, body, created_at, expires_at
    FROM messages
    WHERE user_id = $1
      AND is_deleted = false
      AND (expires_at IS NULL OR expires_at > NOW())
    ORDER BY created_at DESC
    LIMIT $2;
  `;
  const res = await client.query(query, [userId, limit]);
  return res.rows;
};

// Optional: fetch messages by topic
const getMessagesByTopic = async (client, topicId, limit = 50) => {
  const query = `
    SELECT id, user_id, title, body, created_at, expires_at
    FROM messages
    WHERE topic_id = $1
      AND is_deleted = false
      AND (expires_at IS NULL OR expires_at > NOW())
    ORDER BY created_at DESC
    LIMIT $2;
  `;
  const res = await client.query(query, [topicId, limit]);
  return res.rows;
};

module.exports = {
  getValidMessages,
  getMessagesByUser,
  getMessagesByTopic,
  softDeleteExpiredMessages,
  hardDeleteMessages,
  cleanupMessages,
};
