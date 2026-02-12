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
    console.log(chalk.blue("Applying schema..."));

    const schema = await fs.readFile("db/schema.sql", "utf8");
    const indexes = await fs.readFile("db/indexes.sql", "utf8");

    await client.query("BEGIN");
    await client.query(schema);
    await client.query(indexes);
    await client.query("COMMIT");

    console.log(chalk.green("Schema applied successfully!"));
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(chalk.red("Schema failed:"), err);
  } finally {
    await client.end();
  }
}

run();
