import bcrypt from 'bcryptjs';
import * as adminModelo from '../models/admin.models.js';

export const registrarAdmin = async (req, res) => {
    try {
        const {
            nombre,
            aPaterno,
            aMaterno,
            correo,
            telefono,
            password,
            estado
        } = req.body;

        if (!nombre || !aPaterno || !aMaterno || !correo || !telefono || !password || !estado) {
            return res.status(400).json({
                message: 'Todos los campos son obligatorios'
            });
        }

        if (!['activo', 'inactivo'].includes(String(estado).toLowerCase())) {
            return res.status(400).json({
                message: 'El estado debe ser activo o inactivo'
            });
        }

        const adminExistente = await adminModelo.buscarAdminPorCorreo(correo);

        if (adminExistente) {
            return res.status(400).json({
                message: 'El correo ya está registrado'
            });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        await adminModelo.registrarAdministrador(
            nombre,
            aPaterno,
            aMaterno,
            correo,
            telefono,
            passwordHash,
            estado.toLowerCase()
        );

        return res.status(201).json({
            message: 'Administrador registrado correctamente'
        });

    } catch (error) {
        console.error('Error al registrar administrador:', error);
        return res.status(500).json({
            message: 'Error al registrar administrador'
        });
    }
};