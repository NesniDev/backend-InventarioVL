import { pool } from '../config/db.js'

export const createEntrada = async (req, res) => {
  const client = await pool.connect()

  try {
    const { proveedor, productos } = req.body

    await client.query('BEGIN')

    const entradaResult = await client.query(
      'INSERT INTO entradas (proveedor) VALUES ($1) RETURNING *',
      [proveedor]
    )

    const idEntrada = entradaResult.rows[0].id_entrada

    for (let item of productos) {
      await client.query(
        `INSERT INTO detalle_entrada 
        (id_entrada, id_producto, cantidad, precio_unitario)
        VALUES ($1, $2, $3, $4)`,
        [idEntrada, item.id_producto, item.cantidad, item.precio_unitario]
      )
    }

    await client.query('COMMIT')

    res.status(201).json({ message: 'Entrada registrada correctamente' })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error(error)
    res.status(500).json({ error: 'Error al registrar entrada' })
  } finally {
    client.release()
  }
}
