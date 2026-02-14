import express from 'express'

import {
  getProductos,
  createProducto,
  updateProducto,
  deleteProducto,
  forceDeleteProducto
} from '../controllers/producto.controllers.js'

export const router = express.Router()

router.get('/', getProductos)
router.post('/', createProducto)
router.put('/:id', updateProducto)
router.delete('/:id', deleteProducto)
router.delete('/:id/force', forceDeleteProducto)
