import { Router } from 'express';
import { verificarToken,verificarAdmin } from '../middlewares/auth.middleware.js';
import * as usuarioCtrl from '../controllers/usuarios.controller.js';

const router = Router();
// Rutas públicas
router.get('/', usuarioCtrl.totalUsuarios);
router.get('/:id', usuarioCtrl.buscarUsuarioById);

// Rutas protegidas
router.put('/:id',verificarToken, usuarioCtrl.editarUsuario);
router.delete('/:id',verificarToken,verificarAdmin, usuarioCtrl.eliminarUsuario);
export default router