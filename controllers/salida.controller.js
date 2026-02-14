import { pool } from '../config/db.js'

export const createSalida = async (req, res) => {
  const client = await pool.connect()

  try {
    const { cliente, productos } = req.body

    await client.query('BEGIN')

    // 1️⃣ Crear venta
    const salidaResult = await client.query(
      'INSERT INTO salidas (cliente) VALUES ($1) RETURNING *',
      [cliente]
    )

    const idSalida = salidaResult.rows[0].id_salida

    // 2️⃣ Validar stock y registrar detalles
    for (let item of productos) {
      // Consultar stock actual
      const stockResult = await client.query(
        'SELECT stock_actual FROM stock_productos WHERE id_producto = $1',
        [item.id_producto]
      )

      if (stockResult.rows.length === 0) {
        throw new Error('Producto no existe')
      }

      const stockActual = stockResult.rows[0].stock_actual

      if (stockActual < item.cantidad) {
        throw new Error(
          `Stock insuficiente para producto ID ${item.id_producto}`
        )
      }

      // Insertar detalle
      await client.query(
        `INSERT INTO detalle_salida
        (id_salida, id_producto, cantidad, precio_unitario)
        VALUES ($1, $2, $3, $4)`,
        [idSalida, item.id_producto, item.cantidad, item.precio_unitario]
      )
    }

    await client.query('COMMIT')

    res.status(201).json({ message: 'Venta registrada correctamente' })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error(error)
    res.status(400).json({ error: error.message })
  } finally {
    client.release()
  }
}
