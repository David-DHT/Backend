import { Router } from "express";
import { actualizarConfiguracion, getConfiguracion } from "../controllers/configuracion.controller.js";
import { upload } from "../middlewares/upload.js";

const router = Router();

router.get('/configuracion', getConfiguracion);
router.put('/actualizar',upload.single('logo'),actualizarConfiguracion);

export default router;