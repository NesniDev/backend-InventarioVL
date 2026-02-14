import express from 'express'
import { createEntrada } from '../controllers/entrada.controller.js'
export const entradaRouter = express.Router()

entradaRouter.post('/', createEntrada)
