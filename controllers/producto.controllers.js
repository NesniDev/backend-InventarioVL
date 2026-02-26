import prisma from '../config/db.js'

// Obtener productos
export const getProductos = async (req, res) => {
  try {
    const productos = await prisma.producto.findMany({
      orderBy: { id_producto: 'desc' }
    })
    res.json(productos)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Error al obtener productos' })
  }
}

// Crear producto
export const createProducto = async (req, res) => {
  try {
    const { codigo, descripcion, categoria, precio_compra } = req.body

    const producto = await prisma.producto.create({
      data: {
        codigo,
        descripcion,
        categoria: categoria || 'General',
        precio_compra
      }
    })

    res.status(201).json(producto)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al crear producto' })
  }
}

// Actualizar producto
export const updateProducto = async (req, res) => {
  try {
    const { id } = req.params
    const { codigo, descripcion, categoria, precio_compra, estado } = req.body

    const producto = await prisma.producto.update({
      where: { id_producto: Number(id) },
      data: {
        codigo,
        descripcion,
        categoria: categoria || 'General',
        precio_compra,
        estado
      }
    })

    res.json(producto)
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Producto no encontrado' })
    }
    console.error(error)
    res.status(500).json({ error: 'Error al actualizar producto' })
  }
}

// Eliminar producto
export const deleteProducto = async (req, res) => {
  try {
    const { id } = req.params

    await prisma.producto.delete({
      where: { id_producto: Number(id) }
    })

    res.json({ message: 'Producto eliminado correctamente' })
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Producto no encontrado' })
    }
    console.error(error)
    res.status(500).json({ error: 'Error al eliminar producto' })
  }
}

// Eliminar producto forzadamente (elimina detalles asociados primero)
export const forceDeleteProducto = async (req, res) => {
  try {
    const { id } = req.params
    const idNum = Number(id)

    await prisma.$transaction(async (tx) => {
      // Eliminar detalles de entrada asociados
      await tx.detalleEntrada.deleteMany({
        where: { id_producto: idNum }
      })

      // Eliminar detalles de salida asociados
      await tx.detalleSalida.deleteMany({
        where: { id_producto: idNum }
      })

      // Eliminar el producto
      await tx.producto.delete({
        where: { id_producto: idNum }
      })
    })

    res.json({
      message: 'Producto y movimientos asociados eliminados correctamente'
    })
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Producto no encontrado' })
    }
    console.error(error)
    res.status(500).json({ error: 'Error al eliminar producto forzadamente' })
  }
}
