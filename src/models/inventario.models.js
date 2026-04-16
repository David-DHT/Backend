import db from '../config/db.js';

export const totalInventario = async () => {
    const [rows] = await db.query(`
        SELECT * 
        FROM vista_inventario_completo
        ORDER BY stock_actual ASC
    `);
    return rows;
};

export const registrarCompra = async (proveedor, fecha, detalles) => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const totalCompra = detalles.reduce((suma, item) => {
            return suma + (item.cantidad * item.precio);
        }, 0);

        const [resCompra] = await connection.query(
            'INSERT INTO compras (proveedor, fecha, total) VALUES (?, ?, ?)',
            [proveedor, fecha, totalCompra]
        );

        const idCompraGenerada = resCompra.insertId;

        for (const item of detalles) {
            await connection.query(
                'INSERT INTO detalle_compras (compra, producto, cantidad, precio_unitario) VALUES (?, ?, ?, ?)',
                [idCompraGenerada, item.id_producto, item.cantidad, item.precio]
            );
        }

        await connection.commit();
        return idCompraGenerada;

    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

export const registrarSalidaInventario = async (idProducto, cantidad) => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const [rows] = await connection.query(
            `SELECT stock_actual
             FROM inventario
             WHERE producto = ?`,
            [idProducto]
        );

        if (!rows.length) {
            throw new Error('No se encontró el producto en inventario.');
        }

        const stockActual = Number(rows[0].stock_actual);

        if (cantidad > stockActual) {
            throw new Error('La cantidad a eliminar no puede ser mayor al stock actual.');
        }

        await connection.query(
            `UPDATE inventario
             SET stock_actual = stock_actual - ?
             WHERE producto = ?`,
            [cantidad, idProducto]
        );

        await connection.commit();
        return true;

    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};