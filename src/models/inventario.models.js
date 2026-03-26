import db from '../config/db.js';

export const totalInventario = async () => {
    //Vista 3
    const [rows] = await db.query(`SELECT * FROM vista_inventario_completo ORDER BY stock_actual ASC`);
    return rows;
};

export const registrarCompra = async (proveedor, fecha, detalles) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        // 1. Calculamos el total 
        const totalCompra = detalles.reduce((suma, item) => suma + (item.cantidad * item.precio), 0);

        // 2. Insertamos la compra ya con el total calculado
        const [resCompra] = await connection.query('INSERT INTO compras (proveedor, fecha, total) VALUES (?, ?, ?)',
            [proveedor, fecha, totalCompra]
        );
        const idCompraGenerada = resCompra.insertId;
        // 3. El trigger de inventario actualizará el stock físico
        for (const item of detalles) {
            await connection.query('INSERT INTO detalle_compras (compra, producto, cantidad, precio_unitario) VALUES (?, ?, ?, ?)',
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