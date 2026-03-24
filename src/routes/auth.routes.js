import {Router } from 'express';
import * as autchCtrl from '../controllers/auth.controller.js';

const router = Router();

// Ruta para registrar un nuevo usuario
router.post('/register', autchCtrl.crearUsuario);
// Ruta para iniciar sesión
router.post('/login', autchCtrl.login);

export default router;
