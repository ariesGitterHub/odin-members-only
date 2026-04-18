require("dotenv").config();

// if (process.env.NODE_ENV === "production") {
//   throw new Error("Refusing to run destructive DB scripts in production");
// }

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing");
}

const pool = require("../db/pool");

async function run() {
  const client = await pool.connect();

  try {
    console.log("Resetting database...");

    await client.query("BEGIN");

    await client.query(`
      DROP SCHEMA public CASCADE;
      CREATE SCHEMA public;
    `);

    await client.query("COMMIT");

    console.log("Database reset complete");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Reset failed:", err);
  } finally {
    client.release();
  }
}

run();
