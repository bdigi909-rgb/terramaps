import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const pool = new Pool({
  host: '127.0.0.1',
  port: 5433,
  database: 'cad_srm',
  user: 'postgres',
  password: 'postgres',
});

export const db = drizzle(pool, { schema });
export { schema };
