import { Router } from 'express';
import { crearProducto, actualizarProducto,obtenerProductos, obtenerProductoPorId, eliminarProducto } from '../controllers/productos.controller.js';
import { verificarToken } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.js';

const router = Router();

// Rutas públicas
router.get('/', obtenerProductos);
router.get('/:id', obtenerProductoPorId); 
// Rutas protegidas
router.post('/', upload.single('imagen'), crearProducto);
router.put('/:id', upload.single('imagen'), actualizarProducto);
routerd.delete('/:id', eliminarProducto);
export default router;