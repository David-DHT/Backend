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

        const fechaCompra = fecha || new Date().toISOString().slice(0, 10);

        const totalCompra = detalles.reduce((suma, item) => {
            return suma + (Number(item.cantidad) * Number(item.precio));
        }, 0);

        const [resCompra] = await connection.query(
            'INSERT INTO compras (proveedor, fecha, total) VALUES (?, ?, ?)',
            [proveedor, fechaCompra, totalCompra]
        );

        const idCompraGenerada = resCompra.insertId;

        for (const item of detalles) {
            await connection.query(
                `INSERT INTO detalle_compras (compra, producto, cantidad, precio_unitario)
                 VALUES (?, ?, ?, ?)`,
                [
                    idCompraGenerada,
                    Number(item.id_producto),
                    Number(item.cantidad),
                    Number(item.precio)
                ]
            );

            const [inventarioExistente] = await connection.query(
                `SELECT id_inventario, stock_actual
                 FROM inventario
                 WHERE producto = ?`,
                [Number(item.id_producto)]
            );

            if (inventarioExistente.length > 0) {
                await connection.query(
                    `UPDATE inventario
                     SET stock_actual = stock_actual + ?
                     WHERE producto = ?`,
                    [Number(item.cantidad), Number(item.id_producto)]
                );
            } else {
                await connection.query(
                    `INSERT INTO inventario (producto, stock_actual)
                     VALUES (?, ?)`,
                    [Number(item.id_producto), Number(item.cantidad)]
                );
            }
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
            `SELECT id_inventario, stock_actual
             FROM inventario
             WHERE producto = ?`,
            [idProducto]
        );

        if (!rows.length) {
            throw new Error('No se encontró el producto en inventario.');
        }

        const stockActual = Number(rows[0].stock_actual);

        if (cantidad > stockActual) {
            throw new Error('La cantidad a descontar no puede ser mayor al stock actual.');
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