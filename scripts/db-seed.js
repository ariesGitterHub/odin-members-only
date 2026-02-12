const fs = require("fs/promises");
const { Client } = require("pg");
const chalk = require("chalk");

async function run() {
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      user: process.env.PG_USER,
      password: process.env.PG_PASSWORD,
      host: process.env.PG_HOST,
      port: process.env.PG_PORT,
      database: process.env.PG_DATABASE,
    });

  await client.connect();

  try {
    console.log(chalk.yellow("Seeding database..."));

    const seed = await fs.readFile("db/seed.sql", "utf8");

    await client.query("BEGIN");
    await client.query(seed);
    await client.query("COMMIT");

    console.log(chalk.green("Seeding completed successfully!"));
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(chalk.red("Seeding failed:"), err);
  } finally {
    await client.end();
  }
}

run();
