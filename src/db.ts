import { Pool } from "pg";
import { config } from "dotenv";
config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: 5432, // Default PostgreSQL port
});

export const query = (text: string, params?: any[]) => pool.query(text, params);
