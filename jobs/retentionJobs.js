// NOTE - See /jobs/runProdRetentionJobs for how this file is executed in Render

const pool = require("../db/pool");
const { getAllSiteControls } = require("../db/queries/appConfigQueries");

// Run all retention jobs (soft + hard deletes)
const runRetentionJobs = async () => {
  const client = await pool.connect();

  let inTransaction = false;

  // Get retention days from app_config
  try {
    // Acquire advisory lock
    const lockResult = await client.query(
      "SELECT pg_try_advisory_lock(123456789) AS locked",
    );

    if (!lockResult.rows[0].locked) {
      console.log("Retention job already running, skipping...");
      return; // important: exit early
    }

    // Get retention days from app_config
    // const retention = await getAllSiteControls();

    await client.query("BEGIN");

    inTransaction = true;

    // const retention = await getAllSiteControls();
    const retention = await getAllSiteControls(client);

    const {
      message_soft_delete_days,
      message_hard_delete_days,
      session_hard_delete_days,
    } = retention;

    // await client.query("BEGIN"); // NOTE - move the start of the transaction up to include const retention

    // Soft delete messages (skip sticky messages)
    // await client.query(
    //   `
    //   UPDATE messages
    //   SET is_deleted = TRUE,
    //       deleted_at = NOW()
    //   WHERE is_deleted = FALSE
    //     AND is_sticky = FALSE
    //     AND created_at <= NOW() - $1 * INTERVAL '1 day';
    //   `,
    //   [message_soft_delete_days],
    // );

    const softDeleteResult = await client.query(
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
    // await client.query(
    //   `
    //   DELETE FROM messages
    //   WHERE is_deleted = TRUE
    //     AND is_sticky = FALSE
    //     AND created_at <= NOW() - $1 * INTERVAL '1 day'; // NOTE - changed here!
    //   `,
    //   [message_hard_delete_days],
    // );

    // await client.query(
    //   `
    //   DELETE FROM messages
    //   WHERE is_deleted = TRUE
    //     AND is_sticky = FALSE
    //     AND deleted_at <= NOW() - $1 * INTERVAL '1 day'
    //   `,
    //   [message_hard_delete_days],
    // );
    const hardDeleteResult = await client.query(
      `
      DELETE FROM messages
      WHERE is_deleted = TRUE
        AND is_sticky = FALSE
        AND deleted_at <= NOW() - $1 * INTERVAL '1 day'
      `,
      [message_hard_delete_days],
    );

    // Hard delete old sessions
    // await client.query(
    //   `
    //   DELETE FROM sessions
    //   WHERE created_at <= NOW() - $1 * INTERVAL '1 day';
    //   `,
    //   [session_hard_delete_days],
    // );

    const sessionDeleteResult = await client.query(
      `
      DELETE FROM sessions
      WHERE created_at <= NOW() - $1 * INTERVAL '1 day';
      `,
      [session_hard_delete_days],
    );

    await client.query("COMMIT");
    console.log("Retention jobs completed successfully", {
      softDeleted: softDeleteResult.rowCount,
      hardDeleted: hardDeleteResult.rowCount,
      sessionsDeleted: sessionDeleteResult.rowCount,
    });
    // console.log("Retention jobs completed successfully");
  } catch (err) {
    // await client.query("ROLLBACK");
      if (inTransaction) {
        await client.query("ROLLBACK");
      }
    console.error("❌ Error running retention jobs:", err);
    throw err;
  } finally {
    client.release();
  }
};

module.exports = { runRetentionJobs };
