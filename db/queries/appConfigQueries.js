const pool = require("../pool");

// QUERY: GET CONFIG SETTINGS
const getAllSiteControls = async () => {
  const keysToFetch = [
    "message_soft_delete_days",
    "message_hard_delete_days",
    "session_hard_delete_days",
    "signup_limit_window_minutes",
    "signup_limit_max_users",
    "login_limit_window_minutes",
    "login_limit_max_users",
    "max_message_chars",
    "maintenance_mode",
    "admin_emoji",
    "member_emoji",
    "guest_emoji",
  ];

  const { rows } = await pool.query(`
  SELECT key, value
  FROM app_config
  WHERE key IN (${keysToFetch.map((key) => `'${key}'`).join(", ")})
`);

  // Convert the rows into an object, ensuring to handle the boolean for maintenance_mode
  const config = Object.fromEntries(
    rows.map((r) => {
      if (r.key === "maintenance_mode") {
        return [r.key, r.value === "true"]; // Convert string to boolean
      } else if (
        ["admin_emoji", "member_emoji", "guest_emoji"].includes(r.key)
      ) {
        return [r.key, r.value]; // Keep emoji as string
      } else {
        return [r.key, Number(r.value)]; // Convert delete days or max chars to numbers
      }
    }),
  );

  return config;
};

// QUERY: UPDATE CONFIG SETTINGS
const updateAllSiteControls = async (
  messageSoft,
  messageHard,
  sessionHard,
  signupLimitWindowMinutes,
  signupLimitMaxUsers,
  loginLimitWindowMinutes,
  loginLimitMaxUsers,
  maxMessageChars,
  maintenanceMode,
  adminEmoji,
  memberEmoji,
  guestEmoji,
) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Helper to update a key
    const updateKey = async (key, value) => {
      await client.query(
        `UPDATE app_config SET value = $1, updated_at = NOW() WHERE key = $2`,
        [value, key],
      );
    };

    // Update numeric delete days
    await updateKey("message_soft_delete_days", Number(messageSoft));
    await updateKey("message_hard_delete_days", Number(messageHard));
    await updateKey("session_hard_delete_days", Number(sessionHard));
    await updateKey(
      "signup_limit_window_minutes",
      Number(signupLimitWindowMinutes),
    );
    await updateKey("signup_limit_max_users", Number(signupLimitMaxUsers));
    await updateKey(
      "login_limit_window_minutes",
      Number(loginLimitWindowMinutes),
    );
    await updateKey("login_limit_max_users", Number(loginLimitMaxUsers));
    await updateKey("max_message_chars", Number(maxMessageChars));

    // Update boolean maintenance mode
    await updateKey("maintenance_mode", maintenanceMode ? "true" : "false");

    // Update emojis
    await updateKey("admin_emoji", adminEmoji);
    await updateKey("member_emoji", memberEmoji);
    await updateKey("guest_emoji", guestEmoji);

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Failed to update site settings:", err);
    console.error("Update parameters:", {
      messageSoft,
      messageHard,
      sessionHard,
      signupLimitWindowMinutes,
      signupLimitMaxUsers,
      loginLimitWindowMinutes,
      loginLimitMaxUsers,
      maxMessageChars,
      maintenanceMode,
      adminEmoji,
      memberEmoji,
      guestEmoji,
    });
    throw new Error("Could not update site settings");
  } finally {
    client.release();
  }
};

module.exports = {
  getAllSiteControls,
  updateAllSiteControls,
};
