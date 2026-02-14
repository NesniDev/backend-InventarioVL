import express from 'express'
import { createSalida } from '../controllers/salida.controller.js'
export const salidaRoutes = express.Router()

salidaRoutes.post('/', createSalida)
