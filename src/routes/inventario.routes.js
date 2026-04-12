import { Router } from 'express';
import { verificarToken } from '../middlewares/auth.middleware.js';
import * as inventarioCtrl from '../controllers/inventario.controller.js';

const router = Router();

// Rutas protegidas
router.get('/',verificarToken, inventarioCtrl.totalInventario);
router.post('/compras',verificarToken,inventarioCtrl.registrarCompra);

export default router;