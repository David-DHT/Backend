// Import del modelo
import * as usuarioModelo from '../models/usuarios.models.js';

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

// Crear usuario
export const crearUsuario = async (req, res) => {
    try {
        const { nombre, aPaterno, aMaterno, correo, telefono, password, idPerfil } = req.body;

        // 1. Validación de campos obligatorios
        if (!nombre || !aPaterno || !correo || !password || !idPerfil) {
            return res.status(400).json({ message: 'Faltan datos obligatorios para crear el usuario' });
        }

        // 2. Validación de correo duplicado
        const existe = await usuarioModelo.buscarUsuarioByEmail(correo);
        if (existe) {
            return res.status(400).json({ message: 'Este correo ya pertenece a un usuario registrado' });
        }
        // 3. Crear el usuario
        const nuevo = await usuarioModelo.crearUsuario(nombre, aPaterno, aMaterno, correo, telefono, password, idPerfil);

        delete nuevo.password;
        res.status(201).json(nuevo);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al crear usuario' });
    }
};

// Editar usuario
export const editarUsuario = async (req, res) => {
    try {
        const id = req.params.id;
        const { nombre, aPaterno, aMaterno, correo, telefono, password, idPerfil } = req.body;

        const resultado = await usuarioModelo.editarUsuario(id, nombre, aPaterno, aMaterno, correo, telefono, password, idPerfil);

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