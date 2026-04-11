import * as ventasModel from '../models/ventas.models.js';

export const listarVentas = async (req, res) => {
    try {
        const ventas = await ventasModel.obtenerVentas();
        res.status(200).json({ data: ventas });
    } catch (error) {
        console.error('Error al listar ventas:', error);
        res.status(500).json({ message: 'Error al obtener ventas.' });
    }
};

export const obtenerVenta = async (req, res) => {
    try {
        const venta = await ventasModel.obtenerVentaPorId(req.params.id);

        if (!venta) {
            return res.status(404).json({ message: 'Venta no encontrada.' });
        }

        res.status(200).json({ data: venta });
    } catch (error) {
        console.error('Error al obtener venta:', error);
        res.status(500).json({ message: 'Error al obtener la venta.' });
    }
};

export const registrarVenta = async (req, res) => {
    try {
        const { id_metodo_pago, detalles } = req.body;

        if (!id_metodo_pago) {
            return res.status(400).json({ message: 'Debes seleccionar un método de pago.' });
        }

        if (!detalles || !Array.isArray(detalles) || detalles.length === 0) {
            return res.status(400).json({ message: 'Debes enviar al menos un producto.' });
        }

        const id_trabajador = req.usuario?.id;

        if (!id_trabajador) {
            return res.status(401).json({ message: 'Usuario no autenticado.' });
        }

        const idVenta = await ventasModel.crearVenta({
            id_trabajador,
            id_metodo_pago,
            detalles
        });

        res.status(201).json({
            message: 'Venta registrada correctamente.',
            id_venta: idVenta
        });
    } catch (error) {
        console.error('Error al registrar venta:', error);
        res.status(500).json({ message: error.message || 'Error al registrar venta.' });
    }
};

export const actualizarVenta = async (req, res) => {
    try {
        const { id_metodo_pago } = req.body;

        if (!id_metodo_pago) {
            return res.status(400).json({ message: 'Debes enviar el método de pago.' });
        }

        const updated = await ventasModel.editarVenta(req.params.id, { id_metodo_pago });

        if (!updated) {
            return res.status(404).json({ message: 'Venta no encontrada o ya cancelada.' });
        }

        res.status(200).json({ message: 'Venta actualizada correctamente.' });
    } catch (error) {
        console.error('Error al actualizar venta:', error);
        res.status(500).json({ message: 'Error al actualizar venta.' });
    }
};

export const cancelarVenta = async (req, res) => {
    try {
        const { motivo_cancelacion } = req.body;

        if (!motivo_cancelacion || !motivo_cancelacion.trim()) {
            return res.status(400).json({ message: 'Debes indicar el motivo de cancelación.' });
        }

        await ventasModel.cancelarVenta(req.params.id, motivo_cancelacion.trim());

        res.status(200).json({ message: 'Venta cancelada y stock restaurado correctamente.' });
    } catch (error) {
        console.error('Error al cancelar venta:', error);
        res.status(500).json({ message: error.message || 'Error al cancelar venta.' });
    }
};

export const listarMetodosPago = async (req, res) => {
    try {
        const metodos = await ventasModel.obtenerMetodosPago();
        res.status(200).json({ data: metodos });
    } catch (error) {
        console.error('Error al listar métodos de pago:', error);
        res.status(500).json({ message: 'Error al obtener métodos de pago.' });
    }
};