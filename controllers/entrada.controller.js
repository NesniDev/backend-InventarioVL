import prisma from '../config/db.js'

export const createEntrada = async (req, res) => {
  try {
    const { proveedor, productos } = req.body

    await prisma.$transaction(async (tx) => {
      const entrada = await tx.entrada.create({
        data: {
          proveedor
        }
      })

      for (let item of productos) {
        await tx.detalleEntrada.create({
          data: {
            id_entrada: entrada.id_entrada,
            id_producto: item.id_producto,
            cantidad: item.cantidad,
            precio_unitario: item.precio_unitario
          }
        })
      }
    })

    res.status(201).json({ message: 'Entrada registrada correctamente' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al registrar entrada' })
  }
}
