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

router.get('/', obtenerProductos);
router.get('/:id', obtenerProductoPorId);
router.post('/', upload.single('imagen'), crearProducto);
router.put('/:id', upload.single('imagen'), actualizarProducto);
router.delete('/:id', eliminarProducto);

export default router;