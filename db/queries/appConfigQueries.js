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
    WHERE key LIKE '%_delete_days' 
      OR key = 'max_message_chars'
      OR key = 'maintenance_mode' 
      OR key IN ('admin_emoji', 'member_emoji', 'guest_emoji');
  `);

  // Convert the rows into an object, ensuring to handle the boolean for maintenance_mode
  const config = Object.fromEntries(
    rows.map((r) => {
      if (r.key === "maintenance_mode") {
        return [r.key, r.value === "true"]; // Convert string to boolean
      } else if (
        ["admin_emoji", "member_emoji", "guest_emoji"].includes(r.key)
      ) {
        return [r.key, r.value]; // keep emoji as string
      } else {
        return [r.key, Number(r.value)]; // Convert delete days or max chars to numbers
      }
    }),
  );

  return config;
};

// const getAllSiteControls = async () => {
//   const booleanKeys = new Set(["maintenance_mode"]);
//   const emojiKeys = new Set(["avatar-emoji", "member-emoji", "guest-emoji"]);

//   const { rows } = await pool.query(`
//     SELECT key, value
//     FROM app_config
//     WHERE key LIKE '%_delete_days' 
//        OR key IN ('maintenance_mode', 'avatar-emoji', 'member-emoji', 'guest-emoji');
//   `);

//   const config = Object.fromEntries(
//     rows.map((r) => {
//       const { key, value } = r;

//       if (booleanKeys.has(key)) {
//         if (value !== "true" && value !== "false") {
//           throw new Error(`Invalid boolean value for key "${key}": ${value}`);
//         }
//         return [key, value === "true"];
//       }

//       if (emojiKeys.has(key)) {
//         if (typeof value !== "string") {
//           throw new Error(`Expected string for key "${key}", got: ${value}`);
//         }
//         return [key, value];
//       }

//       // Handle *_delete_days keys
//       const num = parseInt(value, 10);
//       if (isNaN(num)) {
//         throw new Error(`Invalid number value for key "${key}": ${value}`);
//       }
//       return [key, num];
//     }),
//   );

//   return config;
// };

// const updateAllSiteControls = async (messageSoft, messageHard, sessionHard, maintenanceMode) => {
//   const client = await pool.connect();

//   try {
//     await client.query("BEGIN");

//     await client.query(
//       `UPDATE app_config SET value = $1, updated_at = NOW()
//        WHERE key = 'message_soft_delete_days'`,
//       [Number(messageSoft)],
//     );

//     await client.query(
//       `UPDATE app_config SET value = $1, updated_at = NOW()
//        WHERE key = 'message_hard_delete_days'`,
//       [Number(messageHard)],
//     );

//     await client.query(
//       `UPDATE app_config SET value = $1, updated_at = NOW()
//        WHERE key = 'session_hard_delete_days'`,
//       [Number(sessionHard)],
//     );

//     // Update maintenance mode
//     await client.query(
//       `UPDATE app_config SET value = $1, updated_at = NOW()
//        WHERE key = 'maintenance_mode'`,
//       [maintenanceMode ? "true" : "false"], // Save the boolean as a string
//     );

//     await client.query("COMMIT");
//   } catch (err) {
//     await client.query("ROLLBACK");
//     console.error("Failed to update site settings:", err);
//     throw new Error("Could not update site settings");
//   } finally {
//     client.release();
//   }
// }

const updateAllSiteControls = async (
  messageSoft,
  messageHard,
  sessionHard,
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
    throw new Error("Could not update site settings");
  } finally {
    client.release();
  }
};

module.exports = {
  getAllSiteControls,
  updateAllSiteControls,
};
