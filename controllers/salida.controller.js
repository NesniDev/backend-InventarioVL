import prisma from '../config/db.js'

export const createSalida = async (req, res) => {
  try {
    const { cliente, productos } = req.body

    await prisma.$transaction(async (tx) => {
      // 1️⃣ Crear venta
      const salida = await tx.salida.create({
        data: { cliente }
      })

      // 2️⃣ Validar stock y registrar detalles
      for (let item of productos) {
        // Consultar stock actual
        const entradas = await tx.detalleEntrada.aggregate({
          where: { id_producto: item.id_producto },
          _sum: { cantidad: true }
        })

        const salidas = await tx.detalleSalida.aggregate({
          where: { id_producto: item.id_producto },
          _sum: { cantidad: true }
        })

        const totalEntradas = entradas._sum.cantidad || 0
        const totalSalidas = salidas._sum.cantidad || 0
        const stockActual = totalEntradas - totalSalidas

        if (stockActual <= 0) {
          throw new Error('Producto no existe o sin stock')
        }

        if (stockActual < item.cantidad) {
          throw new Error(
            `Stock insuficiente para producto ID ${item.id_producto}`
          )
        }

        // Insertar detalle
        await tx.detalleSalida.create({
          data: {
            id_salida: salida.id_salida,
            id_producto: item.id_producto,
            cantidad: item.cantidad,
            precio_unitario: item.precio_unitario
          }
        })
      }
    })

    res.status(201).json({ message: 'Venta registrada correctamente' })
  } catch (error) {
    console.error(error)
    res.status(400).json({ error: error.message })
  }
}
