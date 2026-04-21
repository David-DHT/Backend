import { Router } from 'express';
import { verificarToken } from '../middlewares/auth.middleware.js';
import * as reportesCtrl from '../controllers/reportes.controller.js';

const router = Router();

// Dashboard principal de reportes
router.get('/dashboard', verificarToken, reportesCtrl.obtenerDashboard);

// Historial de compras
router.get('/compras', verificarToken, reportesCtrl.totalCompras);
router.get('/compras/:id', verificarToken, reportesCtrl.detalleCompraById);

// Estimaciones con ecuación diferencial
router.get('/estimaciones', verificarToken, reportesCtrl.obtenerEstimaciones);

// Opiniones
router.get('/opiniones', verificarToken, reportesCtrl.consultarOpiniones);
router.post('/opiniones', verificarToken, reportesCtrl.insertarOpinion);
router.delete('/opiniones/:id', verificarToken, reportesCtrl.eliminarOpinion);

export default router;