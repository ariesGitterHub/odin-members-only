// This separate file of seed.js from seed.sql was added late in the game to prevent hardcoding my admin password has, as prior it was hardcoded in seed.sql

// NOTE - use "node db/seed.js" to run this seed, continue to use npm run db:reset to independently run the seed.sql file!

require("dotenv").config(); // Load environment variables from .env file
// if (process.env.NODE_ENV !== "production") {
//   require("dotenv").config();
// }

const fs = require("fs");
const bcrypt = require("bcryptjs");
const pool = require("./pool"); // Import the existing pool from db/pool.js

// Function to seed the admin user and their profile
async function seedAdminUserAndProfile() {
  try {
    const adminFastPassword = process.env.ADMIN_FAST_PASSWORD; // Loaded from .env
    const adminFastPasswordHash = await bcrypt.hash(adminFastPassword, 12); 

    // Query to insert the admin user (safe to re-run, uses `ON CONFLICT`)
    const adminInsertQuery = `
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
      VALUES 
        ('admin@can.org', 
         '${adminFastPasswordHash}',  -- Dynamically injected password hash
         'Admin',
         '(CAN Board)',
         '1986-04-20',
         'admin',
         true,
         true,
         'accepted')
      ON CONFLICT (email) DO NOTHING;
    `;

    // Execute the admin insertion
    await pool.query(adminInsertQuery);
    console.log("Admin user seeded!");

    // Query to insert the admin profile (safe to re-run, uses `ON CONFLICT`)
    const profileInsertQuery = `
      INSERT INTO user_profiles (
        user_id,   
        avatar_type,
        avatar_color_fg,
        avatar_color_bg_top,
        avatar_color_bg_bottom
      )
      SELECT u.id, '👑', '#d5ac28', '#962727', '#4a355b'
      FROM users u
      WHERE u.email = 'admin@can.org'
      ON CONFLICT (user_id) DO NOTHING;
    `;

    // Execute the admin profile insertion
    await pool.query(profileInsertQuery);
    console.log("Admin profile seeded!");
  } catch (error) {
    console.error("Error seeding admin user and profile:", error);
  }
}

// Main function to run all the seeding steps
async function main() {
  await seedAdminUserAndProfile(); // Seed the admin user and profile first
}

main().catch((err) => {
  console.error("Seeding process failed:", err);
});
