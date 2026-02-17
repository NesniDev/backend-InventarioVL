import { pool } from '../config/db.js'

export const getStock = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        p.id_producto,
        p.codigo,
        p.descripcion,
        p.categoria,
        p.precio_compra,
        COALESCE(SUM(de.cantidad),0) - COALESCE(SUM(ds.cantidad),0) AS stock_actual
      FROM productos p
      LEFT JOIN detalle_entrada de ON p.id_producto = de.id_producto
      LEFT JOIN detalle_salida ds ON p.id_producto = ds.id_producto
      GROUP BY p.id_producto
      ORDER BY p.id_producto DESC
    `)
    res.json(result.rows)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al obtener stock' })
  }
}
