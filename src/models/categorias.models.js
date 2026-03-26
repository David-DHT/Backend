import db from '../config/db.js';

export const totalCategorias = async () => {

    const [rows] = await db.query('SELECT * FROM categorias WHERE estatus = 1');
    return rows;
};

export const buscarCategoriaById = async (id) => {

    const [rows] = await db.query('SELECT * FROM categorias WHERE idCategoria = ?',[id]);
    return rows[0] || null;
};

export const crearCategoria = async (nombre, descripcion) => {

    const estatus = 1;
    const [result] = await db.query('INSERT INTO categorias (nombre, descripcion, estatus) VALUES (?,?,?)',
        [nombre, descripcion, estatus]
    );
    return {id: result.insertId,nombre,descripcion,estatus};
};

export const editarCategoria = async (id, nombre, descripcion) => {

    const [result] = await db.query('UPDATE categorias SET nombre = ?, descripcion = ? WHERE idCategoria = ?',
        [nombre, descripcion, id]
    );
    return result.affectedRows;
};
export const eliminarCategoria = async (id) => {

    const [result] = await db.query('UPDATE categorias SET estatus = 0 WHERE idCategoria = ?',[id]);
    return result.affectedRows;
};