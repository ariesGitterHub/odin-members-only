const pool = require("./pool");
const bcrypt = require("bcryptjs");

// QUERY: GET ALL USERS

const getUsers = async () => {
  const { rows } = await pool.query(`
    SELECT
      u.id,
      u.email,
      u.first_name,
      u.last_name,
      u.birthdate,
      u.permission_status,
      u.verified_by_admin,
      u.guest_upgrade_invite,
      u.invite_decision,
      u.is_active,
      u.created_at,
      u.updated_at,
      u.last_login_at,
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
      COUNT(m.id) AS message_count
    FROM users u
    LEFT JOIN user_profiles up ON u.id = up.user_id
    LEFT JOIN messages m ON u.id = m.user_id AND m.is_deleted = false
    GROUP BY u.id, up.user_id
    /*  ORDER BY 
      CASE 
        WHEN u.permission_status = 'admin' THEN 0
        ELSE 1
      END,
      u.last_name,  -- Sort by last name in alphabetical order
      u.first_name; -- If last names are the same, then by first name
    */
    -- GROUP BY u.id, up.id
    ORDER BY
    (u.permission_status = 'admin') DESC,
    u.last_name,
    u.first_name;
      
  `);

  return rows;
};

// QUERY: GET USERS BY ID

// BELOW exposes data, see in appRouter.js and on localhost:XXXX/app/user/1
const getUserById = async (targetId) => {
  const { rows } = await pool.query(
    `
    SELECT
      u.id,
      u.email,
      u.first_name,
      u.last_name,
      u.birthdate,
      u.permission_status,
      u.verified_by_admin,
      u.guest_upgrade_invite,
      u.invite_decision,
      u.is_active,
      u.created_at,
      u.updated_at,
      u.last_login_at,
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
      COUNT(m.id) AS message_count
    FROM users u
    LEFT JOIN user_profiles up ON u.id = up.user_id
    LEFT JOIN messages m ON u.id = m.user_id AND m.is_deleted = false
    WHERE u.id = $1
    GROUP BY u.id, up.user_id
  `,
    [targetId],
  );

  return rows[0]; // Returning only the first row (one user)
};

// QUERY: GET MESSAGES BY ID

const getMessageById = async (targetId) => {
  const query = `
  SELECT 
    m.id AS message_id,
    m.title,
    m.body,
    m.like_count,
    m.reply_count,
    m.created_at,
    m.expires_at,
    m.is_sticky,
    m.is_deleted,
    m.deleted_at,
    u.id AS user_id,
    u.first_name,
    u.last_name,
    u.email,
    t.name AS topic_name
  FROM messages m
  JOIN users u ON m.user_id = u.id
  LEFT JOIN topics t ON m.topic_id = t.id
  WHERE m.is_deleted = false
  AND m.id = $1;
  `;

  const res = await pool.query(query, [targetId]);

  if (res.rowCount === 0) {
    return null; // not found
  }

  return res.rows[0]; // the message object
};

const getTopicById = async (topic_id) => {
  const query = `
    SELECT *
    FROM topics
    WHERE id = $1
    AND is_active = true
    LIMIT 1;
  `;
  const res = await pool.query(query, [topic_id]);
  return res.rows[0];
};

// QUERY: CHECK IF EMAIL ALREADY EXISTS IN THE DB (SET UP TO NOT AFFECT USER EDITS TO SAME ENTRY)

// Function to check if email exists
// async function checkIfEmailExists(email) {
// const checkIfEmailExists = async (email) => {
//   const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [
//     email,
//   ]);
//   // return rows; //changed to below..........................................................
//   return rows[0];
// };

async function checkIfEmailExists(email, targetId) {
  const result = await pool.query(
    `SELECT id FROM users
     WHERE email = $1
     AND id != $2`,
    [email, targetId],
  );

  return result.rows;
}

// QUERY: INSERT A NEW USER FROM SIGN UP (sign-up.ejs)

const insertNewUser = async (
  first_name,
  last_name,
  email,
  birthdate,
  password_hash,
  permission_status = "guest",
) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const userRes = await client.query(
      `INSERT INTO users
      (first_name, last_name, email, birthdate, password_hash, permission_status)
      VALUES ($1,$2,$3,$4,$5,$6)
      RETURNING *`,
      [
        first_name,
        last_name,
        email,
        birthdate,
        password_hash,
        permission_status,
      ],
    );

    const user = userRes.rows[0];

    const avatar_type = first_name.charAt(0).toUpperCase();

    await client.query(
      `INSERT INTO user_profiles (user_id, avatar_type)
       VALUES ($1,$2)`,
      [user.id, avatar_type],
    );

    await client.query("COMMIT");

    return user;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

// QUERY: INSERT A NEW USER VIA ADMIN (admin-create.ejs)

// admin-create.ejs form query for admin created users. Mirrors sign-up form requirements, with the added fields of avatar_type, like insertNewUser, and notes for admin purposes.
const insertAdminCreatedUser = async (
  first_name,
  last_name,
  email,
  birthdate,
  password_hash,
  // permission_status = "guest",
  notes = "Admin created user.",
) => {
  console.log("Starting insertAdminCreatedUser...");
  const client = await pool.connect();

  try {
    console.log("Beginning transaction...");
    await client.query("BEGIN");

    console.log("Inserting into users table:", {
      first_name,
      last_name,
      email,
      birthdate,
      // permission_status,
    });
    const userRes = await client.query(
      `INSERT INTO users
       -- (first_name, last_name, email, birthdate, password_hash, permission_status)
       (first_name, last_name, email, birthdate, password_hash)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING *`,
      [
        first_name,
        last_name,
        email,
        birthdate,
        password_hash,
        // permission_status,
      ],
    );

    const user = userRes.rows[0];
    console.log("User inserted successfully:", user);

    const avatar_type = first_name.charAt(0).toUpperCase();
    console.log("Generated avatar_type:", avatar_type);

    console.log("Inserting into user_profiles table:", {
      user_id: user.id,
      avatar_type,
      notes,
    });
    await client.query(
      `INSERT INTO user_profiles (user_id, avatar_type, notes)
       VALUES ($1,$2,$3)`,
      [user.id, avatar_type, notes],
    );

    console.log("Committing transaction...");
    await client.query("COMMIT");

    console.log("insertAdminCreatedUser completed successfully.");
    return user;
  } catch (err) {
    console.error("Error in insertAdminCreatedUser:", err);
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
    console.log("Database client released.");
  }
};

// QUERY: UPDATE OF A USER VIA ADMIN (admin-edit.ejs)

const updateAdminEditedUser = async (
  user_id,
  first_name,
  last_name,
  email,
  birthdate,
  password, // raw password from form; may be empty
  permission_status,
  verified_by_admin,
  guest_upgrade_invite,
  invite_decision,
  is_active,
  avatar_type,
  avatar_color_fg,
  avatar_color_bg_top,
  avatar_color_bg_bottom,
  phone,
  street_address,
  apt_unit,
  city,
  us_state,
  zip_code,
  notes,
) => {
  console.log("Starting updateAdminEditedUser...");
  const client = await pool.connect();

  try {
    console.log("Beginning transaction...");
    await client.query("BEGIN");

    // Hash password only if a new password is provided
    let password_hash = null;
    if (password) {
      password_hash = await bcrypt.hash(password, 12);
      console.log("Password hashed successfully");
    }

    // Update users table
    console.log("Updating users table with sanitized values...", {
      first_name,
      last_name,
      email,
      birthdate,
      permission_status,
      verified_by_admin,
      guest_upgrade_invite,
      invite_decision,
      is_active,
    });

    const userRes = await client.query(
      `UPDATE users
        SET
          first_name            = COALESCE($1, first_name),
          last_name             = COALESCE($2, last_name),
          email                 = COALESCE($3, email),
          birthdate             = COALESCE($4, birthdate),
          password_hash         = COALESCE($5, password_hash),
          permission_status     = COALESCE($6, permission_status),
          verified_by_admin     = COALESCE($7, verified_by_admin),
          guest_upgrade_invite  = COALESCE($8, guest_upgrade_invite),
          invite_decision       = COALESCE($9, invite_decision),
          is_active             = COALESCE($10, is_active)
        WHERE id = $11
        RETURNING *;`,
      [
        first_name,
        last_name,
        email,
        birthdate,
        password_hash, // Only hashed if provided
        permission_status,
        verified_by_admin, // boolean
        guest_upgrade_invite, // boolean
        invite_decision,
        is_active, // boolean
        user_id,
      ],
    );

    const user = userRes.rows[0];

    console.log("Users table updated successfully:", user);

    // Update user_profiles table
    console.log("Updating user_profiles table with sanitized values...", {
      user_id: user.id,
      avatar_type,
      avatar_color_fg,
      avatar_color_bg_top,
      avatar_color_bg_bottom,
      phone,
      street_address,
      apt_unit,
      city,
      us_state,
      zip_code,
      notes,
    });

    // Update user_profiles table
    await client.query(
      `UPDATE user_profiles
       SET
         avatar_type            = COALESCE($1, avatar_type),
         avatar_color_fg        = COALESCE($2, avatar_color_fg),
         avatar_color_bg_top    = COALESCE($3, avatar_color_bg_top),
         avatar_color_bg_bottom = COALESCE($4, avatar_color_bg_bottom),
         phone                  = COALESCE($5, phone),
         street_address         = COALESCE($6, street_address),
         apt_unit               = COALESCE($7, apt_unit),
         city                   = COALESCE($8, city),
         us_state               = COALESCE($9, us_state),
         zip_code               = COALESCE($10, zip_code),
         notes                  = COALESCE($11, notes)
       WHERE user_id = $12;`,
      [
        avatar_type,
        avatar_color_fg,
        avatar_color_bg_top,
        avatar_color_bg_bottom,
        phone,
        street_address,
        apt_unit,
        city,
        us_state,
        zip_code,
        notes,
        user.id,
      ],
    );

    console.log("Committing transaction...");

    await client.query("COMMIT");

    console.log("updateAdminEditedUser completed successfully.");

    return user;
  } catch (err) {
    console.error("Error in updateAdminEditedUser:", err);
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
    console.log("Database client released.");
  }
};

// QUERY: UPDATE OF A USER BY A USER (your-profile.ejs/edit-profile.ejs modal)

const updateUser = async (
  user_id,
  first_name,
  last_name,
  email,
  birthdate,
  password, // raw password from form; may be empty
  phone,
  street_address,
  apt_unit,
  city,
  us_state,
  zip_code,
) => {
  console.log("Starting updateUser...");
  const client = await pool.connect();

  try {
    console.log("Beginning transaction...");
    await client.query("BEGIN");

    // Hash password only if a new password is provided
    let password_hash = null;
    if (password) {
      password_hash = await bcrypt.hash(password, 12);
      console.log("Password hashed successfully");
    }

    // Update users table
    console.log("Updating users table with sanitized values...", {
      first_name,
      last_name,
      email,
      birthdate,
    });

    const userRes = await client.query(
      `UPDATE users
        SET
          first_name        = COALESCE($1, first_name),
          last_name         = COALESCE($2, last_name),
          email             = COALESCE($3, email),
          birthdate         = COALESCE($4, birthdate),
          password_hash     = COALESCE($5, password_hash)
        WHERE id = $6
        RETURNING *;`,
      [
        first_name,
        last_name,
        email,
        birthdate,
        password_hash, // Only hashed if provided
        user_id,
      ],
    );

    const currentUser = userRes.rows[0];

    console.log("Users table updated successfully:", currentUser);

    // Update user_profiles table
    console.log("Updating user_profiles table with sanitized values...", {
      user_id: currentUser.id,
      phone,
      street_address,
      apt_unit,
      city,
      us_state,
      zip_code,
    });

    // Update user_profiles table
    await client.query(
      `UPDATE user_profiles
       SET
         phone                  = COALESCE($1, phone),
         street_address         = COALESCE($2, street_address),
         apt_unit               = COALESCE($3, apt_unit),
         city                   = COALESCE($4, city),
         us_state               = COALESCE($5, us_state),
         zip_code               = COALESCE($6, zip_code)
       WHERE user_id = $7;`,
      [
        phone,
        street_address,
        apt_unit,
        city,
        us_state,
        zip_code,
        currentUser.id,
      ],
    );

    console.log("Committing transaction...");

    await client.query("COMMIT");

    console.log("updateUser completed successfully.");

    return currentUser;
  } catch (err) {
    console.error("Error in updateUser:", err);
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
    console.log("Database client released.");
  }
};

// QUERY: UPDATE OF A USER'S AVATAR BY A USER (your-profile.ejs/change-avatar.ejs modal)

// Only updating one table. Only use transactions when updating multiple tables.
const updateUserAvatar = async (
  user_id,
  avatar_type,
  avatar_color_fg,
  avatar_color_bg_top,
  avatar_color_bg_bottom,
) => {
  console.log("Starting updateUserAvatar...");
  const client = await pool.connect();

  try {
    console.log("Beginning transaction...");
    await client.query("BEGIN");

    console.log("Updating user_profiles avatar...", {
      avatar_type,
      avatar_color_fg,
      avatar_color_bg_top,
      avatar_color_bg_bottom,
    });

    const userRes = await client.query(
      `UPDATE user_profiles
        SET
          avatar_type            = COALESCE($1, avatar_type),
          avatar_color_fg        = COALESCE($2, avatar_color_fg),
          avatar_color_bg_top    = COALESCE($3, avatar_color_bg_top),
          avatar_color_bg_bottom = COALESCE($4, avatar_color_bg_bottom)
        WHERE user_id = $5
        RETURNING *;`,
      [
        avatar_type,
        avatar_color_fg,
        avatar_color_bg_top,
        avatar_color_bg_bottom,
        user_id,
      ],
    );

    const currentUser = userRes.rows[0];

    console.log("Avatar updated successfully:", currentUser);

    await client.query("COMMIT");

    return currentUser;
  } catch (err) {
    console.error("Error in updateUserAvatar:", err);
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
    console.log("Database client released.");
  }
};

// QUERY: DELETE VIA USER (your-profile.ejs) OR DELETE VIA ADMIN (admin.ejs)

const deleteUserById = async (targetId) => {
  await pool.query("DELETE FROM users WHERE id = $1", [targetId]);
};

// NEW --- QUERY: CHECK PERMISSION STATUS AND GET TOPICS
//async function getTopicBySlugWithPermission(slug, userPermission) {
//   const query = `
//     SELECT *
//     FROM topics
//     WHERE slug = $1
//     AND required_permission <= $2
//     AND is_active = true
//   `;

//   const { rows } = await pool.query(query, [slug, userPermission]);
//   return rows[0] || null;
// }

// QUERY: GET TOPIC LIST FOR DROPDOWN IN NEW MESSAGE (new-message.ejs)

const getTopicNames = async () => {
  const { rows } = await pool.query(`
    SELECT id, name, required_permission
    FROM topics
    WHERE is_active = true
    ORDER BY sort_order;
  `);

  return rows;
};

// const getTopicName = async (topicId) => {
//   const { rows } = await pool.query(`
//     SELECT id, name
//     FROM topics
//     WHERE id = $1
//   `,
//   [topicId] // Pass the parameter here
// );
//   return rows[0];
// };

// QUERY: INSERT NEW MESSAGE TO MESSAGE BOARD TOPIC (new-message.ejs)

// const insertNewMessage = async (
//   user_id,
//   topic_id,
//   title,
//   body
// ) => {

//   const client = await pool.connect();

//   try {
//     await client.query("BEGIN");

//     const userRes = await client.query(
//       `INSERT INTO messages
//       (user_id, topic_id, title, body)
//       VALUES ($1,$2,$3,$4)
//       RETURNING *`,
//       [user_id, topic_id, title, body],
//     );

//     const currentUser = userRes.rows[0];

//     await client.query("COMMIT");

//     return currentUser;
//   } catch (err) {
//     await client.query("ROLLBACK");
//     throw err;
//   } finally {
//     client.release();
//   }
// };

const insertNewMessage = async (user_id, topic_id, title, body) => {
  const client = await pool.connect();

  try {
    const userRes = await client.query(
      `INSERT INTO messages (user_id, topic_id, title, body)
       VALUES ($1, $2, $3, $4)
       RETURNING id, user_id, topic_id, title, body, like_count, reply_count`,
      [user_id, topic_id, title, body],
    );

    return userRes.rows[0]; // Return the inserted message with all necessary fields
  } catch (err) {
    console.error("Error inserting new message:", err);
    throw err;
  } finally {
    client.release();
  }
};

// NOTE - NOT is_sticky (below) ---> this flips true and false
// NOTE - CASE updates expires_at depending on the previous value
const stickyMessageById = async (message_id) => {
  const client = await pool.connect();
  try {
    await client.query(
      `
      UPDATE messages
      SET 
        is_sticky = NOT is_sticky,
        expires_at = CASE 
          WHEN is_sticky = FALSE THEN NULL
          ELSE NOW() + INTERVAL '28 days'
        END
      WHERE id = $1;
      `,
      [message_id],
    );
  } catch (err) {
    console.error("Error toggling sticky message:", err);
    throw err;
  } finally {
    client.release();
  }
};

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

const getValidMessagesByTopic = async (messageId, userId, limit = 50) => {
  const query = `
    SELECT 
      m.id,
      m.topic_id,
      m.user_id,
      m.title,
      m.like_count,
      m.reply_count,
      m.body,
      m.created_at,
      m.expires_at,
      m.is_sticky,
      -- below is new
      ml.user_id AS is_liked_by_user_id,
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
    -- below is new
    LEFT JOIN message_likes ml 
      ON ml.message_id = m.id
      AND ml.user_id = $2
    WHERE m.topic_id = $1
      AND m.is_deleted = false
      AND (m.expires_at IS NULL OR m.expires_at > NOW())
    ORDER BY 
      m.is_sticky DESC,
      -- m.created_at DESC
      -- changed from above due to reordering when the like button was clicked
      m.id
    LIMIT $3;
  `;
  const res = await pool.query(query, [messageId, userId, limit]);
  return res.rows;
};

// QUERY: DELETE MESSAGE BY USER OR ADMIN VIA BUTTON (message-boards.ejs/by topic slug)

const softDeleteMessageById = async (targetId) => {
  const query = `
    UPDATE messages
    SET is_deleted = true,
        deleted_at = NOW()
    WHERE id = $1
      AND is_deleted = false;
  `;
  const res = await pool.query(query, [targetId]);
  return res.rowCount; // number of rows updated
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
 * @param targetId: ID of the user
 * @param limit: number of messages to return
 */
// const getMessagesByUser = async (targetId, limit = 50) => {
//   const query = `
//     SELECT id, topic_id, title, body, created_at, expires_at
//     FROM messages
//     WHERE user_id = $1
//       AND is_deleted = false
//       AND (expires_at IS NULL OR expires_at > NOW())
//     ORDER BY created_at DESC
//     LIMIT $2;
//   `;
//   const res = await pool.query(query, [targetId, limit]);
//   return res.rows;
// };

/**
 * Fetch messages by a specific topic
 * @param topicId: ID of the topic
 * @param limit: number of messages to return
 */
const getMessagesByTopic = async (targetId, limit = 50) => {
  const query = `
    SELECT id, user_id, title, body, created_at, expires_at
    FROM messages
    WHERE topic_id = $1
      AND is_deleted = false
      AND (expires_at IS NULL OR expires_at > NOW())
    ORDER BY created_at DESC
    LIMIT $2;
  `;
  const res = await pool.query(query, [targetId, limit]);
  return res.rows;
};

// QUERY: BECOME A MEMBER (Note the pattern difference with RETURNING and with const { rows } etc.)
// const becomeMemberById = async (targetId) => {
//   const id = parseInt(targetId, 10);
//   if (isNaN(id)) throw new Error("Invalid user ID");

//   const query = `
//     UPDATE users
//     SET member_request = true
//     WHERE permission_status = 'guest'
//       AND member_request = false
//       AND id = $1
//   `;

//   const res = await pool.query(query, [id]);
//   return res.rowCount > 0; // true if a row was updated
// };

// const becomeMemberById = async (targetId) => {
//   const query = `
//     UPDATE users AS u
//     SET member_request = true
//     WHERE u.permission_status = 'guest'
//       AND u.member_request = false
//       AND u.id = $1
//     RETURNING id, member_request;
//   `;
//   const { rows } = await pool.query(query, [targetId]);

//   if (!rows[0]) return false; // nothing updated
//   return true; // updated successfully
// };

// const toggleLike = async (messageId, userId) => {
//   const { rows } = await pool.query(
//     `
//     -- Remove the like if it exists
//     DELETE FROM message_likes 
//     WHERE message_id = $1 AND user_id = $2;

//     -- Insert the like if it does not exist (based on the result of DELETE)
//     INSERT INTO message_likes (message_id, user_id)
//     SELECT $1, $2
//     WHERE NOT EXISTS (
//       SELECT 1 FROM message_likes WHERE message_id = $1 AND user_id = $2
//     );

//     -- Update the like_count in the messages table
//     UPDATE messages
//     SET like_count = (SELECT COUNT(*) FROM message_likes WHERE message_id = $1)
//     WHERE id = $1
//     RETURNING like_count;
//   `,
//     [messageId, userId],
//   );

//   return rows[0]; // Return updated like count
// };

// const toggleLike = async (messageId, userId) => {
//   const client = await pool.connect(); // Get a client from the pool
//   try {
//     await client.query('BEGIN'); // Start a transaction

//     // Step 1: Try to delete the like if it exists
//     const deleteResult = await client.query(`
//       DELETE FROM message_likes 
//       WHERE message_id = $1 AND user_id = $2
//       RETURNING *;
//     `, [messageId, userId]);

//     // Step 2: Insert a new like if it wasn't deleted (i.e., the user hasn't liked the message before)
//     if (deleteResult.rowCount === 0) {
//       await client.query(`
//         INSERT INTO message_likes (message_id, user_id)
//         VALUES ($1, $2);
//       `, [messageId, userId]);
//     }

//     // Step 3: Update the like_count in the messages table
//     const likeCountResult = await client.query(`
//       UPDATE messages
//       SET like_count = (SELECT COUNT(*) FROM message_likes WHERE message_id = $1)
//       WHERE id = $1
//       RETURNING like_count;
//     `, [messageId]);

//     // Commit the transaction
//     await client.query('COMMIT');

//     // Return the updated like count
//     return likeCountResult.rows[0];
//   } catch (err) {
//     // If any error happens, roll back the transaction
//     await client.query('ROLLBACK');
//     console.error('Error toggling like:', err);
//     throw err; // rethrow the error to handle it in the controller
//   } finally {
//     client.release(); // Release the client back to the pool
//   }
// };

const toggleLike = async (messageId, userId) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN"); // Start a transaction

    // Check if the user has already liked the message
    const { rows: likeRows } = await client.query(
      `
      SELECT * FROM message_likes
      WHERE message_id = $1 AND user_id = $2;
    `,
      [messageId, userId],
    );

    if (likeRows.length > 0) {
      // User has already liked the message, so remove the like (delete)
      await client.query(
        `
        DELETE FROM message_likes
        WHERE message_id = $1 AND user_id = $2;
      `,
        [messageId, userId],
      );
    } else {
      // User hasn't liked the message, so insert a new like
      await client.query(
        `
        INSERT INTO message_likes (message_id, user_id)
        VALUES ($1, $2);
      `,
        [messageId, userId],
      );
    }

    // Update the like_count in the messages table
    await client.query(
      `
      UPDATE messages
      SET like_count = (SELECT COUNT(*) FROM message_likes WHERE message_id = $1)
      WHERE id = $1;
    `,
      [messageId],
    );

    await client.query("COMMIT"); // Commit the transaction
  } catch (err) {
    await client.query("ROLLBACK"); // Rollback on error
    console.error("Error toggling like:", err);
    throw err;
  } finally {
    client.release(); // Release the client
  }
};

// const toggleLike = async (messageId, userId) => {
//   const client = await pool.connect(); // Get a client from the pool
//   try {
//     await client.query("BEGIN"); // Start a transaction

//     // Check if the user already likes the message
//     const checkLikeResult = await client.query(
//       `
//       SELECT user_id
//       FROM message_likes
//       WHERE message_id = $1 AND user_id = $2
//     `,
//       [messageId, userId],
//     );

//     let likeCountResult;

//     if (checkLikeResult.rowCount > 0) {
//       // User already liked the message, so delete the like
//       await client.query(
//         `
//         DELETE FROM message_likes 
//         WHERE message_id = $1 AND user_id = $2
//       `,
//         [messageId, userId],
//       );

//       // Update the like count after deleting the like
//       likeCountResult = await client.query(
//         `
//         UPDATE messages
//         SET like_count = like_count - 1
//         WHERE id = $1
//         RETURNING like_count;
//       `,
//         [messageId],
//       );
//     } else {
//       // User has not liked the message, so insert the like
//       await client.query(
//         `
//         INSERT INTO message_likes (message_id, user_id)
//         VALUES ($1, $2);
//       `,
//         [messageId, userId],
//       );

//       // Update the like count after inserting the like
//       likeCountResult = await client.query(
//         `
//         UPDATE messages
//         SET like_count = like_count + 1
//         WHERE id = $1
//         RETURNING like_count;
//       `,
//         [messageId],
//       );
//     }

//     // Commit the transaction
//     await client.query("COMMIT");

//     // Return the updated like count
//     return likeCountResult.rows[0].like_count;
//   } catch (err) {
//     // If any error happens, roll back the transaction
//     await client.query("ROLLBACK");
//     console.error("Error toggling like:", err);
//     throw err; // Rethrow the error to be handled in the controller
//   } finally {
//     client.release(); // Release the client back to the pool
//   }
// };

// TODO - rename all of thes eby type, get, update, post, insert, find out the major types of queries!
module.exports = {
  getUsers,
  getUserById,
  getMessageById,
  getTopicById, 
  
  checkIfEmailExists,
  insertNewUser,
  insertAdminCreatedUser,
  updateAdminEditedUser,
  updateUser,
  updateUserAvatar,
  // getTopicBySlugWithPermission,
  getTopicNames,
  // getTopicNamesForPermission,
  // getTopicName,
  insertNewMessage,
  stickyMessageById,
  toggleLike,
  getAllTopics,
  getTopicBySlug, // TODO - keep getTopicBySlug, did this getTopicBySlugWithPermission usurp it?
  getValidMessagesByTopic,
  getMessagesByTopic,
  softDeleteExpiredMessages,
  hardDeleteMessages,
  cleanupMessages,
  deleteUserById,
  // deleteMessageById,
  softDeleteMessageById,
  // becomeMemberById,
};

