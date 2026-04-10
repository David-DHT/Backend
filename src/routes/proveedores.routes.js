import { Router } from 'express';
import * as proveedorCtrl from '../controllers/proveedores.controller.js';

const router = Router();
// Rutas públicas
router.get('/', proveedorCtrl.totalProveedores);
router.get('/:id', proveedorCtrl.buscarProveedorById);

// Rutas protegidas
router.post('/', proveedorCtrl.crearProveedor);
router.put('/:id', proveedorCtrl.editarProveedor);
router.delete('/:id', proveedorCtrl.eliminarProveedor);
export default router;