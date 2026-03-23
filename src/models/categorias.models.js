// importa el pool de conexiones
import db from '../config/db.js';

// Función para obtener todas las categorias activas
export const totalCategorias = async () => {

    const [rows] = await db.query(
        'SELECT * FROM categorias WHERE estatus = 1'
    );

    return rows;
};
// Funcion para obtener una categoria por su ID
export const buscarCategoriaById = async (id) => {

    const [rows] = await db.query(
        'SELECT * FROM categorias WHERE idCategoria = ?',
        [id]
    );
    return rows[0] || null;
};
// Función para crear una nueva categoria
export const crearCategoria = async (nombre, descripcion) => {

    const estatus = 1;

    const [result] = await db.query(
        'INSERT INTO categorias (nombre, descripcion, estatus) VALUES (?,?,?)',
        [nombre, descripcion, estatus]
    );
    return {
        id: result.insertId,
        nombre,
        descripcion,
        estatus
    };
};
// Función para actualizar una categoria
export const editarCategoria = async (id, nombre, descripcion) => {

    const [result] = await db.query(
        'UPDATE categorias SET nombre = ?, descripcion = ? WHERE idCategoria = ?',
        [nombre, descripcion, id]
    );

    return result.affectedRows;
};
// Función para eliminar una categoria (eliminado lógico)
export const eliminarCategoria = async (id) => {

    const [result] = await db.query(
        'UPDATE categorias SET estatus = 0 WHERE idCategoria = ?',
        [id]
    );

    return result.affectedRows;
};