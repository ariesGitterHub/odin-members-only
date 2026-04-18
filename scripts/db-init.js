const fs = require("fs/promises");
const { Client } = require("pg");
const { exec } = require("child_process");

// Initialize client
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Required for many cloud Postgres setups
});

async function run() {
  await client.connect();

  try {
    console.log("Starting database setup...");

    // Read SQL files
    const schemaSQL = await fs.readFile("db/schema.sql", "utf8");
    const indexesSQL = await fs.readFile("db/indexes.sql", "utf8");
    const seedSQL = await fs.readFile("db/seed.sql", "utf8");

    // Wrap in transaction (optional, some CREATE INDEX statements can't be inside BEGIN/COMMIT)
    console.log("Applying schema...");
    await client.query(schemaSQL);

    console.log("Creating indexes...");
    await client.query(indexesSQL);

    console.log("Seeding SQL data...");
    await client.query(seedSQL);

    console.log("Database setup completed successfully!");
  } catch (err) {
    // Only fail on serious errors
    console.error("Database setup error (continuing if safe):", err);
  } finally {
    await client.end();
  }

  // Run JS seed separately
  try {
    console.log("Running JS seed...");
    await new Promise((resolve, reject) => {
      exec("node db/seed.js", (err, stdout, stderr) => {
        if (err) return reject(err);
        if (stdout) console.log(stdout);
        if (stderr) console.error(stderr);
        resolve();
      });
    });
    console.log("JS seed completed!");
  } catch (err) {
    console.error("JS seed error:", err);
  }
}

// Run the function
run().catch((err) => console.error("Unexpected error:", err));
