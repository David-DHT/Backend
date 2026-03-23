// importa el pool de conexiones
import db from '../config/db.js';

// Función para obtener el stock actual con nombres de productos y categorías
export const totalInventario = async () => {
    const [rows] = await db.query(
        `SELECT i.id_inventario, p.nombre AS nombre_producto, a.nombre AS nombre_categoria, i.stock_actual
         FROM inventario i
         INNER JOIN productos p ON i.producto = p.id_producto
         INNER JOIN categorias a ON p.categoria = a.idCategoria
         ORDER BY i.stock_actual ASC`
    );
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