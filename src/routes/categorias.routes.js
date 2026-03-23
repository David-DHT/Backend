import {Router} from 'express';
import * as categoriaCtrl from '../controllers/categorias.controller.js';

const router = Router();

//rutas (endpoints)

router.get('/', categoriaCtrl.totalCategorias);

router.get('/:id', categoriaCtrl.buscarCategoriaById);

router.post('/', categoriaCtrl.crearCategoria);

router.put('/:id', categoriaCtrl.editarCategoria);

router.delete('/:id', categoriaCtrl.eliminarCategoria);

export default router;