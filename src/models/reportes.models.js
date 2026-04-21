import db from '../config/db.js';

const LIMITE_STOCK_BAJO_DEFAULT = 10;

export const obtenerDashboardReportes = async (limiteStockBajo = LIMITE_STOCK_BAJO_DEFAULT) => {
    const limite = Number.isFinite(Number(limiteStockBajo))
        ? Number(limiteStockBajo)
        : LIMITE_STOCK_BAJO_DEFAULT;

    const [categoriasRows] = await db.query(`
        SELECT COUNT(*) AS total
        FROM categorias
    `);

    const [productosRows] = await db.query(`
        SELECT COUNT(*) AS total
        FROM productos
    `);

    const [usuariosRows] = await db.query(`
        SELECT COUNT(*) AS total
        FROM usuarios
    `);

    const [topProductosRows] = await db.query(`
        SELECT
            p.id_producto,
            TRIM(p.nombre) AS nombre_producto,
            SUM(dv.Cantidad) AS unidades_vendidas
        FROM detalle_venta dv
        INNER JOIN venta v
            ON v.ID_Venta = dv.ID_Venta
        INNER JOIN productos p
            ON p.id_producto = dv.ID_Producto
        WHERE v.Estatus = 'activa'
        GROUP BY p.id_producto, p.nombre
        ORDER BY unidades_vendidas DESC, nombre_producto ASC
        LIMIT 10
    `);

    const [stockBajoRows] = await db.query(`
        SELECT
            vic.id_inventario,
            TRIM(vic.nombre_producto) AS nombre_producto,
            TRIM(vic.nombre_categoria) AS nombre_categoria,
            vic.stock_actual
        FROM vista_inventario_completo vic
        WHERE vic.stock_actual <= ?
        ORDER BY vic.stock_actual ASC, vic.nombre_producto ASC
    `, [limite]);

    const totalCategorias = Number(categoriasRows[0]?.total || 0);
    const totalProductos = Number(productosRows[0]?.total || 0);
    const totalUsuarios = Number(usuariosRows[0]?.total || 0);

    const totalUnidadesTop = topProductosRows.reduce((acumulado, item) => {
        return acumulado + Number(item.unidades_vendidas || 0);
    }, 0);

    const topProductos = topProductosRows.map((item, index) => {
        const unidadesVendidas = Number(item.unidades_vendidas || 0);
        const porcentaje = totalUnidadesTop > 0
            ? Number(((unidadesVendidas / totalUnidadesTop) * 100).toFixed(1))
            : 0;

        return {
            posicion: index + 1,
            id_producto: Number(item.id_producto),
            nombre_producto: item.nombre_producto,
            unidades_vendidas: unidadesVendidas,
            porcentaje
        };
    });

    const productoMasVendido = topProductos.length > 0
        ? {
            id_producto: topProductos[0].id_producto,
            nombre_producto: topProductos[0].nombre_producto,
            unidades_vendidas: topProductos[0].unidades_vendidas,
            porcentaje: topProductos[0].porcentaje
        }
        : null;

    const stockBajo = stockBajoRows.map((item) => {
        const stockActual = Number(item.stock_actual || 0);

        return {
            id_inventario: Number(item.id_inventario),
            nombre_producto: item.nombre_producto,
            nombre_categoria: item.nombre_categoria,
            stock_actual: stockActual,
            nivel: stockActual <= 3 ? 'Crítico' : 'Bajo'
        };
    });

    return {
        resumen: {
            total_categorias: totalCategorias,
            total_productos: totalProductos,
            total_usuarios: totalUsuarios
        },
        producto_mas_vendido: productoMasVendido,
        top_productos: topProductos,
        stock_bajo: stockBajo,
        configuracion: {
            limite_stock_bajo: limite
        }
    };
};

export const totalCompras = async () => {
    const [rows] = await db.query(`
        SELECT
            c.id_compra,
            c.fecha,
            c.total,
            CONCAT(p.nombre, ' ', p.aPaterno, ' ', p.aMaterno) AS proveedor
        FROM compras c
        INNER JOIN proveedores p
            ON p.idProveedor = c.proveedor
        ORDER BY c.id_compra DESC
    `);

    return rows;
};

export const detalleCompraById = async (id) => {
    const [rows] = await db.query(`
        SELECT
            dc.id_detalleCompra,
            dc.compra,
            dc.producto,
            TRIM(p.nombre) AS nombre_producto,
            dc.cantidad,
            dc.precio_unitario,
            (dc.cantidad * dc.precio_unitario) AS subtotal
        FROM detalle_compras dc
        INNER JOIN productos p
            ON p.id_producto = dc.producto
        WHERE dc.compra = ?
        ORDER BY dc.id_detalleCompra ASC
    `, [id]);

    return rows;
};

export const insertarOpinion = async (nombreUsuario, sugerencia) => {
    const [result] = await db.query(`
        INSERT INTO opiniones (nombreUsuario, sugerencia)
        VALUES (?, ?)
    `, [nombreUsuario, sugerencia]);

    return {
        idOpinion: result.insertId,
        nombreUsuario,
        sugerencia
    };
};

export const consultarOpiniones = async () => {
    const [rows] = await db.query(`
        SELECT
            idOpinion,
            nombreUsuario,
            sugerencia
        FROM opiniones
        ORDER BY idOpinion DESC
    `);

    return rows;
};

export const eliminarOpinion = async (idOpinion) => {
    const [result] = await db.query(`
        DELETE FROM opiniones
        WHERE idOpinion = ?
    `, [idOpinion]);

    return result.affectedRows;
};

export const obtenerEstimacionProductoTop = async () => {
    const [rangoRows] = await db.query(`
        SELECT
            MIN(Fecha) AS fecha_minima_db,
            CURDATE() AS fecha_limite_actual,
            COUNT(*) AS total_ventas_activas
        FROM venta
        WHERE Estatus = 'activa'
    `);

    const rango = rangoRows[0] || {};

    if (!rango.fecha_minima_db || Number(rango.total_ventas_activas || 0) === 0) {
        return {
            rango: {
                fecha_minima_db: null,
                fecha_limite_actual: null,
                dias_periodo_global: 0
            },
            producto: null,
            puntos_modelo: null,
            procedimiento: null,
            estimaciones: null,
            observaciones: [
                'No existen ventas activas suficientes para calcular estimaciones.'
            ]
        };
    }

    const [topRows] = await db.query(`
        SELECT
            p.id_producto,
            TRIM(p.nombre) AS nombre_producto,
            SUM(dv.Cantidad) AS total_vendido
        FROM detalle_venta dv
        INNER JOIN venta v
            ON v.ID_Venta = dv.ID_Venta
        INNER JOIN productos p
            ON p.id_producto = dv.ID_Producto
        WHERE v.Estatus = 'activa'
        GROUP BY p.id_producto, p.nombre
        ORDER BY total_vendido DESC, nombre_producto ASC
        LIMIT 1
    `);

    const productoTop = topRows[0];

    if (!productoTop) {
        return {
            rango: {
                fecha_minima_db: rango.fecha_minima_db,
                fecha_limite_actual: rango.fecha_limite_actual,
                dias_periodo_global: 0
            },
            producto: null,
            puntos_modelo: null,
            procedimiento: null,
            estimaciones: null,
            observaciones: [
                'No se encontró un producto con ventas activas para estimar.'
            ]
        };
    }

    const [seriesRows] = await db.query(`
        SELECT
            v.Fecha AS fecha,
            SUM(dv.Cantidad) AS cantidad_dia
        FROM detalle_venta dv
        INNER JOIN venta v
            ON v.ID_Venta = dv.ID_Venta
        WHERE v.Estatus = 'activa'
          AND dv.ID_Producto = ?
        GROUP BY v.Fecha
        ORDER BY v.Fecha ASC
    `, [productoTop.id_producto]);

    if (!seriesRows.length) {
        return {
            rango: {
                fecha_minima_db: rango.fecha_minima_db,
                fecha_limite_actual: rango.fecha_limite_actual,
                dias_periodo_global: 0
            },
            producto: {
                id_producto: Number(productoTop.id_producto),
                nombre_producto: productoTop.nombre_producto,
                total_vendido: Number(productoTop.total_vendido || 0)
            },
            puntos_modelo: null,
            procedimiento: null,
            estimaciones: null,
            observaciones: [
                'No se encontró una serie histórica válida para el producto más vendido.'
            ]
        };
    }

    const primerPunto = seriesRows[0];
    const ultimoPunto = seriesRows[seriesRows.length - 1];

    const [diasRows] = await db.query(`
        SELECT DATEDIFF(?, ?) AS dias_transcurridos
    `, [ultimoPunto.fecha, primerPunto.fecha]);

    let diasTranscurridos = Number(diasRows[0]?.dias_transcurridos || 0);

    if (diasTranscurridos <= 0) {
        diasTranscurridos = 1;
    }

    const y0 = Number(primerPunto.cantidad_dia || 0);
    const yt = Number(ultimoPunto.cantidad_dia || 0);

    if (y0 <= 0 || yt <= 0) {
        return {
            rango: {
                fecha_minima_db: rango.fecha_minima_db,
                fecha_limite_actual: rango.fecha_limite_actual,
                dias_periodo_global: 0
            },
            producto: {
                id_producto: Number(productoTop.id_producto),
                nombre_producto: productoTop.nombre_producto,
                total_vendido: Number(productoTop.total_vendido || 0)
            },
            puntos_modelo: {
                fecha_inicial_modelo: primerPunto.fecha,
                fecha_final_modelo: ultimoPunto.fecha,
                y0,
                yt,
                t: diasTranscurridos
            },
            procedimiento: null,
            estimaciones: null,
            observaciones: [
                'No se puede aplicar el modelo porque uno de los puntos base tiene valor cero.'
            ]
        };
    }

    const [diasGlobalRows] = await db.query(`
        SELECT DATEDIFF(?, ?) AS dias_periodo_global
    `, [rango.fecha_limite_actual, rango.fecha_minima_db]);

    const diasPeriodoGlobal = Number(diasGlobalRows[0]?.dias_periodo_global || 0);

    const C = y0;
    const k = Math.log(yt / y0) / diasTranscurridos;

    const estimacionDia = C * Math.exp(k * 1);
    const estimacionSemana = C * Math.exp(k * 7);
    const estimacionMes = C * Math.exp(k * 30);

    const procedimiento = {
        ecuacion_base: 'dy/dt = ky',
        separacion_variables: 'dy/y = k dt',
        integracion: 'ln(y) = kt + C',
        solucion_general: 'y = Ce^(kt)',
        valor_C: C,
        valor_k: Number(k.toFixed(8)),
        modelo_final: `y(t) = ${C.toFixed(4)}e^(${k.toFixed(8)}t)`
    };

    return {
        rango: {
            fecha_minima_db: rango.fecha_minima_db,
            fecha_limite_actual: rango.fecha_limite_actual,
            dias_periodo_global: diasPeriodoGlobal
        },
        producto: {
            id_producto: Number(productoTop.id_producto),
            nombre_producto: productoTop.nombre_producto,
            total_vendido: Number(productoTop.total_vendido || 0)
        },
        puntos_modelo: {
            fecha_inicial_modelo: primerPunto.fecha,
            fecha_final_modelo: ultimoPunto.fecha,
            y0,
            yt,
            t: diasTranscurridos
        },
        procedimiento,
        estimaciones: {
            un_dia: Number(estimacionDia.toFixed(2)),
            una_semana: Number(estimacionSemana.toFixed(2)),
            un_mes: Number(estimacionMes.toFixed(2))
        },
        observaciones: [
            'La estimación se basa en el comportamiento histórico del producto más vendido.',
            'Se toma como referencia el primer y último día con ventas registradas del producto líder.',
            'La fecha límite del periodo mostrado corresponde a la fecha actual del sistema.'
        ]
    };
};