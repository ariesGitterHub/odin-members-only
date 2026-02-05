require("dotenv").config();
const { Pool } = require("pg");

const isProd = process.env.NODE_ENV === "production";

let pool;

if (isProd) {
  // Production: use Neon DATABASE_URL
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }, // required for Neon
  });
} else {
  // Development: use local Postgres
  pool = new Pool({
    host: process.env.PG_HOST,
    user: process.env.PG_USER,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: Number(process.env.PG_PORT),
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });
}

module.exports = pool;
