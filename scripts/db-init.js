const fs = require("fs/promises");
const pg = require("pg");

// Initialize client
const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
});

async function run() {
  await client.connect();

  try {
    // Read SQL files
    const schema = await fs.readFile("db/schema.sql", "utf8");
    const indexes = await fs.readFile("db/indexes.sql", "utf8");
    const seed = await fs.readFile("db/seed.sql", "utf8");

    console.log("Starting database setup...");

    // Wrap all queries in a transaction
    await client.query("BEGIN");

    console.log("Applying schema...");
    await client.query(schema);

    console.log("Creating indexes...");
    await client.query(indexes);

    console.log("Seeding data...");
    await client.query(seed);

    await client.query("COMMIT");
    console.log("Database setup completed successfully!");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Database setup failed:", err);
  } finally {
    await client.end();
  }
}

// Call the function once
run().catch((err) => console.error("Unexpected error:", err));
