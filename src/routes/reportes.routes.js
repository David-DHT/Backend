import { Router } from "express";
import * as reportesCtrl from '../controllers/reportes.controller.js';

const router = Router();

router.get('/',reportesCtrl.totalCompras);

router.get('/opiniones',reportesCtrl.consultarOpiniones);
router.post('/opiniones',reportesCtrl.insertarOpinion);

router.get('/:id',reportesCtrl.detalleCompraById);


export default router;
