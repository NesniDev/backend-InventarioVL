import express from 'express'
import { getStock } from '../controllers/stock.controller.js'
export const stockRoutes = express.Router()

stockRoutes.get('/', getStock)
