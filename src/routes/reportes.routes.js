import { Router } from "express";
import { verificarToken } from '../middlewares/auth.middleware.js';
import * as reportesCtrl from '../controllers/reportes.controller.js';

const router = Router();


//Rutas protegidas
router.get('/',verificarToken,reportesCtrl.totalCompras);
router.get('/:id',verificarToken,reportesCtrl.detalleCompraById)
router.get('/opiniones',verificarToken,reportesCtrl.consultarOpiniones);
router.post('/opiniones',verificarToken,reportesCtrl.insertarOpinion);
export default router;
