// // jobs/retentionJobs.js
// const pool = require("../db/pool"); // your pg pool
// const { getAllSiteControls } = require("../db/queries/appConfigQueries");

// /**
//  * Run all retention jobs:
//  * 1. Soft delete messages
//  * 2. Hard delete messages
//  * 3. Hard delete sessions
//  */
// async function runRetentionJobs() {
//   try {
//     // 1️⃣ Load retention values from app_config
//     const retentionDays = await getAllSiteControls();
//     const messageSoftDays = retentionDays.message_soft_delete_days;
//     const messageHardDays = retentionDays.message_hard_delete_days;
//     const sessionHardDays = retentionDays.session_hard_delete_days;

//     console.log("Retention values loaded:", retentionDays);

//     // 2️⃣ Soft delete messages (mark is_deleted = true)
//     try {
//       const { rowCount } = await pool.query(
//         `
//         UPDATE messages
//         SET is_deleted = TRUE,
//             deleted_at = NOW()
//         WHERE is_deleted = FALSE
//           AND is_sticky = FALSE      -- <--- sticky messages are skipped
//           AND created_at <= NOW() - $1 * INTERVAL '1 day'
//       `,
//         [messageSoftDays],
//       );

//       console.log(`Soft delete complete: ${rowCount} messages marked deleted.`);
//     } catch (err) {
//       console.error("Error in soft deleting messages:", err);
//     }

//     // 3️⃣ Hard delete messages (remove rows)
//     try {
//       const { rowCount } = await pool.query(
//         `
//         DELETE FROM messages
//         WHERE is_deleted = TRUE
//           AND is_sticky = FALSE      -- <--- still skip sticky messages
//           AND created_at <= NOW() - $1 * INTERVAL '1 day'
//       `,
//         [messageHardDays],
//       );

//       console.log(`Hard delete complete: ${rowCount} messages permanently removed.`);
//     } catch (err) {
//       console.error("Error in hard deleting messages:", err);
//     }

//     // 4️⃣ Hard delete sessions (remove old session rows)
//     try {
//       const { rowCount } = await pool.query(
//         `
//         DELETE FROM sessions
//         WHERE created_at <= NOW() - $1 * INTERVAL '1 day'
//       `,
//         [sessionHardDays],
//       );

//       console.log(`Hard delete complete: ${rowCount} sessions removed.`);
//     } catch (err) {
//       console.error("Error in hard deleting sessions:", err);
//     }

//     console.log("All retention jobs finished successfully.");
//   } catch (err) {
//     console.error("Critical error running retention jobs:", err);
//   }
// }

// module.exports = {
//   runRetentionJobs,
// };

const pool = require("../db/pool");
const { getAllSiteControls } = require("../db/queries/appConfigQueries");

// Run all retention jobs (soft + hard deletes)
const runRetentionJobs = async () => {
  const client = await pool.connect();

  try {
    // 1️⃣ Get retention days from app_config
    const retention = await getAllSiteControls();
    const {
      message_soft_delete_days,
      message_hard_delete_days,
      session_hard_delete_days,
    } = retention;

    await client.query("BEGIN");

    // 2️⃣ Soft delete messages (skip sticky messages)
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

    // 3️⃣ Hard delete messages that were soft deleted
    await client.query(
      `
      DELETE FROM messages
      WHERE is_deleted = TRUE
        AND is_sticky = FALSE
        AND created_at <= NOW() - $1 * INTERVAL '1 day';
      `,
      [message_hard_delete_days],
    );

    // 4️⃣ Hard delete old sessions
    await client.query(
      `
      DELETE FROM sessions
      WHERE created_at <= NOW() - $1 * INTERVAL '1 day';
      `,
      [session_hard_delete_days],
    );

    await client.query("COMMIT");
    console.log("✅ Retention jobs completed successfully");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Error running retention jobs:", err);
    throw err;
  } finally {
    client.release();
  }
};

module.exports = { runRetentionJobs };