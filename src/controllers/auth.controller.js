import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as usuarioModelo from '../models/usuarios.models.js';



// Crear usuario PUBLICO
export const crearUsuario = async (req, res) => {
    try {
        const { nombre, aPaterno, aMaterno, correo, telefono, password, idPerfil } = req.body;

        // 1. Validación de campos obligatorios
        if (!nombre || !aPaterno || !aMaterno ||!correo || !telefono || !password || !idPerfil) {
            return res.status(400).json({ message: 'Faltan datos obligatorios para crear el usuario' });
        }

        // 2. Validación de correo duplicado
        const existe = await usuarioModelo.buscarUsuarioByEmail(correo);
        if (existe) return res.status(400).json({ message: 'Este correo ya pertenece a un usuario registrado' });

        const existeNum = await usuarioModelo.buscarUsuarioByTelefono(telefono);
        if (existeNum) return res.status(400).json({ message: 'Este teléfono ya pertenece a un usuario registrado' });

        const perfilNum =Number(idPerfil);
        if(perfilNum ===3) return res.status(400).json({ message: 'No puedes registrarte como administrador' });
        
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        
        const nuevo = await usuarioModelo.crearUsuario(nombre, aPaterno, aMaterno, correo, telefono, passwordHash, idPerfil);

        
        res.status(201).json({ message: 'Usuario creado con éxito', usuario: nuevo });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al crear usuario' });
    }
};

export const registroAdmin = async (req, res) => {

      try {
        const { nombre, aPaterno, aMaterno, correo, telefono, password, idPerfil } = req.body;

        // 1. Validación de campos obligatorios
        if (!nombre || !aPaterno || !aMaterno ||!correo || !telefono || !password || !idPerfil) {
            return res.status(400).json({ message: 'Faltan datos obligatorios para crear el usuario' });
        }
        // 2. Validación de correo duplicado
        const existe = await usuarioModelo.buscarUsuarioByEmail(correo);
        if (existe) return res.status(400).json({ message: 'Este correo ya pertenece a un usuario registrado' });
        const existeNum = await usuarioModelo.buscarUsuarioByTelefono(telefono);
        if (existeNum) return res.status(400).json({ message: 'Este teléfono ya pertenece a un usuario registrado' });
        
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        const nuevo = await usuarioModelo.crearUsuario(nombre, aPaterno, aMaterno, correo, telefono, passwordHash, idPerfil);

        res.status(201).json({ message: 'Administrador creado con éxito', usuario: nuevo });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al crear administrador' });
    }
}



//login 
export const login = async (req, res) => {
    try{
        const { correo, password } = req.body;

        if (!correo || !password) return res.status(400).json({ message: 'Correo y contraseña son obligatorios' });
        
        const usuario = await usuarioModelo.buscarUsuarioByEmail(correo);
        if (!usuario) return res.status(400).json({ message: 'Correo o contraseña incorrectos' });

        const esValida = await bcrypt.compare(password, usuario.password);
        if (!esValida) return res.status(400).json({ message: 'Correo o contraseña incorrectos' });


        //payload con id y perfil para el token
        const payload = {id: usuario.idUsuario,idPerfil: usuario.idPerfil };

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '1h' 
        });
        res.status(200).json({ message: 'Inicio de sesión exitoso', token, idPerfil: usuario.idPerfil, id: usuario.idUsuario });

    }
    catch (error) {
        res.status(500).json({ message: 'Error al iniciar sesión' });
    }

};
