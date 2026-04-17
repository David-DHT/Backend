import { Router } from "express";
import { getConfiguracion } from "../controllers/configuracion.controller";

const router = Router();

router.get('/configuracion', getConfiguracion);

export default router;