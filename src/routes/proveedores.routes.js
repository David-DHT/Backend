
import { Router } from 'express';
import * as proveedorCtrl from '../controllers/proveedores.controller.js';

const router = Router();

router.get('/', proveedorCtrl.totalProveedores);
router.get('/:id', proveedorCtrl.buscarProveedorById);

// POST /api/proveedores -> crea un nuevo proveedor (con validación de correo)
router.post('/', proveedorCtrl.crearProveedor);
router.put('/:id', proveedorCtrl.editarProveedor);
router.delete('/:id', proveedorCtrl.eliminarProveedor);
export default router;