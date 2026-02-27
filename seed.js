import 'dotenv/config'
import pg from 'pg'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const { Pool } = pg
const __dirname = dirname(fileURLToPath(import.meta.url))

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false
})

async function seed() {
  const client = await pool.connect()

  try {
    const raw = readFileSync(join(__dirname, 'mockup.json'), 'utf-8')
    const { items } = JSON.parse(raw)

    console.log(`📦 Cargando ${items.length} items del mockup...\n`)

    await client.query('BEGIN')

    // Limpiar tablas en orden (respetando FK)
    await client.query('DELETE FROM detalle_salida')
    await client.query('DELETE FROM detalle_entrada')
    await client.query('DELETE FROM salidas')
    await client.query('DELETE FROM entradas')
    await client.query('DELETE FROM productos')

    // Resetear secuencias
    await client.query("ALTER SEQUENCE productos_id_producto_seq RESTART WITH 1")
    await client.query("ALTER SEQUENCE entradas_id_entrada_seq RESTART WITH 1")
    await client.query("ALTER SEQUENCE detalle_entrada_id_detalle_seq RESTART WITH 1")

    // Crear una entrada general para el inventario inicial
    const { rows: entradaRows } = await client.query(
      "INSERT INTO entradas (proveedor) VALUES ('Inventario Inicial - Seed') RETURNING id_entrada"
    )
    const idEntrada = entradaRows[0].id_entrada

    let insertados = 0
    let saltados = 0

    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      const precio = item.precio_unitario

      // Saltar items sin precio
      if (precio === null || precio === undefined || precio <= 0) {
        console.log(`  ⏭  Saltado (sin precio): "${item.descripcion}"`)
        saltados++
        continue
      }

      const codigo = `PROD-${String(i + 1).padStart(4, '0')}`
      const descripcion = item.descripcion
      const cantidad = item.cantidad || 1

      // Insertar producto
      const { rows: prodRows } = await client.query(
        `INSERT INTO productos (codigo, descripcion, categoria, precio_compra, precio_venta)
         VALUES ($1, $2, 'General', $3, $4)
         RETURNING id_producto`,
        [codigo, descripcion, precio, precio]
      )
      const idProducto = prodRows[0].id_producto

      // Insertar detalle de entrada (stock inicial)
      await client.query(
        `INSERT INTO detalle_entrada (id_entrada, id_producto, cantidad, precio_unitario)
         VALUES ($1, $2, $3, $4)`,
        [idEntrada, idProducto, cantidad, precio]
      )

      insertados++
    }

    await client.query('COMMIT')

    console.log(`\n✅ Seed completado:`)
    console.log(`   - ${insertados} productos insertados`)
    console.log(`   - ${saltados} items saltados (sin precio)`)
    console.log(`   - 1 entrada creada con ${insertados} detalles`)
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('❌ Error en seed:', error.message)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

seed()
  .then(() => {
    console.log('\n🎉 Seed ejecutado exitosamente')
    process.exit(0)
  })
  .catch(() => {
    process.exit(1)
  })
