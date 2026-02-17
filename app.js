import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { pool } from './config/db.js'
import { router } from './routes/producto.routes.js'
import { stockRoutes } from './routes/stock.routes.js'
import { entradaRouter } from './routes/entrada.routes.js'
import { salidaRoutes } from './routes/salida.routes.js'

dotenv.config()
const app = express()
const PORT = process.env.PORT || 3000

const runMigrations = async () => {
  try {
    await pool.query(`
      ALTER TABLE productos
      ADD COLUMN IF NOT EXISTS categoria VARCHAR(50) DEFAULT 'General'
    `)
    await pool.query(`
      ALTER TABLE productos
      ALTER COLUMN precio_venta SET DEFAULT 0,
      ALTER COLUMN precio_venta DROP NOT NULL
    `)
    console.log('Migraciones ejecutadas correctamente')
  } catch (err) {
    console.error('Error ejecutando migraciones:', err.message)
  }
}

const ACCEPTED_ORIGINS = ['http://localhost:5173']

app.use(
  cors({
    origin: (origin, callback) => {
      if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    }
  })
)
app.use(express.json())

app.use('/api/productos', router)
app.use('/api/stock', stockRoutes)
app.use('/api/entradas', entradaRouter)
app.use('/api/salidas', salidaRoutes)

if (process.env.NODE_ENV !== 'production') {
  runMigrations().then(() => {
    app.listen(PORT, () => {
      console.log(`Port is runnig ${PORT}`)
    })
  })
}

export default app
