import { Router } from 'express';
import { verificarToken } from '../middlewares/auth.middleware.js';
import * as inventarioCtrl from '../controllers/inventario.controller.js';

const router = Router();

router.get('/', verificarToken, inventarioCtrl.totalInventario);
router.post('/compras', verificarToken, inventarioCtrl.registrarCompra);
router.post('/salidas', verificarToken, inventarioCtrl.registrarSalidaInventario);

export default router;