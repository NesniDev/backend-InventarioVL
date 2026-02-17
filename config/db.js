import { Pool } from 'pg'

export const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'inventario_ropa',
  password: process.env.DB_PASSWORD || 'root',
  port: 5432
})
