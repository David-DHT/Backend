import { Router } from 'express';
import { verificarToken } from '../middlewares/auth.middleware.js';
import { registrarAdmin } from '../controllers/admin.controller.js';

const router = Router();

router.post('/registrar', verificarToken, registrarAdmin);

export default router;