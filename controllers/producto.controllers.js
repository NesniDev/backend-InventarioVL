import { pool } from '../config/db.js'

// Obtener productos
export const getProductos = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM productos ORDER BY id_producto DESC'
    )
    res.json(result.rows)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Error al obtener productos' })
  }
}

// Crear producto
export const createProducto = async (req, res) => {
  try {
    const { codigo, descripcion, categoria, precio_compra } = req.body

    const result = await pool.query(
      `INSERT INTO productos
       (codigo, descripcion, categoria, precio_compra)
       VALUES ($1,$2,$3,$4)
       RETURNING *`,
      [codigo, descripcion, categoria || 'General', precio_compra]
    )

    res.status(201).json(result.rows[0])
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

    const result = await pool.query(
      `UPDATE productos
       SET codigo=$1,
           descripcion=$2,
           categoria=$3,
           precio_compra=$4,
           estado=$5
       WHERE id_producto=$6
       RETURNING *`,
      [codigo, descripcion, categoria || 'General', precio_compra, estado, id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al actualizar producto' })
  }
}

// Eliminar producto
export const deleteProducto = async (req, res) => {
  try {
    const { id } = req.params

    const result = await pool.query(
      'DELETE FROM productos WHERE id_producto=$1 RETURNING *',
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' })
    }

    res.json({ message: 'Producto eliminado correctamente' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al eliminar producto' })
  }
}

// Eliminar producto forzadamente (elimina detalles asociados primero)
export const forceDeleteProducto = async (req, res) => {
  const client = await pool.connect()
  try {
    const { id } = req.params

    await client.query('BEGIN')

    // Eliminar detalles de entrada asociados
    await client.query('DELETE FROM detalle_entrada WHERE id_producto=$1', [id])

    // Eliminar detalles de salida asociados
    await client.query('DELETE FROM detalle_salida WHERE id_producto=$1', [id])

    // Eliminar el producto
    const result = await client.query(
      'DELETE FROM productos WHERE id_producto=$1 RETURNING *',
      [id]
    )

    if (result.rows.length === 0) {
      await client.query('ROLLBACK')
      return res.status(404).json({ error: 'Producto no encontrado' })
    }

    await client.query('COMMIT')
    res.json({
      message: 'Producto y movimientos asociados eliminados correctamente'
    })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error(error)
    res.status(500).json({ error: 'Error al eliminar producto forzadamente' })
  } finally {
    client.release()
  }
}
