import express from 'express';
import {
  listarVentas,
  obtenerVenta,
  registrarVenta,
  actualizarVenta,
  cancelarVenta,
  listarMetodosPago
} from '../controllers/ventas.controller.js';

import { verificarToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', verificarToken, listarVentas);
router.get('/metodos-pago', verificarToken, listarMetodosPago);

router.get('/top-productos', verificarToken, obtenerTopProductosVendidos);
router.get('/:id', verificarToken, obtenerVenta);
router.post('/', verificarToken, registrarVenta);
router.put('/:id', verificarToken, actualizarVenta);
router.put('/:id/cancelar', verificarToken, cancelarVenta);

export default router;