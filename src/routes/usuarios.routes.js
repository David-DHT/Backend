// Importa la función Router() de Express.
import { Router } from 'express';
import * as usuarioCtrl from '../controllers/usuarios.controller.js';

// Crea una instancia de router.
const router = Router();

// Define las rutas (endpoints) para Usuarios
router.get('/', usuarioCtrl.totalUsuarios);
router.get('/:id', usuarioCtrl.buscarUsuarioById);
router.put('/:id', usuarioCtrl.editarUsuario);
router.delete('/:id', usuarioCtrl.eliminarUsuario);

export default router;