import { Router } from 'express';
import * as proveedorCtrl from '../controllers/proveedores.controller.js';
import { verificarToken } from '../middlewares/auth.middleware.js';

const router = Router();

// Rutas protegidas
router.get('/',verificarToken, proveedorCtrl.totalProveedores);
router.get('/:id', verificarToken, proveedorCtrl.buscarProveedorById);
router.post('/', verificarToken, proveedorCtrl.crearProveedor);
router.put('/:id', verificarToken, proveedorCtrl.editarProveedor);
router.delete('/:id', verificarToken, proveedorCtrl.eliminarProveedor);
export default router;