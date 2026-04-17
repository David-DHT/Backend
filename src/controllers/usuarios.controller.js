// Import del modelo
import * as usuarioModelo from '../models/usuarios.models.js';
import bcrypt from 'bcryptjs';

// Obtener todos los usuarios (incluye el nombre del perfil, sin password)
export const totalUsuarios = async (req, res) => {
    try {
        const usuarios = await usuarioModelo.totalUsuarios();
        res.status(200).json(usuarios);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener usuarios' });
    }
};

// Obtener usuario por ID
export const buscarUsuarioById = async (req, res) => {
    try {
        const id = req.params.id;
        const usuario = await usuarioModelo.buscarUsuarioById(id);
        
        if (!usuario) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        delete usuario.password;
        
        res.status(200).json(usuario);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al buscar usuario' });
    }
};

// Editar usuario
export const editarUsuario = async (req, res) => {
    try {
        const id = req.params.id;
        let { nombre, aPaterno, aMaterno, correo, telefono, password, idPerfil, estado } = req.body;

        if (password && password.trim() !== "") {
            const salt = await bcrypt.genSalt(10);
            password = await bcrypt.hash(password, salt);
        } else {
            password = null;
        }

        const resultado = await usuarioModelo.editarUsuario(
            id,
            nombre,
            aPaterno,
            aMaterno,
            correo,
            telefono,
            password,
            idPerfil,
            estado
        );

        if (resultado === 0) {
            return res.status(404).json({ message: 'No se encontró el usuario para actualizar' });
        }

        res.status(200).json({ message: 'Usuario actualizado con éxito' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar usuario' });
    }
};

// Eliminar usuario (Borrado físico según tu modelo actual)
export const eliminarUsuario = async (req, res) => {
    try {
        const id = req.params.id;

        const resultado = await usuarioModelo.eliminarUsuario(id);

        if (resultado === 0) {
            return res.status(404).json({ message: 'No se encontró el usuario para eliminar' });
        }

        res.status(200).json({ message: 'Usuario eliminado permanentemente de la base de datos' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar usuario' });
    }
};

