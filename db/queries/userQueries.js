const pool = require("../pool");
const bcrypt = require("bcryptjs");

// QUERY: GET ALL USERS FOR ADMIN
const getUsersForAdmin = async () => {
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

// QUERY: GET ALL MEMBER USERS FOR MEMBER DIRECTORY
const getUsersForMemberDirectory = async () => {
  const { rows } = await pool.query(`
    SELECT
      u.id,
      u.email,
      u.first_name,
      u.last_name,
      u.birthdate,
      u.permission_status,
      up.avatar_type,
      up.avatar_color_fg,
      up.avatar_color_bg_top,
      up.avatar_color_bg_bottom,
      up.phone,
      up.street_address,
      up.apt_unit,
      up.city,
      up.us_state,
      up.zip_code
    FROM users u
    LEFT JOIN user_profiles up ON u.id = up.user_id
    WHERE u.permission_status IN ('member', 'admin')
    ORDER BY
      u.last_name,
      u.first_name;
  `);

  return rows;
};

// QUERY: GET USER FOR MEMBER INVITE
const getUserForMemberInvite = async (userId) => {
  const { rows } = await pool.query(
    `
    SELECT
      u.id,
      u.email,
      u.first_name,
      u.last_name,
      u.permission_status,
      u.verified_by_admin,
      u.guest_upgrade_invite,
      u.invite_decision,
      up.phone,
      up.street_address,
      up.apt_unit,
      up.city,
      up.us_state,
      up.zip_code
    FROM users u
    LEFT JOIN user_profiles up ON u.id = up.user_id     
    WHERE u.id = $1
  `,
    [userId],
  );

  return rows[0];
};

// QUERY: GET LIMITED USER DATA FOR MODALS
const getUserForModalData = async (userId) => {
  const { rows } = await pool.query(
    `
    SELECT
      u.id,
      u.email,
      up.avatar_type,
      up.avatar_color_fg,
      up.avatar_color_bg_top,
      up.avatar_color_bg_bottom
    FROM users u
    LEFT JOIN user_profiles up ON u.id = up.user_id     
    WHERE u.id = $1
  `,
    [userId],
  );

  return rows[0];
};

// QUERY: GET USER PROFILE DATA
const getUserProfileData = async (targetId) => {
  const { rows } = await pool.query(
    `
    SELECT
      u.id,
      u.email,
      u.first_name,
      u.last_name,
      u.birthdate,
      u.permission_status,
      up.avatar_type,
      up.avatar_color_fg,
      up.avatar_color_bg_top,
      up.avatar_color_bg_bottom,
      up.phone,
      up.street_address,
      up.apt_unit,
      up.city,
      up.us_state,
      up.zip_code
    FROM users u
    LEFT JOIN user_profiles up ON u.id = up.user_id
    WHERE u.id = $1
  `,
    [targetId],
  );

  return rows[0]; // Returning only the first row (one user)
};

// QUERY: GET USERS BY ID
const getUserByIdForAdmin = async (targetId) => {
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

// QUERY: INSERT SESSION INFO

// const insertSessionLog = async (
//   user_id,
//   session_token,
//   ip_address,
//   user_agent,
// ) => {
//   const query = `
//     INSERT INTO sessions (user_id, session_token, ip_address, user_agent)
//     VALUES ($1, $2, $3, $4)
//   `;
//   try {
//     await pool.query(query, [user_id, session_token, ip_address, user_agent]);
//   } catch (err) {
//     console.error("Failed to create session log:", err);
//     throw err;
//   }
// };

// NOTE - when refactoring to get dev to work with prod host, I forgot to change this query to line up with the schema.sql code dealing with the session table. Fix:

async function insertSessionLog(userId, sid, ip, userAgent) {
  const client = await pool.connect();
  try {
    await client.query(
      `INSERT INTO sessions (sid, sess, expire)
       VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
      [
        sid,
        JSON.stringify({
          user_id: userId,
          ip,
          user_agent: userAgent,
        }),
      ],
    );
  } finally {
    client.release();
  }
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
const insertAdminCreatedUser = async (
  first_name,
  last_name,
  email,
  birthdate,
  password_hash,
  notes = "Admin created user.",
) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const userRes = await client.query(
      `INSERT INTO users
       -- (first_name, last_name, email, birthdate, password_hash, permission_status)
       (first_name, last_name, email, birthdate, password_hash)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING *`,
      [first_name, last_name, email, birthdate, password_hash],
    );

    const user = userRes.rows[0];

    const avatar_type = first_name.charAt(0).toUpperCase();

    await client.query(
      `INSERT INTO user_profiles (user_id, avatar_type, notes)
       VALUES ($1,$2,$3)`,
      [user.id, avatar_type, notes],
    );

    await client.query("COMMIT");

    return user;
  } catch (err) {
    console.error("Error in insertAdminCreatedUser:", err);
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
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
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Hash password only if a new password is provided
    let password_hash = null;
    if (password) {
      password_hash = await bcrypt.hash(password, 12);
    }

    // Update users table
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
          is_active             = COALESCE($10, is_active),
          updated_at = CASE
            WHEN $1 IS NOT NULL OR $2 IS NOT NULL OR $3 IS NOT NULL OR $4 IS NOT NULL OR $5 IS NOT NULL OR $6 IS NOT NULL OR $7 IS NOT NULL OR $8 IS NOT NULL OR $9 IS NOT NULL OR $10 IS NOT NULL
            THEN CURRENT_TIMESTAMP
            ELSE updated_at
          END
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

    await client.query("COMMIT");

    return user;
  } catch (err) {
    console.error("Error in updateAdminEditedUser:", err);
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

// QUERY: UPDATE OF USER PROFILE INFO (NOT ADMIN RELATED DATA) BY A USER (your-profile.ejs/edit-profile.ejs modal)
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
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Hash password only if a new password is provided
    let password_hash = null;
    if (password) {
      password_hash = await bcrypt.hash(password, 12);
    }

    // Update users table
    const userRes = await client.query(
      `UPDATE users
        SET
          first_name        = COALESCE($1, first_name),
          last_name         = COALESCE($2, last_name),
          email             = COALESCE($3, email),
          birthdate         = COALESCE($4, birthdate),
          password_hash     = COALESCE($5, password_hash),
          updated_at = CASE
            WHEN $1 IS NOT NULL OR $2 IS NOT NULL OR $3 IS NOT NULL OR $4 IS NOT NULL OR $5 IS NOT NULL
            THEN CURRENT_TIMESTAMP
            ELSE updated_at
          END
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

    const user = userRes.rows[0];

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
      [phone, street_address, apt_unit, city, us_state, zip_code, user.id],
    );

    await client.query("COMMIT");

    return user;
  } catch (err) {
    console.error("Error in updateUser:", err);
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
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
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

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

    const user = userRes.rows[0];

    await client.query("COMMIT");

    return user;
  } catch (err) {
    console.error("Error in updateUserAvatar:", err);
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

// QUERY: UPDATE OF A USER FROM A GUEST TO A MEMBER (member-invite.ejs)
const updateUserToMember = async (
  user_id,
  permission_status,
  invite_decision,
  phone,
  street_address,
  apt_unit,
  city,
  us_state,
  zip_code,
) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Update users table
    const userRes = await client.query(
      `UPDATE users
        SET
        permission_status     = COALESCE($1, permission_status),
        invite_decision       = COALESCE($2, invite_decision),
        updated_at = CASE
          WHEN $1 IS NOT NULL OR $2 IS NOT NULL THEN CURRENT_TIMESTAMP
          ELSE updated_at
        END
      WHERE id = $3
      RETURNING *;`,
      [permission_status, invite_decision, user_id],
    );

    const user = userRes.rows[0];

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
      [phone, street_address, apt_unit, city, us_state, zip_code, user.id],
    );

    await client.query("COMMIT");

    return user;
  } catch (err) {
    console.error("Error in updateUser:", err);
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

// QUERY: DELETE USER ACCOUNT BY A USER (your-profile.ejs) OR DELETE USER ACCOUNT VIA ADMIN (admin.ejs)
const deleteUserById = async (targetId) => {
  await pool.query("DELETE FROM users WHERE id = $1", [targetId]);
};

//QUERY: CHECK IF EMAIL ALREADY EXISTS IN THE DB AT SIGN UP (PREVENTS USING CODE BELOW THAT DOES NOT WORK WELL WITH NEW USER SITUATIONS)
async function checkIfEmailExistsForSignUp(email) {
  const result = await pool.query(`SELECT id FROM users WHERE email = $1`, [
    email,
  ]);

  return result.rows;
}

// QUERY: CHECK IF EMAIL ALREADY EXISTS IN THE DB (SET UP TO NOT AFFECT USER EDITS TO SAME ENTRY)
async function checkIfEmailExists(email, targetId) {
  const result = await pool.query(
    `SELECT id FROM users
     WHERE email = $1
     AND id != $2`,
    [email, targetId],
  );

  return result.rows;
}

//QUERY: UPDATE USER's LAST LOGIN
const updateLastLogin = async (userId) => {
  await pool.query("UPDATE users SET last_login_at = NOW() WHERE id = $1", [
    userId,
  ]);
};

module.exports = {
  getUsersForAdmin,
  getUsersForMemberDirectory,
  getUserForMemberInvite,
  getUserForModalData,
  getUserProfileData,
  getUserByIdForAdmin,
  insertSessionLog,
  insertNewUser,
  insertAdminCreatedUser,
  updateAdminEditedUser,
  updateUser,
  updateUserAvatar,
  updateUserToMember,
  deleteUserById,
  checkIfEmailExistsForSignUp,
  checkIfEmailExists,
  updateLastLogin,
};
