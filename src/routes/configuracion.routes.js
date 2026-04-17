import { Router } from "express";
import { getConfiguracion } from "../controllers/configuracion.controller.js";

const router = Router();

router.get('/configuracion', getConfiguracion);

export default router;