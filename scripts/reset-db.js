require("dotenv").config();
const pool = require("../db/pool");

if (process.env.NODE_ENV === "production") {
  console.error("Refusing to reset production DB");
  process.exit(1);
}

async function run() {
  const client = await pool.connect();

  try {
    await client.query(`
      DROP SCHEMA public CASCADE;
      CREATE SCHEMA public;
    `);

    console.log("Database reset complete");
  } catch (err) {
    console.error(err);
  } finally {
    client.release();
  }
}

run();
