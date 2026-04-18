require("dotenv").config();

// if (process.env.NODE_ENV === "production") {
//   throw new Error("Refusing to run destructive DB scripts in production");
// }

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing");
}

const fs = require("fs/promises");
const pool = require("../db/pool");

async function run() {
  const client = await pool.connect();

  try {
    console.log("Applying database schema...");

    const schema = await fs.readFile("db/schema.sql", "utf8");
    const indexes = await fs.readFile("db/indexes.sql", "utf8");
    const seed = await fs.readFile("db/seed.sql", "utf8");

    await client.query("BEGIN");

    console.log("Running schema...");
    await client.query(schema);

    console.log("Running indexes...");
    await client.query(indexes);

    console.log("Running seed.sql...");
    await client.query(seed);

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
