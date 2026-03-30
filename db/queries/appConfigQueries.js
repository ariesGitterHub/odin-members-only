const pool = require("../pool");


// const getAllRetention = async () => {
//   const { rows } = await pool.query(`
//     SELECT *
//     FROM app_config
//     WHERE key IN (
//       'message_soft_delete_days',
//       'message_hard_delete_days',
//       'session_soft_delete_days',
//       'session_hard_delete_days'
//     );
//   `);

//   return rows;
// };

const getAllRetentionDays = async () => {
  const { rows } = await pool.query(`
    SELECT key, value
    FROM app_config
    WHERE key LIKE '%_delete_days';
  `);

  return Object.fromEntries(rows.map((r) => [r.key, Number(r.value)]));
};

const updateAllRetentionDays = async (messageSoft, messageHard, sessionSoft, sessionHard) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await client.query(
      `UPDATE app_config SET value = $1, updated_at = NOW()
       WHERE key = 'message_soft_delete_days'`,
      [Number(messageSoft)],
    );

    await client.query(
      `UPDATE app_config SET value = $1, updated_at = NOW()
       WHERE key = 'message_hard_delete_days'`,
      [Number(messageHard)],
    );

    await client.query(
      `UPDATE app_config SET value = $1, updated_at = NOW()
       WHERE key = 'session_soft_delete_days'`,
      [Number(sessionSoft)],
    );

    await client.query(
      `UPDATE app_config SET value = $1, updated_at = NOW()
       WHERE key = 'session_hard_delete_days'`,
      [Number(sessionHard)],
    );

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Failed to update retention settings:", err);
    throw new Error("Could not update retention settings");
  } finally {
    client.release();
  }
}

module.exports = {
  getAllRetentionDays,
  updateAllRetentionDays,
};
