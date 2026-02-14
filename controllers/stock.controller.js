import { pool } from '../config/db.js'

export const getStock = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM stock_productos ORDER BY id_producto DESC'
    )
    res.json(result.rows)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al obtener stock' })
  }
}
