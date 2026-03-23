import * as reportesModelo from '../models/reportes.models.js';


export const totalCompras =async (req, res) =>{
    try{
        const compras = await reportesModelo.totalCompras();
        res.status(200).json(compras);
    }catch (error){
        console.error(error);
        res.status(500).json({ message : 'Error al obtener el historial de compras'});
    }
};

export const detalleCompraById = async(req, res) =>{
    try{
     const id= req.params.id
     const detalleCompra = await reportesModelo.detalleCompraById(id);
    
     if(detalleCompra.length===0){
        return res.status(404).json({message: 'detalles de compra no encontrados'})
     }
     res.status(200).json(detalleCompra);

    }catch(error){
        console.error(error);
        res.status(500).json ({message: 'Error: al buscar'})
    }
};

export const insertarOpinion = async (req, res) =>{
    try{
        const {nombreUsuario,sugerencia} = req.body;
        
        //Aqui van validaciones
        const nuevo = await reportesModelo.insertarOpinion(nombreUsuario,sugerencia)
        res.status(201).json(nuevo);

    }catch(error){
        console.error(error);
        res.status(500).json({message: 'Error al insertar la opinion'});
    }
};

export const consultarOpiniones = async(req,res) => {
    try{
        const opiniones = await reportesModelo.consultarOpiniones();
        res.status(200).json(opiniones);
    }catch(error){
        console.error(error);
        res.status(500).json({message: 'Error al obtener las consultas'});
    }
};