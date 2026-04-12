import { Router } from 'express';
import {
  crearProducto,
  actualizarProducto,
  obtenerProductos,
  obtenerProductoPorId,
  eliminarProducto
} from '../controllers/productos.controller.js';
import { upload } from '../middlewares/upload.js';
import { verificarToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', obtenerProductos);
router.get('/:id', obtenerProductoPorId);


router.post('/',verificarToken, upload.single('imagen'), crearProducto);
router.put('/:id',verificarToken, upload.single('imagen'), actualizarProducto);
router.delete('/:id',verificarToken, eliminarProducto);

export default router;