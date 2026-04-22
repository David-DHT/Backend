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

        if (!nombreUsuario || !sugerencia) {
            return res.status(400).json({
                success: false,
                message: 'El nombre de usuario y la sugerencia son obligatorios'
            });
        }

        const opinion = await reportesModelo.insertarOpinion(nombreUsuario, sugerencia);

        return res.status(201).json({
            success: true,
            message: 'Opinión registrada correctamente',
            data: opinion
        });
    } catch (error) {
        console.error('Error al registrar opinión:', error);

        return res.status(500).json({
            success: false,
            message: 'Error al registrar la opinión'
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
            message: 'Error al consultar las opiniones'
        });
    }
};

export const eliminarOpinion = async (req, res) => {
    try {
        const idOpinion = Number(req.params.id);

        if (!idOpinion || idOpinion <= 0) {
            return res.status(400).json({
                success: false,
                message: 'ID de opinión no válido'
            });
        }

        const eliminadas = await reportesModelo.eliminarOpinion(idOpinion);

        if (!eliminadas) {
            return res.status(404).json({
                success: false,
                message: 'Opinión no encontrada'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Opinión eliminada correctamente'
        });
    } catch (error) {
        console.error('Error al eliminar opinión:', error);

        return res.status(500).json({
            success: false,
            message: 'Error al eliminar la opinión'
        });
    }
};

export const obtenerEstimaciones = async (req, res) => {
    try {
        const periodo = String(req.query?.periodo || 'dia').trim().toLowerCase();
        const estimacion = await reportesModelo.obtenerEstimacionProductoTop(periodo);

        return res.status(200).json({
            success: true,
            data: estimacion
        });
    } catch (error) {
        console.error('Error al obtener estimaciones de reportes:', error);

        return res.status(500).json({
            success: false,
            message: 'Error al obtener las estimaciones del producto más vendido'
        });
    }
};