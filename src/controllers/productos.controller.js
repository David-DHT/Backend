import * as productosModel from '../models/productos.models.js';
import { uploadToCloudinary } from '../middlewares/upload.js';


// --- CREAR PRODUCTO ---
export const crearProducto = async (req, res) => {
  try {
    const { nombre, estado = 'activo', categoria, precio, descripcion } = req.body;

    if (!nombre || !categoria || !precio) {
      return res.status(400).json({
        success: false,
        message: 'Los campos nombre, categoría y precio son obligatorios.'
      });
    }

    if (isNaN(precio) || Number(precio) < 0) {
      return res.status(400).json({
        success: false,
        message: 'El precio no puede ser un valor negativo.'
      });
    }

    let imagenUrl = null;
    if (req.file) {
      imagenUrl = await uploadToCloudinary(req.file);
    }

    const nuevoProducto = await productosModel.crearProducto(
      nombre,
      estado,
      categoria,
      precio,
      descripcion,
      imagenUrl
    );

    res.status(201).json({
      success: true,
      message: 'Producto creado exitosamente',
      data: nuevoProducto
    });
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// --- ACTUALIZAR PRODUCTO ---
export const actualizarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, estado, categoria, precio, descripcion, imagenActual } = req.body;

    const productoActual = await productosModel.obtenerProductoPorId(id);

    const nombreFinal = nombre ?? productoActual.nombre;
    const estadoFinal = estado ?? productoActual.estado;
    const categoriaFinal = categoria ?? productoActual.categoria;
    const precioFinal = precio ?? productoActual.precio;
    const descripcionFinal = descripcion ?? productoActual.descripcion;

    let imagenUrl = productoActual.imagen || null;

    if (imagenActual && String(imagenActual).trim() !== '') {
      imagenUrl = imagenActual;
    }

    if (req.file) {
      imagenUrl = await uploadToCloudinary(req.file);
    }

    const resultado = await productosModel.actualizarProducto(
      id,
      nombreFinal,
      estadoFinal,
      categoriaFinal,
      precioFinal,
      descripcionFinal,
      imagenUrl
    );

    res.status(200).json({
      success: true,
      message: 'Producto actualizado correctamente',
      data: resultado
    });
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al actualizar el producto'
    });
  }
};

// --- OBTENER TODOS LOS PRODUCTOS ---
export const obtenerProductos = async (req, res) => {
  try {
    const productos = await productosModel.obtenerProductos();

    res.status(200).json({
      success: true,
      message: 'Productos obtenidos correctamente',
      data: productos
    });
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener la lista de productos',
      error: error.message
    });
  }
};

// --- OBTENER PRODUCTO POR ID ---
export const obtenerProductoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const producto = await productosModel.obtenerProductoPorId(id);

    res.status(200).json({
      success: true,
      data: producto
    });
  } catch (error) {
    console.error('Error al obtener producto por ID:', error);

    if (error.message === 'Producto no encontrado') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al obtener el producto'
    });
  }
};

// --- ELIMINAR / DAR DE BAJA PRODUCTO ---
export const eliminarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const resultado = await productosModel.eliminarProducto(id);

    res.status(200).json({
      success: true,
      message: resultado.message
    });
  } catch (error) {
    console.error('Error al eliminar producto:', error);

    if (error.message === 'Producto no encontrado') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al eliminar el producto'
    });
  }
};

export const obtenerTopVendidos = async (req, res) => {
  try {
    const productos = await productosModel.obtenerTopVendidos();

    res.status(200).json({
      success: true,
      message: 'Top de productos obtenidos correctamente',
      data: productos
    });
  } catch (error) {
    console.error('Error al obtener top de productos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener el top de productos',
      error: error.message
    });
  }
};