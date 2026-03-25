import { Router } from 'express';
import { crearProducto, actualizarProducto,obtenerProductos } from '../controllers/productos.controller.js';
import { verificarToken } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.js';

const router = Router();

// Rutas públicas
router.get('/', obtenerProductos);

// Rutas protegidas
router.post('/', upload.single('imagen'), crearProducto);
router.put('/:id', upload.single('imagen'), actualizarProducto);
export default router;