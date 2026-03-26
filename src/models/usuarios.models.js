import db from '../config/db.js';

export const totalUsuarios = async () => {
    const [rows] = await db.query(
        //Vista 2
        `SELECT u.idUsuario, u.nombre, u.aPaterno, u.aMaterno, u.correo, u.telefono, u.idPerfil, p.perfil 
         FROM usuarios u 
         INNER JOIN perfiles p ON u.idPerfil = p.id 
         ORDER BY u.idUsuario DESC`
    );
    return rows;
};

export const buscarUsuarioById = async (id) => {
    const [rows] = await db.query('SELECT * FROM usuarios WHERE idUsuario = ?',[id]);
    return rows[0] || null;
};

export const buscarUsuarioByEmail = async (correo) => {
    const [rows] = await db.query('SELECT * FROM usuarios WHERE correo = ?',[correo]);
    return rows[0] || null;
};

export const buscarUsuarioByTelefono = async (telefono) => {
    const [rows] = await db.query('SELECT * FROM usuarios WHERE telefono = ?',[telefono]);
    return rows[0] || null;
};

export const crearUsuario = async (nombre, aPaterno,aMaterno,correo,telefono,password, idPerfil) => {

    const [result] = await db.query(
        'INSERT INTO usuarios (nombre, aPaterno, aMaterno,correo,telefono,password,idPerfil) VALUES (?,?,?,?,?,?,?)',
        [nombre, aPaterno,aMaterno,correo,telefono,password, idPerfil]
    );
    return {id: result.insertId,nombre,aPaterno,aMaterno,correo,telefono,password,idPerfil};
};

export const editarUsuario = async (id, nombre, aPaterno,aMaterno,correo,telefono,password,idPerfil) => {

    const [result] = await db.query(
        'UPDATE usuarios SET nombre = ?, aPaterno = ?, aMaterno = ?, correo = ?,  telefono = ?, password = ?, idPerfil = ? WHERE idUsuario = ?',
        [nombre, aPaterno,aMaterno,correo,telefono,password,idPerfil, id]
    );
    return result.affectedRows;
};

export const eliminarUsuario   = async (id) => {
    const [result] = await db.query('DELETE FROM usuarios WHERE idUsuario = ?',[id]);
    return result.affectedRows;
};