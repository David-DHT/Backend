import db from '../config/db.js';

export const crearProducto = async (
  nombre,
  estado = 'activo',
  categoria,
  precio,
  descripcion,
  imagen
) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [result] = await connection.query(
      `INSERT INTO productos (nombre, estado, categoria, precio, descripcion, imagen)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nombre, estado, categoria, precio, descripcion, imagen]
    );

    const idProducto = result.insertId;

    await connection.query(
      `INSERT INTO inventario (producto, categoria, stock_actual)
       VALUES (?, ?, 0)`,
      [idProducto, categoria]
    );

    await connection.commit();

    return {
      id_producto: idProducto,
      nombre,
      estado,
      categoria,
      precio,
      descripcion,
      imagen
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const actualizarProducto = async (
  id_producto,
  nombre,
  estado,
  categoria,
  precio,
  descripcion,
  imagen
) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [result] = await connection.query(
      `UPDATE productos
       SET nombre = ?, estado = ?, categoria = ?, precio = ?, descripcion = ?, imagen = ?
       WHERE id_producto = ?`,
      [nombre, estado, categoria, precio, descripcion, imagen, id_producto]
    );

    if (result.affectedRows === 0) {
      throw new Error('Producto no encontrado');
    }

    await connection.query(
      `UPDATE inventario
       SET categoria = ?
       WHERE producto = ?`,
      [categoria, id_producto]
    );

    await connection.commit();

    return { message: 'Producto actualizado' };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const obtenerProductos = async () => {
  const [rows] = await db.query(
    `SELECT * FROM vista_productos_completos ORDER BY id_producto DESC`
  );
  return rows;
};

export const obtenerProductoPorId = async (id) => {
  const [rows] = await db.query(
    `SELECT * FROM vista_productos_completos WHERE id_producto = ?`,
    [id]
  );

  if (rows.length === 0) throw new Error('Producto no encontrado');

  return rows[0];
};

export const eliminarProducto = async (id) => {
  const [result] = await db.query(
    `UPDATE productos SET estado = 'inactivo' WHERE id_producto = ?`,
    [id]
  );

  if (result.affectedRows === 0) throw new Error('Producto no encontrado');

  return { message: 'Producto dado de baja (inactivado) correctamente' };
};

export default {
  crearProducto,
  actualizarProducto,
  obtenerProductos,
  obtenerProductoPorId,
  eliminarProducto
};