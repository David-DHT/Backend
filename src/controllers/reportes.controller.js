import * as reportesModelo from '../models/reportes.models.js';

export const obtenerDashboard = async (req, res) => {
    try {
        const limiteStockBajo = req.query.limite_stock_bajo;
        const dashboard = await reportesModelo.obtenerDashboardReportes(limiteStockBajo);

        return res.status(200).json({
            success: true,
            data: dashboard
        });
    } catch (error) {
        console.error('Error al obtener dashboard de reportes:', error);

        return res.status(500).json({
            success: false,
            message: 'Error al obtener la información del panel de reportes'
        });
    }
};

export const totalCompras = async (req, res) => {
    try {
        const compras = await reportesModelo.totalCompras();

        return res.status(200).json({
            success: true,
            data: compras
        });
    } catch (error) {
        console.error('Error al obtener historial de compras:', error);

        return res.status(500).json({
            success: false,
            message: 'Error al obtener el historial de compras'
        });
    }
};

export const detalleCompraById = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!id || id <= 0) {
            return res.status(400).json({
                success: false,
                message: 'ID de compra no válido'
            });
        }

        const detalleCompra = await reportesModelo.detalleCompraById(id);

        if (!detalleCompra.length) {
            return res.status(404).json({
                success: false,
                message: 'Detalles de compra no encontrados'
            });
        }

        return res.status(200).json({
            success: true,
            data: detalleCompra
        });
    } catch (error) {
        console.error('Error al buscar detalle de compra:', error);

        return res.status(500).json({
            success: false,
            message: 'Error al buscar el detalle de compra'
        });
    }
};

export const insertarOpinion = async (req, res) => {
    try {
        const nombreUsuario = String(req.body?.nombreUsuario || '').trim();
        const sugerencia = String(req.body?.sugerencia || '').trim();

        if (!nombreUsuario) {
            return res.status(400).json({
                success: false,
                message: 'El nombre de usuario es obligatorio'
            });
        }

        if (!sugerencia) {
            return res.status(400).json({
                success: false,
                message: 'La sugerencia es obligatoria'
            });
        }

        const nuevaOpinion = await reportesModelo.insertarOpinion(nombreUsuario, sugerencia);

        return res.status(201).json({
            success: true,
            data: nuevaOpinion
        });
    } catch (error) {
        console.error('Error al insertar opinión:', error);

        return res.status(500).json({
            success: false,
            message: 'Error al insertar la opinión'
        });
    }
};

export const consultarOpiniones = async (req, res) => {
    try {
        const opiniones = await reportesModelo.consultarOpiniones();

        return res.status(200).json({
            success: true,
            data: opiniones
        });
    } catch (error) {
        console.error('Error al consultar opiniones:', error);

        return res.status(500).json({
            success: false,
            message: 'Error al obtener las opiniones'
        });
    }
};