import {Router } from 'express';
import * as autchCtrl from '../controllers/auth.controller.js';
import { verificarToken, verificarAdmin } from '../middlewares/auth.middleware.js';
const router = Router();

// Ruta para registrar un nuevo usuario
router.post('/register', autchCtrl.crearUsuario);
router.post('/login', autchCtrl.login);

//Privada para admin
router.post('/register/admin', verificarToken, verificarAdmin, autchCtrl.registroAdmin);

export default router;
