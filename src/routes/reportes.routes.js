import { Router } from 'express';
import { verificarToken } from '../middlewares/auth.middleware.js';
import * as reportesCtrl from '../controllers/reportes.controller.js';

const router = Router();

// Dashboard principal de reportes
router.get('/dashboard', verificarToken, reportesCtrl.obtenerDashboard);

// Opiniones
router.get('/opiniones', verificarToken, reportesCtrl.consultarOpiniones);
router.post('/opiniones', verificarToken, reportesCtrl.insertarOpinion);

// Compras
router.get('/', verificarToken, reportesCtrl.totalCompras);
router.get('/:id', verificarToken, reportesCtrl.detalleCompraById);

export default router;