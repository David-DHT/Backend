import db from '../config/db.js';

export const totalUsuarios = async () => {
    //Vista 2
    const [rows] = await db.query(`SELECT * FROM vista_usuarios ORDER BY idUsuario DESC`);
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

    let campos = "nombre = ?, aPaterno = ?, aMaterno = ?, correo = ?,  telefono = ?, idPerfil = ?";
    let valores = [nombre, aPaterno, aMaterno, correo, telefono, idPerfil];

    if (password !==null)
    {
        campos+= ", password = ?";
        valores.push(password);
    }
    valores.push(id);

    const [result] = await db.query(`UPDATE usuarios SET ${campos} WHERE idUsuario = ?`,valores)
    return result.affectedRows;
};

export const eliminarUsuario   = async (id) => {
    const [result] = await db.query('DELETE FROM usuarios WHERE idUsuario = ?',[id]);
    return result.affectedRows;
};