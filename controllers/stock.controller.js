import prisma from '../config/db.js'

export const getStock = async (req, res) => {
  try {
    const productos = await prisma.producto.findMany({
      orderBy: { id_producto: 'desc' },
      include: {
        detalle_entrada: { select: { cantidad: true } },
        detalle_salida: { select: { cantidad: true } }
      }
    })

    const stock = productos.map((p) => {
      const totalEntradas = p.detalle_entrada.reduce(
        (sum, d) => sum + d.cantidad,
        0
      )
      const totalSalidas = p.detalle_salida.reduce(
        (sum, d) => sum + d.cantidad,
        0
      )

      return {
        id_producto: p.id_producto,
        codigo: p.codigo,
        descripcion: p.descripcion,
        categoria: p.categoria,
        precio_compra: p.precio_compra,
        stock_actual: totalEntradas - totalSalidas
      }
    })

    res.json(stock)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al obtener stock' })
  }
}
