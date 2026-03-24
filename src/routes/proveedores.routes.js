
import { Router } from 'express';
import { verificarToken } from '../middlewares/auth.middleware.js';
import * as proveedorCtrl from '../controllers/proveedores.controller.js';

const router = Router();
// Rutas públicas
router.get('/', proveedorCtrl.totalProveedores);
router.get('/:id', proveedorCtrl.buscarProveedorById);

// Rutas protegidas
router.post('/',verificarToken, proveedorCtrl.crearProveedor);
router.put('/:id',verificarToken, proveedorCtrl.editarProveedor);
router.delete('/:id',verificarToken, proveedorCtrl.eliminarProveedor);
export default router;