import { Pool } from 'pg'

export const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'https://backend-eight-rose-88.vercel.app',
  database: process.env.DB_NAME || 'inventario_ropa',
  password: process.env.DB_PASSWORD || 'root',
  port: 5432
})
