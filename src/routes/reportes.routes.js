import { Router } from "express";
import { verificarToken } from '../middlewares/auth.middleware.js';
import * as reportesCtrl from '../controllers/reportes.controller.js';

const router = Router();

//Rutas públicas
router.get('/',reportesCtrl.totalCompras);
router.get('/:id',reportesCtrl.detalleCompraById)
router.get('/opiniones',reportesCtrl.consultarOpiniones);

//Rutas protegidas
router.post('/opiniones',verificarToken,reportesCtrl.insertarOpinion);
export default router;
