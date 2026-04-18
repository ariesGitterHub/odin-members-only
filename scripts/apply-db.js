require("dotenv").config();
const fs = require("fs/promises");
const pool = require("../db/pool");

async function run() {
  const client = await pool.connect();

  try {
    console.log("Applying database schema...");

    const schema = await fs.readFile("db/schema.sql", "utf8");
    const indexes = await fs.readFile("db/indexes.sql", "utf8");
    const seed = await fs.readFile("db/seed.sql", "utf8"); // ✅ ADDED

    await client.query("BEGIN");

    console.log("Running schema...");
    await client.query(schema);

    console.log("Running indexes...");
    await client.query(indexes);

    console.log("Running seed.sql...");
    await client.query(seed); // ✅ NOW HANDLED HERE

    await client.query("COMMIT");

    console.log("Database applied successfully");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Apply failed:", err);
  } finally {
    client.release();
  }
}

run();
