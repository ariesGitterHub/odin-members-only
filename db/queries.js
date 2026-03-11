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
      u.member_request,
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
      up.verified_by_admin,
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
const getUserById = async (userId) => {
  const { rows } = await pool.query(
    `
    SELECT
      u.id,
      u.email,
      u.first_name,
      u.last_name,
      u.birthdate,
      u.permission_status,
      u.member_request,
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
      up.verified_by_admin,
      COUNT(m.id) AS message_count
    FROM users u
    LEFT JOIN user_profiles up ON u.id = up.user_id
    LEFT JOIN messages m ON u.id = m.user_id AND m.is_deleted = false
    WHERE u.id = $1
    GROUP BY u.id, up.user_id
  `,
    [userId],
  );

  return rows[0]; // Returning only the first row (one user)
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

async function checkIfEmailExists(email, user_id) {
  const result = await pool.query(
    `SELECT id FROM users
     WHERE email = $1
     AND id != $2`,
    [email, user_id],
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
  permission_status = "guest",
  notes = "Admin created user."
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
      permission_status,
    });
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

// QUERY: UPDATE A USER VIA ADMIN (admin-edit.ejs)

// const updateAdminEditedUser = async (
//   user_id,
//   first_name,
//   last_name,
//   email,
//   birthdate,
//   password_hash,
//   permission_status,
//   member_request,
//   is_active,
//   avatar_type,
//   avatar_color_fg,
//   avatar_color_bg_top,
//   avatar_color_bg_bottom,
//   phone,
//   street_address,
//   apt_unit,
//   city,
//   us_state,
//   zip_code,
//   notes,
//   verified_by_admin
// ) => {
//   console.log("Starting updateAdminEditedUser...");
//   const client = await pool.connect();

//   try {
//     console.log("Beginning transaction...");
//     await client.query("BEGIN");

//     // Ensure sanitized values for empty strings become NULL for COALESCE
//     const sanitize = (v) => (v === "" ? null : v);

//     console.log("Updating users table:", {
//       first_name,
//       last_name,
//       email,
//       birthdate,
//       permission_status,
//       member_request,
//       is_active,
//     });

//     const userRes = await client.query(
//       `UPDATE users
//         SET
//           first_name = COALESCE($1, first_name),
//           last_name = COALESCE($2, last_name),
//           email = COALESCE($3, email),
//           birthdate = COALESCE($4, birthdate),
//           password_hash = COALESCE($5, password_hash),
//           permission_status = COALESCE($6, permission_status),
//           member_request = COALESCE($7, member_request),
//           is_active = COALESCE($8, is_active)
//         WHERE id = $9
//         RETURNING *;`,
//       [
//         sanitize(first_name),
//         sanitize(last_name),
//         sanitize(email),
//         sanitize(birthdate),
//         password_hash, 
//         permission_status, // ENUM (guest, member, or admin only from lowest to highest)
//         member_request, // boolean
//         is_active, // boolean
//         user_id,
//       ],
//     );

//     const user = userRes.rows[0];
//     console.log("Updating successfully:", user);

//     console.log("Updating user_profiles table:", {
//       user_id: user.id,
//       avatar_type,
//       avatar_color_fg,
//       avatar_color_bg_top,
//       avatar_color_bg_bottom,
//       phone,
//       street_address,
//       apt_unit,
//       city,
//       us_state,
//       zip_code,
//       notes,
//       verified_by_admin,
//     });
//     await client.query(
//       `UPDATE user_profiles
//           SET
//             avatar_type = $1,
//             avatar_color_fg = $2,
//             avatar_color_bg_top = $3,
//             avatar_color_bg_bottom = $4,
//             phone = $5,
//             street_address = $6,
//             apt_unit = $7,
//             city = $8,
//             us_state = $9,
//             zip_code = $10,
//             notes = $11,
//             verified_by_admin = $12
//           WHERE user_id = $13`,
//       [
//         sanitize(avatar_type),
//         sanitize(avatar_color_fg),
//         sanitize(avatar_color_bg_top),
//         sanitize(avatar_color_bg_bottom),
//         sanitize(phone),
//         sanitize(street_address),
//         sanitize(apt_unit),
//         sanitize(city),
//         sanitize(us_state),
//         sanitize(zip_code),
//         sanitize(notes),
//         verified_by_admin, // boolean
//         user.id,
//       ],
//     );

//     console.log("Committing transaction...");
//     await client.query("COMMIT");

//     console.log("updateAdminEditedUser completed successfully.");
//     return user;
//   } catch (err) {
//     console.error("Error in updateAdminEditedUser:", err);
//     await client.query("ROLLBACK");
//     throw err;
//   } finally {
//     client.release();
//     console.log("Database client released.");
//   }
// };

const updateAdminEditedUser = async (
  user_id,
  first_name,
  last_name,
  email,
  birthdate,
  password, // raw password from form; may be empty
  permission_status,
  member_request,
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
  verified_by_admin,
) => {
  console.log("Starting updateAdminEditedUser...");
  const client = await pool.connect();

  try {
    console.log("Beginning transaction...");
    await client.query("BEGIN");

    // Helper: convert empty strings to null so COALESCE works properly
    const sanitize = (v) => (v === "" ? null : v);

    // Hash password only if a new password is provided
    let password_hash = null;
    if (password) {
      password_hash = await bcrypt.hash(password, 12);
      console.log("Password hashed successfully");
    }

    // // Ensure safe defaults for ENUMs / booleans
    // const safePermission = permission_status || "guest";
    // const safeMemberRequest =
    //   member_request === undefined ? false : member_request;
    // const safeIsActive = is_active === undefined ? true : is_active; // default active

    // // Convert birthdate string to JS Date if provided
    // const safeBirthdate = birthdate ? new Date(birthdate) : null;

    // --- Update users table ---
    console.log("Updating users table with sanitized values...", {
      first_name,
      last_name,
      email,
      // safeBirthdate,
      // safePermission,
      // safeMemberRequest,
      // safeIsActive,
      birthdate,
      permission_status,
      member_request,
      is_active,
    });

    const userRes = await client.query(
      `UPDATE users
        SET
          first_name        = COALESCE($1, first_name),
          last_name         = COALESCE($2, last_name),
          email             = COALESCE($3, email),
          birthdate         = COALESCE($4, birthdate),
          password_hash     = COALESCE($5, password_hash),
          permission_status = COALESCE($6, permission_status),
          member_request    = COALESCE($7, member_request),
          is_active         = COALESCE($8, is_active)
        WHERE id = $9
        RETURNING *;`,
      [
        // sanitize(first_name),
        // sanitize(last_name),
        // sanitize(email),
        // safeBirthdate,
        // password_hash,
        // safePermission,
        // safeMemberRequest,
        // safeIsActive,
        // user_id,
        sanitize(first_name),
        sanitize(last_name),
        sanitize(email),
        birthdate || null, // Date object or null
        password_hash, // Only hashed if provided
        permission_status || "guest",
        member_request, // boolean
        is_active, // boolean
        user_id,
      ],
    );

    const user = userRes.rows[0];
    console.log("Users table updated successfully:", user);

    // --- Update user_profiles table ---
    // Optional: If row doesn't exist, you can switch to INSERT ... ON CONFLICT (upsert)
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
      verified_by_admin,
    });

    // await client.query(
    //   `UPDATE user_profiles
    //     SET
    //       avatar_type = $1,
    //       avatar_color_fg = $2,
    //       avatar_color_bg_top = $3,
    //       avatar_color_bg_bottom = $4,
    //       phone = $5,
    //       street_address = $6,
    //       apt_unit = $7,
    //       city = $8,
    //       us_state = $9,
    //       zip_code = $10,
    //       notes = $11,
    //       verified_by_admin = $12
    //     WHERE user_id = $13`,
    //   [
    //     sanitize(avatar_type),
    //     sanitize(avatar_color_fg),
    //     sanitize(avatar_color_bg_top),
    //     sanitize(avatar_color_bg_bottom),
    //     sanitize(phone),
    //     sanitize(street_address),
    //     sanitize(apt_unit),
    //     sanitize(city),
    //     sanitize(us_state),
    //     sanitize(zip_code),
    //     sanitize(notes),
    //     verified_by_admin, // Boolean
    //     user.id,
    //   ],
    // );

    // --- Commit transaction ---

    // --- Update user_profiles table ---
    await client.query(
      `UPDATE user_profiles
       SET
         avatar_type       = COALESCE($1, avatar_type),
         avatar_color_fg   = COALESCE($2, avatar_color_fg),
         avatar_color_bg_top = COALESCE($3, avatar_color_bg_top),
         avatar_color_bg_bottom = COALESCE($4, avatar_color_bg_bottom),
         phone             = COALESCE($5, phone),
         street_address    = COALESCE($6, street_address),
         apt_unit          = COALESCE($7, apt_unit),
         city              = COALESCE($8, city),
         us_state          = COALESCE($9, us_state),
         zip_code          = COALESCE($10, zip_code),
         notes             = COALESCE($11, notes),
         verified_by_admin = COALESCE($12, verified_by_admin)
       WHERE user_id = $13;`,
      [
        sanitize(avatar_type),
        sanitize(avatar_color_fg),
        sanitize(avatar_color_bg_top),
        sanitize(avatar_color_bg_bottom),
        sanitize(phone),
        sanitize(street_address),
        sanitize(apt_unit),
        sanitize(city),
        sanitize(us_state),
        sanitize(zip_code),
        sanitize(notes),
        verified_by_admin, // boolean from controller
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


// QUERY: DELETE VIA USER (your-profile.ejs) OR VIA ADMIN (admin.ejs)

const deleteUserById = async (id) => {
  await pool.query("DELETE FROM users WHERE id = $1", [id]);
};


// QUERY: GET TOPIC LIST FOR DROPDOWN IN NEW POST (new-post.ejs)

const getTopicNames = async () => {
  const { rows } = await pool.query(`
    SELECT id, name
    FROM topics
    WHERE is_active = true
    ORDER BY sort_order;
  `);

  return rows;
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

const getValidMessagesByTopic = async (topicId, limit = 50) => {
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
    WHERE m.topic_id = $1
      AND m.is_deleted = false
      AND (m.expires_at IS NULL OR m.expires_at > NOW())
    ORDER BY m.created_at DESC
    LIMIT $2;
  `;
  const res = await pool.query(query, [topicId, limit]);
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
// const getMessagesByUser = async (userId, limit = 50) => {
//   const query = `
//     SELECT id, topic_id, title, body, created_at, expires_at
//     FROM messages
//     WHERE user_id = $1
//       AND is_deleted = false
//       AND (expires_at IS NULL OR expires_at > NOW())
//     ORDER BY created_at DESC
//     LIMIT $2;
//   `;
//   const res = await pool.query(query, [userId, limit]);
//   return res.rows;
// };

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


module.exports = {
  getUsers,
  getUserById,
  checkIfEmailExists,
  insertNewUser,
  insertAdminCreatedUser,
  updateAdminEditedUser,
  getTopicNames,
  getAllTopics,
  getTopicBySlug,
  getValidMessagesByTopic,
  getMessagesByTopic,
  softDeleteExpiredMessages,
  hardDeleteMessages,
  cleanupMessages,
  deleteUserById,
};
