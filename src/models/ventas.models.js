import db from '../config/db.js';
// ventas.models.js
export const obtenerVentas = async () => {
    const [rows] = await db.query(`
        SELECT 
            v.ID_Venta AS id_venta,
            v.Fecha AS fecha,
            v.Total AS total,
            v.Estatus AS estatus,
            v.MotivoCancelacion AS motivo_cancelacion,
            v.ID_Usuario AS id_trabajador, -- 1. CAMBIADO: Era ID_Trabajador
            CONCAT(u.nombre, ' ', u.aPaterno, ' ', u.aMaterno) AS trabajador,
            v.ID_MetodoPago AS id_metodo_pago,
            mp.Nombre AS metodo_pago
        FROM venta v
        INNER JOIN usuarios u ON u.idUsuario = v.ID_Usuario -- 2. CAMBIADO: Era v.ID_Trabajador
        INNER JOIN metodo_pago mp ON mp.ID_Metodo = v.ID_MetodoPago
        ORDER BY v.ID_Venta DESC
    `);

    return rows;
};

export const obtenerVentaPorId = async (id) => {
    const [ventas] = await db.query(`
    SELECT
      v.ID_Venta AS id_venta,
      v.Fecha AS fecha,
      v.Total AS total,
      v.Estatus AS estatus,
      v.MotivoCancelacion AS motivo_cancelacion,
      v.ID_Trabajador AS id_trabajador,
      CONCAT(u.nombre, ' ', u.aPaterno, ' ', u.aMaterno) AS trabajador,
      v.ID_MetodoPago AS id_metodo_pago,
      mp.Nombre AS metodo_pago
    FROM venta v
    INNER JOIN usuarios u ON u.idUsuario = v.ID_Trabajador
    INNER JOIN metodo_pago mp ON mp.ID_Metodo = v.ID_MetodoPago
    WHERE v.ID_Venta = ?
    LIMIT 1
  `, [id]);

    if (ventas.length === 0) return null;

    const venta = ventas[0];

    const [detalles] = await db.query(`
    SELECT
      dv.ID_DetalleVenta AS id_detalle,
      dv.ID_Producto AS id_producto,
      p.nombre AS nombre_producto,
      dv.Cantidad AS cantidad,
      dv.Precio_Unitario AS precio_unitario,
      (dv.Cantidad * dv.Precio_Unitario) AS subtotal
    FROM detalle_venta dv
    INNER JOIN productos p ON p.id_producto = dv.ID_Producto
    WHERE dv.ID_Venta = ?
    ORDER BY dv.ID_DetalleVenta ASC
  `, [id]);

    venta.detalles = detalles;
    return venta;
};

export const crearVenta = async ({ id_trabajador, id_metodo_pago, detalles, id_pago_mp }) => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Validar si el pago ya existe para evitar duplicados
        const [pagoExistente] = await connection.query(
            "SELECT ID_Venta FROM venta WHERE ID_Pago_MP = ?",
            [id_pago_mp]
        );

        if (pagoExistente.length > 0) {
            throw new Error(`El pago ${id_pago_mp} ya ha sido procesado.`);
        }

        // 2. Validar stock en inventario
        for (const item of detalles) {
            const [stockRows] = await connection.query(`
                SELECT stock_actual
                FROM inventario
                WHERE producto = ?
                FOR UPDATE
            `, [item.id_producto]);

            if (stockRows.length === 0) {
                throw new Error(`El producto con ID ${item.id_producto} no existe en inventario.`);
            }

            if (Number(stockRows[0].stock_actual) < Number(item.cantidad)) {
                throw new Error(`Stock insuficiente para el producto ${item.id_producto}.`);
            }
        }

        const fechaSistema = new Date().toISOString().split('T')[0];

        const [ventaResult] = await connection.query(`
            INSERT INTO venta (ID_Usuario, Fecha, Total, ID_MetodoPago, Estatus, ID_Pago_MP)
            VALUES (?, ?, 0, ?, 'activa', ?)
        `, [id_trabajador, fechaSistema, id_metodo_pago, id_pago_mp]);

        const idVenta = ventaResult.insertId;

        // 4. Insertar detalles y actualizar stock
        for (const item of detalles) {
            await connection.query(`
                INSERT INTO detalle_venta (ID_Venta, ID_Producto, Cantidad, Precio_Unitario)
                VALUES (?, ?, ?, ?)
            `, [idVenta, item.id_producto, item.cantidad, item.precio_unitario]);

            await connection.query(`
                UPDATE inventario 
                SET stock_actual = stock_actual - ? 
                WHERE producto = ?
            `, [item.cantidad, item.id_producto]);
        }

        await connection.commit();
        console.log(`Venta ${idVenta} registrada correctamente.`);
        return idVenta;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

export const editarVenta = async (id, { id_metodo_pago }) => {
    const [result] = await db.query(`
    UPDATE venta
    SET ID_MetodoPago = ?
    WHERE ID_Venta = ?
      AND Estatus <> 'cancelada'
  `, [id_metodo_pago, id]);

    return result.affectedRows;
};

export const cancelarVenta = async (id, motivo) => {
    const [result] = await db.query(`CALL sp_cancelar_venta(?, ?)`, [id, motivo]);
    return result;
};

export const obtenerMetodosPago = async () => {
    const [rows] = await db.query(`
    SELECT ID_Metodo AS id_metodo, Nombre AS nombre
    FROM metodo_pago
    ORDER BY Nombre ASC
  `);

    return rows;
};