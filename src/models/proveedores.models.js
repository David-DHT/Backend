import db from '../config/db.js';

export const totalProveedores = async () => {

    const [rows] = await db.query('SELECT * FROM proveedores WHERE estatus = 1');
    return rows;
};

export const buscarProveedorById = async (id) => {

    const [rows] = await db.query('SELECT * FROM proveedores WHERE idProveedor = ?',[id]);
    return rows[0] || null;
};

export const crearProveedor = async (nombre, aPaterno,aMaterno,telefono,correo) => {
    const estatus = 1;
    const [result] = await db.query(
        'INSERT INTO proveedores (nombre, aPaterno, aMaterno,telefono,correo,estatus) VALUES (?,?,?,?,?,?)',
        [nombre, aPaterno,aMaterno,telefono,correo, estatus]
    );
    return {id: result.insertId,nombre,aPaterno,aMaterno,telefono,correo,estatus};
};

export const buscarProveedorByEmail = async (correo) => {
    const [rows] = await db.query(
        'SELECT * FROM proveedores WHERE correo = ?',[correo]);
    return rows[0] || null;
};

export const editarProveedor = async (id, nombre, aPaterno,aMaterno,telefono,correo) => {

    const [result] = await db.query('UPDATE proveedores SET nombre = ?, aPaterno = ?, aMaterno = ?, telefono = ?, correo = ? WHERE idProveedor = ?',
        [nombre, aPaterno,aMaterno,telefono,correo, id]
    );
    return result.affectedRows;
};

export const eliminarProveedor   = async (id) => {
    const [result] = await db.query('UPDATE proveedores SET estatus = 0 WHERE idProveedor = ?',[id]);
    return result.affectedRows;
};