const fs = require("fs/promises");
const { Client } = require("pg");
const chalk = require("chalk");

if (process.env.NODE_ENV === "production") {
  console.error(chalk.red("🚨 Refusing to reset database in production!"));
  process.exit(1);
}

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
    console.log(chalk.red("⚠ Resetting database..."));

    const schema = await fs.readFile("db/schema.sql", "utf8");
    const indexes = await fs.readFile("db/indexes.sql", "utf8");
    const seed = await fs.readFile("db/seed.sql", "utf8");

    await client.query("BEGIN");

    console.log(chalk.gray("Dropping existing tables..."));
    await client.query(`
      DROP SCHEMA public CASCADE;
      CREATE SCHEMA public;
    `);

    console.log(chalk.blue("Applying schema..."));
    await client.query(schema);
    await client.query(indexes);

    console.log(chalk.yellow("Seeding data..."));
    await client.query(seed);

    await client.query("COMMIT");

    console.log(chalk.green("Database reset complete!"));
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(chalk.red("Reset failed:"), err);
  } finally {
    await client.end();
  }
}

run();
