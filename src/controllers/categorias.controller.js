// Import (arriba del archivo)
import * as categoriaModelo from '../models/categorias.models.js';


// Obtener todas las categorias
export const totalCategorias = async (req, res) => {
    try {
        const categorias = await categoriaModelo.totalCategorias();
        res.status(200).json(categorias);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener categorias' });
    }
};
// Obtener categoria por ID
export const buscarCategoriaById = async (req, res) => {
    try {
        const id = req.params.id;
        const categoria = await categoriaModelo.buscarCategoriaById(id);
        if (!categoria) {
            return res.status(404).json({ message: 'Categoria no encontrada' });
        }
        res.status(200).json(categoria);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al buscar categoria' });
    }
};
// Crear categoria
export const crearCategoria = async (req, res) => {
    try {

        const { nombre, descripcion } = req.body;

        if (!nombre || !descripcion) {
            return res.status(400).json({ message: 'Faltan datos' });
        }

        const nueva = await categoriaModelo.crearCategoria(nombre, descripcion);

        res.status(201).json(nueva);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al crear categoria' });
    }
};
// Editar categoria
export const editarCategoria = async (req, res) => {
    try {

        const id = req.params.id;
        const { nombre, descripcion } = req.body;

        const resultado = await categoriaModelo.editarCategoria(id, nombre, descripcion);

        res.status(200).json({ message: 'Categoria actualizada', resultado });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar categoria' });
    }
};


// Eliminar categoria (estatus = 0)
export const eliminarCategoria = async (req, res) => {
    try {

        const id = req.params.id;

        const resultado = await categoriaModelo.eliminarCategoria(id);

        res.status(200).json({ message: 'Categoria eliminada', resultado });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar categoria' });
    }
};