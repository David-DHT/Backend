import { Router } from 'express';
import { crearProducto, actualizarProducto,obtenerProductos } from '../controllers/productos.controller.js';
// Importamos el middleware de multer que creaste
import { upload } from '../middlewares/upload.js';

const router = Router();

// --- RUTAS DE PRODUCTOS ---

router.get('/', obtenerProductos);

// Ruta para CREAR un producto (POST)
// upload.single('imagen') le dice a multer que busque un archivo subido en el campo llamado "imagen"
router.post('/', upload.single('imagen'), crearProducto);

// Ruta para ACTUALIZAR un producto (PUT)
// Usamos /:id para saber qué producto editar (ej. /productos/5)
router.put('/:id', upload.single('imagen'), actualizarProducto);

export default router;