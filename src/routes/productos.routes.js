import { Router } from 'express';
import {
  crearProducto,
  actualizarProducto,
  obtenerProductos,
  obtenerProductoPorId,
  eliminarProducto
} from '../controllers/productos.controller.js';
import { upload } from '../middlewares/upload.js';

const router = Router();

// --- RUTAS DE PRODUCTOS ---

router.get('/', obtenerProductos);
router.get('/:id', obtenerProductoPorId);
// Ruta para CREAR un producto (POST)
// upload.single('imagen') le dice a multer que busque un archivo subido en el campo llamado "imagen"
router.post('/', upload.single('imagen'), crearProducto);

// Ruta para ACTUALIZAR un producto (PUT)
// Usamos /:id para saber qué producto editar (ej. /productos/5)
router.put('/:id', upload.single('imagen'), actualizarProducto);
router.delete('/:id', eliminarProducto);

export default router;