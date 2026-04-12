import { Router } from 'express';
import { crearPreferencia } from '../controllers/pago.controller.js';
import { verificarToken } from '../middlewares/auth.middleware.js'; 

const router = Router();

//Rutas protegidas
router.post('/crear-preferencia',verificarToken, crearPreferencia);

export default router;