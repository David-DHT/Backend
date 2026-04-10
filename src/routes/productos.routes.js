import { Router } from 'express';
<<<<<<< HEAD
import {
  crearProducto,
  actualizarProducto,
  obtenerProductos,
  obtenerProductoPorId,
  eliminarProducto
} from '../controllers/productos.controller.js';
=======
import { crearProducto, actualizarProducto,obtenerProductos, obtenerProductoPorId } from '../controllers/productos.controller.js';
import { verificarToken } from '../middlewares/auth.middleware.js';
>>>>>>> 137c727ebca5b7ea60ce29a44512712b525a2e2b
import { upload } from '../middlewares/upload.js';

const router = Router();

// Rutas públicas
router.get('/', obtenerProductos);
<<<<<<< HEAD
router.get('/:id', obtenerProductoPorId);
// Ruta para CREAR un producto (POST)
// upload.single('imagen') le dice a multer que busque un archivo subido en el campo llamado "imagen"
=======
router.get('/:id', obtenerProductoPorId); 
// Rutas protegidas
>>>>>>> 137c727ebca5b7ea60ce29a44512712b525a2e2b
router.post('/', upload.single('imagen'), crearProducto);
router.put('/:id', upload.single('imagen'), actualizarProducto);
<<<<<<< HEAD
router.delete('/:id', eliminarProducto);

=======
>>>>>>> 137c727ebca5b7ea60ce29a44512712b525a2e2b
export default router;