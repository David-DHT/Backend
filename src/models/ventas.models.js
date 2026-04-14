import db from '../config/db.js';

export const obtenerVentas = async () => {
    const [rows] = await db.query(`
        SELECT 
            v.ID_Venta AS id_venta,
            v.Fecha AS fecha,
            v.Total AS total,
            v.Estatus AS estatus,
            v.MotivoCancelacion AS motivo_cancelacion,
            v.ID_Pago_MP AS id_pago_mp,
            v.ID_Usuario AS id_trabajador,
            CONCAT(u.nombre, ' ', u.aPaterno, ' ', u.aMaterno) AS trabajador,
            v.ID_MetodoPago AS id_metodo_pago,
            mp.Nombre AS metodo_pago
        FROM venta v
        INNER JOIN usuarios u
            ON u.idUsuario = v.ID_Usuario
        INNER JOIN metodo_pago mp
            ON mp.ID_Metodo = v.ID_MetodoPago
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
            v.ID_Pago_MP AS id_pago_mp,
            v.ID_Usuario AS id_trabajador,
            CONCAT(u.nombre, ' ', u.aPaterno, ' ', u.aMaterno) AS trabajador,
            v.ID_MetodoPago AS id_metodo_pago,
            mp.Nombre AS metodo_pago
        FROM venta v
        INNER JOIN usuarios u
            ON u.idUsuario = v.ID_Usuario
        INNER JOIN metodo_pago mp
            ON mp.ID_Metodo = v.ID_MetodoPago
        WHERE v.ID_Venta = ?
        LIMIT 1
    `, [id]);

    if (!ventas.length) return null;

    const venta = ventas[0];

    const [detalles] = await db.query(`
        SELECT
            dv.ID_DetalleVenta AS id_detalle,
            dv.ID_Producto AS id_producto,
            TRIM(p.nombre) AS nombre_producto,
            dv.Cantidad AS cantidad,
            dv.Precio_Unitario AS precio_unitario,
            (dv.Cantidad * dv.Precio_Unitario) AS subtotal
        FROM detalle_venta dv
        INNER JOIN productos p
            ON p.id_producto = dv.ID_Producto
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

        if (id_pago_mp) {
            const [pagoExistente] = await connection.query(`
                SELECT ID_Venta
                FROM venta
                WHERE ID_Pago_MP = ?
                LIMIT 1
            `, [id_pago_mp]);

            if (pagoExistente.length > 0) {
                throw new Error(`El pago ${id_pago_mp} ya ha sido procesado.`);
            }
        }

        for (const item of detalles) {
            const idProducto = Number(item.id_producto);
            const cantidad = Number(item.cantidad);

            if (!idProducto || !cantidad || cantidad <= 0) {
                throw new Error('Los productos enviados no son válidos.');
            }

            const [stockRows] = await connection.query(`
                SELECT stock_actual
                FROM inventario
                WHERE producto = ?
                FOR UPDATE
            `, [idProducto]);

            if (!stockRows.length) {
                throw new Error(`El producto con ID ${idProducto} no existe en inventario.`);
            }

            if (Number(stockRows[0].stock_actual) < cantidad) {
                throw new Error(`Stock insuficiente para el producto ${idProducto}.`);
            }
        }

        const fechaSistema = new Date().toISOString().split('T')[0];

        const [ventaResult] = await connection.query(`
            INSERT INTO venta (
                ID_Usuario,
                Fecha,
                Total,
                ID_MetodoPago,
                Estatus,
                MotivoCancelacion,
                ID_Pago_MP
            )
            VALUES (?, ?, 0, ?, 'activa', NULL, ?)
        `, [
            Number(id_trabajador),
            fechaSistema,
            Number(id_metodo_pago),
            id_pago_mp || ''
        ]);

        const idVenta = ventaResult.insertId;

        for (const item of detalles) {
            await connection.query(`
                INSERT INTO detalle_venta (
                    ID_Venta,
                    ID_Producto,
                    Cantidad,
                    Precio_Unitario
                )
                VALUES (?, ?, ?, ?)
            `, [
                Number(idVenta),
                Number(item.id_producto),
                Number(item.cantidad),
                Number(item.precio_unitario)
            ]);
        }

        await connection.commit();
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
    const [result] = await db.query(`
        CALL sp_cancelar_venta(?, ?)
    `, [id, motivo]);

    return result;
};

export const obtenerMetodosPago = async () => {
    const [rows] = await db.query(`
        SELECT
            ID_Metodo AS id_metodo,
            Nombre AS nombre
        FROM metodo_pago
        ORDER BY Nombre ASC
    `);

    return rows;
};

export const obtenerTopProductos = async () => {
    const [rows] = await db.query(`
        SELECT 
            p.id_producto,
            TRIM(p.nombre) AS nombre, 
            SUM(dv.Cantidad) AS cantidad
        FROM detalle_venta dv
        INNER JOIN venta v ON v.ID_Venta = dv.ID_Venta
        INNER JOIN productos p ON p.id_producto = dv.ID_Producto 
        WHERE v.Estatus != 'cancelada'
        GROUP BY p.id_producto, p.nombre
        ORDER BY cantidad DESC
        LIMIT 10
    `);
    
    return rows;
};