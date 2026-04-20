const pool = require("../db/pool");
const { getAllSiteControls } = require("../db/queries/appConfigQueries");

// Run all retention jobs (soft + hard deletes)
const runRetentionJobs = async () => {
  const client = await pool.connect();

  try {
    // Get retention days from app_config
    const retention = await getAllSiteControls();
    const {
      message_soft_delete_days,
      message_hard_delete_days,
      session_hard_delete_days,
    } = retention;

    await client.query("BEGIN");

    // Soft delete messages (skip sticky messages)
    await client.query(
      `
      UPDATE messages
      SET is_deleted = TRUE,
          deleted_at = NOW()
      WHERE is_deleted = FALSE
        AND is_sticky = FALSE
        AND created_at <= NOW() - $1 * INTERVAL '1 day';
      `,
      [message_soft_delete_days],
    );

    // Hard delete messages that were soft deleted
    await client.query(
      `
      DELETE FROM messages
      WHERE is_deleted = TRUE
        AND is_sticky = FALSE
        AND created_at <= NOW() - $1 * INTERVAL '1 day';
      `,
      [message_hard_delete_days],
    );

    // Hard delete old sessions
    await client.query(
      `
      DELETE FROM sessions
      WHERE created_at <= NOW() - $1 * INTERVAL '1 day';
      `,
      [session_hard_delete_days],
    );

    await client.query("COMMIT");
    console.log("Retention jobs completed successfully");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Error running retention jobs:", err);
    throw err;
  } finally {
    client.release();
  }
};

module.exports = { runRetentionJobs };