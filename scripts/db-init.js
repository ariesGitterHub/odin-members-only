const fs = require("fs/promises");
const { Client } = require("pg");
const { exec } = require("child_process");

// Initialize client
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Required for Railway
});

async function run() {
  await client.connect();

  try {
    console.log("Starting database setup...");

    // Read SQL files
    const schema = await fs.readFile("db/schema.sql", "utf8");
    const indexes = await fs.readFile("db/indexes.sql", "utf8");
    const seedSQL = await fs.readFile("db/seed.sql", "utf8");

    // Wrap all queries in a transaction
    await client.query("BEGIN");

    console.log("Applying schema...");
    await client.query(schema);

    console.log("Creating indexes...");
    await client.query(indexes);

    console.log("Seeding SQL data...");
    await client.query(seedSQL);

    await client.query("COMMIT");
    console.log("Database setup completed successfully!");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Database setup failed:", err);
    process.exit(1);
  } finally {
    await client.end();
  }

  // Run JS seed separately
  console.log("Running JS seed...");
  await new Promise((resolve, reject) => {
    exec("node db/seed.js", (err, stdout, stderr) => {
      if (err) return reject(err);
      console.log(stdout);
      console.error(stderr);
      resolve();
    });
  });
}

// Call the function once
run().catch((err) => console.error("Unexpected error:", err));
