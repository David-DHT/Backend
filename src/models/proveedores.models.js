// importa el pool de conexiones
import db from '../config/db.js';

// Función para obtener todos los proveedores activos
export const totalProveedores = async () => {

    const [rows] = await db.query(
        'SELECT * FROM proveedores WHERE estatus = 1'
    );

    return rows;
};
// Funcion para obtener un proveedor por su ID
export const buscarProveedorById = async (id) => {

    const [rows] = await db.query(
        'SELECT * FROM proveedores WHERE idProveedor = ?',
        [id]
    );
    return rows[0] || null;
};
// Función para crear un nuevo proveedor
export const crearProveedor = async (nombre, aPaterno,aMaterno,telefono,correo) => {

    const estatus = 1;

    const [result] = await db.query(
        'INSERT INTO proveedores (nombre, aPaterno, aMaterno,telefono,correo,estatus) VALUES (?,?,?,?,?,?)',
        [nombre, aPaterno,aMaterno,telefono,correo, estatus]
    );
    return {
        id: result.insertId,
        nombre,
        aPaterno,
        aMaterno,
        telefono,
        correo,
        estatus
    };
};
// Función para buscar si un correo ya existe
export const buscarProveedorByEmail = async (correo) => {
    const [rows] = await db.query(
        'SELECT * FROM proveedores WHERE correo = ?',
        [correo]
    );
    // Si encuentra algo, devuelve el objeto; si no, devuelve null
    return rows[0] || null;
};

// Función para actualizar un proveedor
export const editarProveedor = async (id, nombre, aPaterno,aMaterno,telefono,correo) => {

    const [result] = await db.query(
        'UPDATE proveedores SET nombre = ?, aPaterno = ?, aMaterno = ?, telefono = ?, correo = ? WHERE idProveedor = ?',
        [nombre, aPaterno,aMaterno,telefono,correo, id]
    );

    return result.affectedRows;
};
// Función para eliminar un proveedor (eliminado lógico)
export const eliminarProveedor   = async (id) => {

    const [result] = await db.query(
        'UPDATE proveedores SET estatus = 0 WHERE idProveedor = ?',
        [id]
    );
    return result.affectedRows;
};