-- CreateTable
CREATE TABLE "productos" (
    "id_producto" SERIAL NOT NULL,
    "codigo" VARCHAR(20) NOT NULL,
    "descripcion" VARCHAR(200) NOT NULL,
    "categoria" VARCHAR(50) DEFAULT 'General',
    "precio_compra" DECIMAL(10,2) NOT NULL,
    "precio_venta" DECIMAL(10,2) DEFAULT 0,
    "fecha_creacion" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" VARCHAR(20) DEFAULT 'activo',

    CONSTRAINT "productos_pkey" PRIMARY KEY ("id_producto")
);

-- CreateTable
CREATE TABLE "entradas" (
    "id_entrada" SERIAL NOT NULL,
    "fecha" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "proveedor" VARCHAR(150),
    "total" DECIMAL(12,2) DEFAULT 0,

    CONSTRAINT "entradas_pkey" PRIMARY KEY ("id_entrada")
);

-- CreateTable
CREATE TABLE "detalle_entrada" (
    "id_detalle" SERIAL NOT NULL,
    "id_entrada" INTEGER,
    "id_producto" INTEGER,
    "cantidad" INTEGER NOT NULL,
    "precio_unitario" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "detalle_entrada_pkey" PRIMARY KEY ("id_detalle")
);

-- CreateTable
CREATE TABLE "salidas" (
    "id_salida" SERIAL NOT NULL,
    "fecha" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cliente" VARCHAR(150),
    "total" DECIMAL(12,2) DEFAULT 0,

    CONSTRAINT "salidas_pkey" PRIMARY KEY ("id_salida")
);

-- CreateTable
CREATE TABLE "detalle_salida" (
    "id_detalle" SERIAL NOT NULL,
    "id_salida" INTEGER,
    "id_producto" INTEGER,
    "cantidad" INTEGER NOT NULL,
    "precio_unitario" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "detalle_salida_pkey" PRIMARY KEY ("id_detalle")
);

-- CreateIndex
CREATE UNIQUE INDEX "productos_codigo_key" ON "productos"("codigo");

-- AddForeignKey
ALTER TABLE "detalle_entrada"
ADD CONSTRAINT "detalle_entrada_id_entrada_fkey"
FOREIGN KEY ("id_entrada") REFERENCES "entradas"("id_entrada")
ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalle_entrada"
ADD CONSTRAINT "detalle_entrada_id_producto_fkey"
FOREIGN KEY ("id_producto") REFERENCES "productos"("id_producto")
ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalle_salida"
ADD CONSTRAINT "detalle_salida_id_salida_fkey"
FOREIGN KEY ("id_salida") REFERENCES "salidas"("id_salida")
ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalle_salida"
ADD CONSTRAINT "detalle_salida_id_producto_fkey"
FOREIGN KEY ("id_producto") REFERENCES "productos"("id_producto")
ON DELETE SET NULL ON UPDATE CASCADE;
