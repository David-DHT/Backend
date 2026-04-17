import * as configuracionModel from '../models/configuracion.models.js';

export const getConfiguracion = async (req, res) =>{

    try{
        const datos = await configuracionModel.obtenerDatos();

        if (datos.length>0){
            res.json(datos[0]);
        }
        else{
            res.status(404).json({ message: "No se encontro la configuracion"});
        }
    }catch (error){
        console.error("Error en el controlador:", error);
        res.status(500).json({message: "Error al obtener los datos del servidor"});
    }
};