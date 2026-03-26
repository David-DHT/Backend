import productosModel from '../models/productos.models.js';
import { uploadToCloudinary } from '../middlewares/upload.js';


export const crearProducto = async (req, res) => {
  try {
    const { nombre, estado, categoria, precio, descripcion } = req.body;

    // 1. Validar que no haya campos vacíos
    if (!nombre?.trim() || !categoria?.trim() || !descripcion?.trim() || precio === undefined || precio === '') {
      return res.status(400).json({
        success: false,
        message: 'Faltan datos. Los campos nombre, categoría, descripción y precio son obligatorios.'
      });
    }

    // 2. Validar que el precio no sea negativo
    if (Number(precio) < 0) {
      return res.status(400).json({
        success: false,
        message: 'El precio no puede ser un valor negativo.'
      });
    }

    // 3. Subir imagen si existe
    let imagenUrl = null;
    if (req.file) {
      imagenUrl = await uploadToCloudinary(req.file);
    }

    const nuevoProducto = await productosModel.crearProducto(
      nombre, estado, categoria, precio, descripcion, imagenUrl
    );

    res.status(201).json({
      success: true,
      message: 'Producto creado exitosamente',
      data: nuevoProducto
    });

  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor', error: error.message });
  }
};

// --- ACTUALIZAR PRODUCTO ---
export const actualizarProducto = async (req, res) => {
  try {
    const id_producto = req.params.id;
    const { nombre, estado, categoria, precio, descripcion } = req.body;

    // 1. Validar que no haya campos vacíos
    if (!nombre?.trim() || !categoria || !descripcion?.trim() || precio === undefined || precio === '') {
      return res.status(400).json({
        success: false,
        message: 'Faltan datos. Los campos nombre, categoría, descripción y precio son obligatorios.'
      });
    }

    // 2. Validar que el precio no sea negativo
    if (Number(precio) < 0) {
      return res.status(400).json({
        success: false,
        message: 'El precio no puede ser un valor negativo.'
      });
    }

    // 3. Lógica de la imagen
    let imagenUrl = req.body.imagen || null; 
    if (req.file) {
      imagenUrl = await uploadToCloudinary(req.file);
    }

    // 4. Actualizar en BD
    await productosModel.actualizarProducto(
      id_producto, nombre, estado, categoria, precio, descripcion, imagenUrl
    );

    res.status(200).json({
      success: true,
      message: 'Producto actualizado exitosamente'
    });

  } catch (error) {
    console.error('Error al actualizar producto:', error);
    if (error.message === 'Producto no encontrado') {
      return res.status(404).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: 'Error interno del servidor', error: error.message });
  }
  
};
//OBTENER PRODUCTOS
export const obtenerProductos = async (req, res) => {
  try {
    // 1. Llamamos al modelo para que ejecute la consulta SQL 
    const productos = await productosModel.obtenerProductos();

    // 2. Respondemos al cliente (frontend) con la lista de productos en formato JSON
    res.status(200).json({
      success: true,
      message: 'Productos obtenidos correctamente',
      data: productos // Aquí va el arreglo con todos tus productos
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