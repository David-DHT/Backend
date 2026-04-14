import { Router } from 'express';
import { crearPreferencia } from '../controllers/pago.controller.js';
import { verificarToken } from '../middlewares/auth.middleware.js'; 
import { recibirWebhook } from '../controllers/pago.controller.js';

const router = Router();

//Rutas protegidas
router.post('/crear-preferencia',verificarToken, crearPreferencia);
router.post('/webhook',recibirWebhook);

export default router;