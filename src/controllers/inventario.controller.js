import * as inventarioModelo from '../models/inventario.models.js';

export const totalInventario = async (req, res) => {
    try {
        const stock = await inventarioModelo.totalInventario();
        res.status(200).json(stock);
    } catch (error) {
        console.error('Error al obtener el inventario:', error);
        res.status(500).json({ message: 'Error al obtener el inventario' });
    }
};

export const registrarCompra = async (req, res) => {
    try {
        const { id_proveedor, fecha, detalles } = req.body;

        if (!id_proveedor || !detalles || !Array.isArray(detalles) || detalles.length === 0) {
            return res.status(400).json({
                message: 'Faltan datos o no hay productos en la compra.'
            });
        }

        for (const item of detalles) {
            if (
                !item.id_producto ||
                !item.cantidad ||
                Number(item.cantidad) <= 0 ||
                item.precio === undefined ||
                item.precio === null ||
                Number(item.precio) < 0
            ) {
                return res.status(400).json({
                    message: 'Cada detalle debe incluir producto, cantidad válida y precio válido.'
                });
            }
        }

        const idNuevaCompra = await inventarioModelo.registrarCompra(
            Number(id_proveedor),
            fecha,
            detalles.map(item => ({
                id_producto: Number(item.id_producto),
                cantidad: Number(item.cantidad),
                precio: Number(item.precio)
            }))
        );

        res.status(201).json({
            message: 'Compra registrada y stock actualizado exitosamente',
            id_compra: idNuevaCompra
        });

    } catch (error) {
        console.error('Error al registrar compra:', error);
        res.status(500).json({
            message: error.message || 'Error interno al registrar la compra'
        });
    }
};

export const registrarSalidaInventario = async (req, res) => {
    try {
        const { id_producto, cantidad, motivo } = req.body;

        if (!id_producto || !cantidad || Number(cantidad) <= 0) {
            return res.status(400).json({
                message: 'Debes enviar un producto y una cantidad válida.'
            });
        }

        if (!motivo || !String(motivo).trim()) {
            return res.status(400).json({
                message: 'Debes escribir el motivo del ajuste.'
            });
        }

        await inventarioModelo.registrarSalidaInventario(
            Number(id_producto),
            Number(cantidad)
        );

        res.status(200).json({
            message: 'Stock actualizado correctamente.'
        });

    } catch (error) {
        console.error('Error al registrar salida de inventario:', error);
        res.status(500).json({
            message: error.message || 'Error interno al actualizar el stock.'
        });
    }
};