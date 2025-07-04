import { Pool } from 'pg';
import type { QueryResult } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  user: process.env.PG_USER || 'db_user',
  host: process.env.PG_HOST || 'localhost',
  database: process.env.PG_DATABASE || 'supabase_db',
  password: process.env.PG_PASSWORD || '447447',
  port: parseInt(process.env.PG_PORT || '5432', 10),
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export async function query<T = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
  try {
    console.log('Executing query:', text, params);
    return await pool.query(text, params);
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

export default pool;