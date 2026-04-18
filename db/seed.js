// This separate file of seed.js from seed.sql was added late in the game to prevent hardcoding my admin password has, as prior it was hardcoded in seed.sql

// NOTE - use "node db/seed.js" to run this seed, continue to use npm run db:reset to independently run the seed.sql file!

require("dotenv").config();

const bcrypt = require("bcryptjs");
const pool = require("./pool");

async function seedAdminUserAndProfile() {
  const client = await pool.connect();

  try {
    const adminPassword = process.env.ADMIN_FAST_PASSWORD;

    if (!adminPassword) {
      throw new Error(
        "ADMIN_FAST_PASSWORD is required in environment variables",
      );
    }

    const passwordHash = await bcrypt.hash(adminPassword, 12);

    await client.query("BEGIN");

    // Insert admin user safely (parameterized)
    const userResult = await client.query(
      `
      INSERT INTO users (
        email,
        password_hash,
        first_name,
        last_name,
        birthdate,
        permission_status,
        verified_by_admin,
        guest_upgrade_invite,
        invite_decision
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      ON CONFLICT (email) DO NOTHING
      RETURNING id;
      `,
      [
        "admin@can.org",
        passwordHash,
        "Admin",
        "(CAN Board)",
        "1986-04-20",
        "admin",
        true,
        true,
        "accepted",
      ],
    );

    // Get admin ID (handles ON CONFLICT case)
    const userId =
      userResult.rows[0]?.id ||
      (
        await client.query("SELECT id FROM users WHERE email = $1", [
          "admin@can.org",
        ])
      ).rows[0].id;

    // Insert profile safely
    await client.query(
      `
      INSERT INTO user_profiles (
        user_id,
        avatar_type,
        avatar_color_fg,
        avatar_color_bg_top,
        avatar_color_bg_bottom
      )
      VALUES ($1,$2,$3,$4,$5)
      ON CONFLICT (user_id) DO NOTHING;
      `,
      [userId, "👑", "#d5ac28", "#962727", "#4a355b"],
    );

    await client.query("COMMIT");

    console.log("Admin user + profile seeded successfully");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Seeding failed:", err);
  } finally {
    client.release();
  }
}

async function main() {
  await seedAdminUserAndProfile();
}

main().catch((err) => {
  console.error("Seeding process failed:", err);
});