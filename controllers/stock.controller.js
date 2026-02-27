import pool from '../config/db.js'

export const getStock = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        p.id_producto,
        p.codigo,
        p.descripcion,
        p.categoria,
        p.precio_compra,
        (COALESCE(e.total, 0) - COALESCE(s.total, 0))::int AS stock_actual
      FROM productos p
      LEFT JOIN (
        SELECT id_producto, SUM(cantidad) AS total
        FROM detalle_entrada
        GROUP BY id_producto
      ) e ON p.id_producto = e.id_producto
      LEFT JOIN (
        SELECT id_producto, SUM(cantidad) AS total
        FROM detalle_salida
        GROUP BY id_producto
      ) s ON p.id_producto = s.id_producto
      ORDER BY p.id_producto DESC
    `)

    res.json(rows)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al obtener stock' })
  }
}
