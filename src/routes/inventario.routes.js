import { Router } from 'express';
import * as inventarioCtrl from '../controllers/inventario.controller.js';

const router = Router();

router.get('/', inventarioCtrl.totalInventario);

// Ruta POST: http://localhost:3000/api/inventario/compras
router.post('/compras', inventarioCtrl.registrarCompra);

export default router;