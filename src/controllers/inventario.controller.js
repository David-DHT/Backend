// Import del modelo
import * as inventarioModelo from '../models/inventario.models.js';

export const totalInventario = async (req, res) => {
    try {
        const stock = await inventarioModelo.totalInventario();
        res.status(200).json(stock);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener el inventario' });
    }
};

export const registrarCompra = async (req, res) => {
    try {
        const { id_proveedor, fecha, detalles } = req.body;

        if (!id_proveedor || !detalles || detalles.length === 0) {
            return res.status(400).json({ message: 'Faltan datos o no hay productos en la compra.' });
        }
        const idNuevaCompra = await inventarioModelo.registrarCompra(id_proveedor, fecha,detalles);

        res.status(201).json({ 
            message: 'Compra registrada y stock actualizado exitosamente',
            id_compra: idNuevaCompra
        });

    } catch (error) {
        console.error('Error al registrar compra:', error);
        res.status(500).json({ message: 'Error interno al registrar la compra' });
    }
};