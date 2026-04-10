// models/products.models.js
import db from '../config/db.js';

// Crear producto
export const crearProducto = async (nombre,estado = 'activo',categoria,precio,descripcion,imagen) => {
  
  try {
    const [result] = await db.query(
      `INSERT INTO productos 
       (nombre, estado, categoria, precio, descripcion, imagen) VALUES (?, ?, ?, ?, ?, ?)`,
      [nombre,estado,categoria,precio,descripcion,imagen]
    );

    return {
      id_producto: result.insertId,
      nombre,
      estado,
      categoria,
      precio,
      descripcion,
      imagen
    };
  } catch (error) {
    console.error('Error al crear producto en BD:', error);
    throw error;
  }
};

// Actualizar producto
export const actualizarProducto = async (id_producto,nombre,estado,categoria,precio,descripcion,imagen) => {
  try {
    const [result] = await db.query(
      `UPDATE productos 
       SET nombre = ?, estado = ?, categoria = ?, precio = ?, descripcion = ?, imagen = ? WHERE id_producto = ?`,
      [nombre,estado,categoria,precio,descripcion,imagen,id_producto]
    );

    if (result.affectedRows === 0) {
      throw new Error('Producto no encontrado');
    }

    return { message: 'Producto actualizado' };
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    throw error;
  }
};

export const obtenerProductos = async () => {
  try {
    const [rows] = await db.query(
      `SELECT productos.*, categorias.nombre AS nombre_categoria 
       FROM productos 
       INNER JOIN categorias ON productos.categoria = categorias.idCategoria 
       WHERE productos.estado = 'activo' 
       ORDER BY id_producto DESC`
    );
    
    // rows contiene un arreglo con todos los registros encontrados
    return rows;
  } catch (error) {
    console.error('Error al obtener los productos en BD:', error);
    throw error;
  }
};

export default {
  crearProducto,
  actualizarProducto,
  obtenerProductos
};