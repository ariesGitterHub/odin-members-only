const pool = require("../pool");

// const getAllSiteControls = async () => {
//   const { rows } = await pool.query(`
//     SELECT key, value
//     FROM app_config
//     WHERE key LIKE '%_delete_days';
//   `);

//   return Object.fromEntries(rows.map((r) => [r.key, Number(r.value)]));
// };

const getAllSiteControls = async () => {
  const { rows } = await pool.query(`
    SELECT key, value
    FROM app_config
    WHERE key LIKE '%_delete_days' OR key = 'maintenance_mode';
  `);

  // Convert the rows into an object, ensuring to handle the boolean for maintenance_mode
  const config = Object.fromEntries(
    rows.map((r) => {
      if (r.key === "maintenance_mode") {
        return [r.key, r.value === "true"]; // Convert string to boolean
      } else {
      return [r.key, Number(r.value)]; // Convert delete days to number
      }
    }),
  );

  return config;
};

const updateAllSiteControls = async (messageSoft, messageHard, sessionHard, maintenanceMode) => {
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
       WHERE key = 'session_hard_delete_days'`,
      [Number(sessionHard)],
    );

    // Update maintenance mode
    await client.query(
      `UPDATE app_config SET value = $1, updated_at = NOW()
       WHERE key = 'maintenance_mode'`,
      [maintenanceMode ? "true" : "false"], // Save the boolean as a string
    );

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Failed to update site settings:", err);
    throw new Error("Could not update site settings");
  } finally {
    client.release();
  }
}

module.exports = {
  getAllSiteControls,
  updateAllSiteControls,
};
