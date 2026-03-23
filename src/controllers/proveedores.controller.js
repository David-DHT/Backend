// Import del modelo
import * as proveedorModelo from '../models/proveedores.models.js';


// Obtener todos los proveedores
export const totalProveedores = async (req, res) => {
    try {
        const proveedores = await proveedorModelo.totalProveedores();
        res.status(200).json(proveedores);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener proveedores' });
    }
};

// Obtener proveedor por ID
export const buscarProveedorById = async (req, res) => {
    try {
        const id = req.params.id;
        const proveedor = await proveedorModelo.buscarProveedorById(id);
        
        if (!proveedor) {
            return res.status(404).json({ message: 'Proveedor no encontrado' });
        }
        
        res.status(200).json(proveedor);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al buscar proveedor' });
    }
};

// Crear proveedor
export const crearProveedor = async (req, res) => {
    try {
        const { nombre, aPaterno, aMaterno, telefono, correo } = req.body;

        // 1. Validación de campos obligatorios
        if (!nombre || !aPaterno || !aMaterno || !telefono || !correo) {
            return res.status(400).json({ message: 'Faltan datos obligatorios' });
        }

        // 2. Validación de correo duplicado usando tu nueva función del modelo
        const existe = await proveedorModelo.buscarProveedorByEmail(correo);
        if (existe) {
            return res.status(400).json({ message: 'Este correo ya está registrado con otro proveedor' });
        }

        // 3. Crear el proveedor
        const nuevo = await proveedorModelo.crearProveedor(nombre, aPaterno, aMaterno, telefono, correo);

        res.status(201).json(nuevo);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al crear proveedor' });
    }
};

// Editar proveedor
export const editarProveedor = async (req, res) => {
    try {
        const id = req.params.id;
        const { nombre, aPaterno, aMaterno, telefono, correo } = req.body;

        const resultado = await proveedorModelo.editarProveedor(id, nombre, aPaterno, aMaterno, telefono, correo);

        if (resultado === 0) {
            return res.status(404).json({ message: 'No se encontró el proveedor para actualizar' });
        }

        res.status(200).json({ message: 'Proveedor actualizado con éxito', resultado });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar proveedor' });
    }
};

// Eliminar proveedor estatus=0
export const eliminarProveedor = async (req, res) => {
    try {
        const id = req.params.id;

        const resultado = await proveedorModelo.eliminarProveedor(id);

        if (resultado === 0) {
            return res.status(404).json({ message: 'No se encontró el proveedor para eliminar' });
        }

        res.status(200).json({ message: 'Proveedor eliminado (inactivado)', resultado });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar proveedor' });
    }
};