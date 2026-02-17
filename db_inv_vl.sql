-- =========================================
-- CREACIÓN DE BASE DE DATOS
-- =========================================
CREATE DATABASE inventario_ropa;

-- Conectarse a la base de datos antes de ejecutar lo siguiente
-- \c inventario_ropa;

-- =========================================
-- TABLA PRODUCTOS
-- =========================================
CREATE TABLE productos (
    id_producto SERIAL PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    descripcion VARCHAR(200) NOT NULL,
    categoria VARCHAR(50) DEFAULT 'General',
    precio_compra NUMERIC(10,2) NOT NULL,
    precio_venta NUMERIC(10,2) NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(20) DEFAULT 'activo'
);

-- Si la tabla ya existe, ejecutar:
-- ALTER TABLE productos ADD COLUMN IF NOT EXISTS categoria VARCHAR(50) DEFAULT 'General';

-- =========================================
-- TABLA ENTRADAS (COMPRAS)
-- =========================================
CREATE TABLE entradas (
    id_entrada SERIAL PRIMARY KEY,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    proveedor VARCHAR(150),
    total NUMERIC(12,2) DEFAULT 0
);


-- =========================================
-- TABLA DETALLE_ENTRADA
-- =========================================
CREATE TABLE detalle_entrada (
    id_detalle SERIAL PRIMARY KEY,
    id_entrada INTEGER REFERENCES entradas(id_entrada) ON DELETE CASCADE,
    id_producto INTEGER REFERENCES productos(id_producto),
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario NUMERIC(10,2) NOT NULL
);

-- =========================================
-- TABLA SALIDAS (VENTAS)
-- =========================================
CREATE TABLE salidas (
    id_salida SERIAL PRIMARY KEY,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cliente VARCHAR(150),
    total NUMERIC(12,2) DEFAULT 0
);

-- =========================================
-- TABLA DETALLE_SALIDA
-- =========================================
CREATE TABLE detalle_salida (
    id_detalle SERIAL PRIMARY KEY,
    id_salida INTEGER REFERENCES salidas(id_salida) ON DELETE CASCADE,
    id_producto INTEGER REFERENCES productos(id_producto),
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario NUMERIC(10,2) NOT NULL
);
-- =========================================
-- ACTUALIZAR DATOS EN ENTRADA
-- =========================================
CREATE VIEW stock_productos AS
SELECT 
    p.id_producto,
    p.codigo,
    p.descripcion,
    COALESCE(SUM(de.cantidad),0) -
    COALESCE(SUM(ds.cantidad),0) AS stock_actual
FROM productos p
LEFT JOIN detalle_entrada de ON p.id_producto = de.id_producto
LEFT JOIN detalle_salida ds ON p.id_producto = ds.id_producto
GROUP BY p.id_producto;