import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { router } from './routes/producto.routes.js'
import { stockRoutes } from './routes/stock.routes.js'
import { entradaRouter } from './routes/entrada.routes.js'
import { salidaRoutes } from './routes/salida.routes.js'

const app = express()
const PORT = process.env.PORT || 3000

const ACCEPTED_ORIGINS = [
  process.env.FRONTEND_URL,
  process.env.FRONTEND_URL_STAGING
]
  .filter(Boolean)
  .map((origin) => origin.replace(/\/+$/, ''))

const allowAllOrigins = ACCEPTED_ORIGINS.length === 0

const isLocalhostOrigin = (origin) => {
  return (
    /^https?:\/\/localhost:\d+$/.test(origin) ||
    /^https?:\/\/127\.0\.0\.1:\d+$/.test(origin)
  )
}

app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        allowAllOrigins ||
        ACCEPTED_ORIGINS.includes(origin) ||
        isLocalhostOrigin(origin)
      ) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    }
  })
)
app.use(express.json())

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/productos', router)
app.use('/api/stock', stockRoutes)
app.use('/api/entradas', entradaRouter)
app.use('/api/salidas', salidaRoutes)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(
    'Routes: /api/health, /api/productos, /api/stock, /api/entradas, /api/salidas'
  )
})

export default app
