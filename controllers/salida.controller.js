import pool from '../config/db.js'

export const createSalida = async (req, res) => {
  const client = await pool.connect()
  try {
    const { cliente, productos } = req.body

    await client.query('BEGIN')

    // 1️⃣ Crear venta
    const { rows } = await client.query(
      'INSERT INTO salidas (cliente) VALUES ($1) RETURNING id_salida',
      [cliente]
    )
    const id_salida = rows[0].id_salida

    // 2️⃣ Validar stock y registrar detalles
    for (let item of productos) {
      // Consultar stock actual
      const entradas = await client.query(
        'SELECT COALESCE(SUM(cantidad), 0) AS total FROM detalle_entrada WHERE id_producto = $1',
        [item.id_producto]
      )

      const salidas = await client.query(
        'SELECT COALESCE(SUM(cantidad), 0) AS total FROM detalle_salida WHERE id_producto = $1',
        [item.id_producto]
      )

      const totalEntradas = Number(entradas.rows[0].total)
      const totalSalidas = Number(salidas.rows[0].total)
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
      await client.query(
        `INSERT INTO detalle_salida (id_salida, id_producto, cantidad, precio_unitario)
         VALUES ($1, $2, $3, $4)`,
        [id_salida, item.id_producto, item.cantidad, item.precio_unitario]
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
