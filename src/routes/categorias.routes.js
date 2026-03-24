import {Router} from 'express';
import { verificarToken } from '../middlewares/auth.middleware.js';
import * as categoriaCtrl from '../controllers/categorias.controller.js';

const router = Router();

//rutas Publicas (endpoints)
router.get('/', categoriaCtrl.totalCategorias);
router.get('/:id', categoriaCtrl.buscarCategoriaById);

//Protegidas
router.post('/', verificarToken, categoriaCtrl.crearCategoria);
router.put('/:id', verificarToken, categoriaCtrl.editarCategoria);
router.delete('/:id', verificarToken, categoriaCtrl.eliminarCategoria);

export default router;