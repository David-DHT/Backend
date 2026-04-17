import * as configuracionModel from '../models/configuracion.models.js';
import { uploadToCloudinary } from '../middlewares/upload.js';

export const getConfiguracion = async (req, res) =>{

    try{
        const datos = await configuracionModel.obtenerDatos();

        if (datos){
            res.json(datos);
        }
        else{
            res.status(404).json({ message: "No se encontro la configuracion"});
        }
    }catch (error){
        console.error("Error en el controlador:", error);
        res.status(500).json({message: "Error al obtener los datos del servidor"});
    }
};

export const actualizarConfiguracion = async (req, res) => {
    try {

        const { nombreSitio, eslogan, mision, vision, politicas, imagen_anterior } = req.body;

        let logoUrl = imagen_anterior || null;

        if (req.file) {
            logoUrl = await uploadToCloudinary(req.file);
        }

        const resultado = await configuracionModel.actualizarDatos(
            nombreSitio, 
            eslogan, 
            mision, 
            vision, 
            politicas, 
            logoUrl
        );

        if (resultado.affectedRows > 0 || resultado.changedRows >= 0) {
            res.status(200).json({
                success: true,
                message: 'Configuración actualizada correctamente',
                data: { logo: logoUrl } 
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'No se pudo actualizar la configuración'
            });
        }

    } catch (error) {
        console.error('Error en el controlador al actualizar:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor al actualizar'
        });
    }
};