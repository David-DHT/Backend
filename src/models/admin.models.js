import db from '../config/db.js';

export const buscarAdminPorCorreo = async (correo) => {
    const [rows] = await db.query(
        'SELECT idUsuario, correo FROM usuarios WHERE correo = ? LIMIT 1',
        [correo]
    );

    return rows.length > 0 ? rows[0] : null;
};

export const registrarAdministrador = async (
    nombre,
    aPaterno,
    aMaterno,
    correo,
    telefono,
    password,
    estado
) => {
    const idPerfil = 3;

    const [result] = await db.query(
        `
        INSERT INTO usuarios
        (nombre, aPaterno, aMaterno, correo, telefono, password, idPerfil, estado)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [nombre, aPaterno, aMaterno, correo, telefono, password, idPerfil, estado]
    );

    return result;
};