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
    const round5 = (valor) => Number(Number(valor || 0).toFixed(5));

    const [rangoRows] = await db.query(`
        SELECT
            MIN(v.Fecha) AS fecha_minima_db,
            CURDATE() AS fecha_limite_actual,
            COUNT(*) AS total_ventas_activas
        FROM venta v
        WHERE v.Estatus = 'activa'
    `);

    const rangoGlobal = rangoRows[0] || {};

    if (!rangoGlobal.fecha_minima_db || Number(rangoGlobal.total_ventas_activas || 0) === 0) {
        return {
            rango: {
                fecha_minima_db: null,
                fecha_minima_rango: null,
                fecha_limite_actual: null,
                dias_periodo: 0
            },
            producto: null,
            puntos_modelo: null,
            historial_ventas: [],
            procedimiento: null,
            estimaciones: null,
            historial_ventas: [],
            observaciones: [
                'No existen ventas activas suficientes dentro del rango seleccionado.'
            ]
        };
    }

    const [diasPeriodoRows] = await db.query(`
        SELECT DATEDIFF(CURDATE(), ?) AS dias_periodo
    `, [rango.fecha_minima_rango]);

    const diasPeriodo = Number(diasPeriodoRows[0]?.dias_periodo || 0);

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
          AND DATE(v.Fecha) BETWEEN ? AND CURDATE()
        GROUP BY p.id_producto, p.nombre
        ORDER BY total_vendido DESC, nombre_producto ASC
        LIMIT 1
    `, [rango.fecha_minima_rango]);

    const productoTop = topRows[0];

    if (!productoTop) {
        return {
            rango: {
                fecha_minima_db: rangoGlobal.fecha_minima_db,
                fecha_minima_rango: null,
                fecha_limite_actual: rangoGlobal.fecha_limite_actual,
                dias_periodo_global: 0
            },
            producto: null,
            puntos_modelo: null,
            historial_ventas: [],
            procedimiento: null,
            estimaciones: null,
            historial_ventas: [],
            observaciones: [
                'No existen ventas activas suficientes dentro del rango seleccionado.'
            ]
        };
    }

    const [historialRows] = await db.query(`
        SELECT
            DATE(v.Fecha) AS fecha,
            SUM(dv.Cantidad) AS cantidad_dia
        FROM detalle_venta dv
        INNER JOIN venta v
            ON v.ID_Venta = dv.ID_Venta
        WHERE v.Estatus = 'activa'
          AND dv.ID_Producto = ?
          AND DATE(v.Fecha) BETWEEN ? AND CURDATE()
        GROUP BY DATE(v.Fecha)
        ORDER BY DATE(v.Fecha) ASC
    `, [productoTop.id_producto, rango.fecha_minima_rango]);

    if (!historialRows.length) {
        return {
            rango: {
                fecha_minima_db: rangoGlobal.fecha_minima_db,
                fecha_minima_rango: null,
                fecha_limite_actual: rangoGlobal.fecha_limite_actual,
                dias_periodo_global: 0
            },
            producto: {
                id_producto: Number(productoTop.id_producto),
                nombre_producto: productoTop.nombre_producto,
                total_vendido: Number(productoTop.total_vendido || 0)
            },
            puntos_modelo: null,
            historial_ventas: [],
            procedimiento: null,
            estimaciones: null,
            historial_ventas: [],
            observaciones: [
                'No se encontró historial de ventas en el rango seleccionado para el producto líder.'
            ]
        };
    }

    const primerRegistro = historialRows[0];
    const fechaInicialModelo = primerRegistro.fecha;
    const fechaActualSistema = rangoGlobal.fecha_limite_actual;

    const [diasRows] = await db.query(`
        SELECT DATEDIFF(?, ?) AS dias_transcurridos
    `, [fechaActualSistema, fechaInicialModelo]);

    const diasTranscurridos = Number(diasRows[0]?.dias_transcurridos || 0);

    const [diasGlobalRows] = await db.query(`
        SELECT DATEDIFF(?, ?) AS dias_periodo_global
    `, [rangoGlobal.fecha_limite_actual, rangoGlobal.fecha_minima_db]);

    const diasPeriodoGlobal = Number(diasGlobalRows[0]?.dias_periodo_global || 0);

    const x1 = round5(primerRegistro.cantidad_dia || 0);
    const x2 = round5(productoTop.total_vendido || 0);
    const t0 = 0;
    const t2 = round5(diasTranscurridos);

    const historialVentas = historialRows.map((item) => ({
        fecha: item.fecha,
        cantidad_dia: round5(item.cantidad_dia || 0)
    }));

    if (x1 <= 0 || x2 <= 0) {
        return {
            rango: {
                fecha_minima_db: rangoGlobal.fecha_minima_db,
                fecha_minima_rango: fechaInicialModelo,
                fecha_limite_actual: fechaActualSistema,
                dias_periodo_global: diasPeriodoGlobal
            },
            producto: {
                id_producto: Number(productoTop.id_producto),
                nombre_producto: productoTop.nombre_producto,
                total_vendido: Number(productoTop.total_vendido || 0)
            },
            puntos_modelo: {
                fecha_inicial_modelo: fechaInicialModelo,
                fecha_final_modelo: fechaActualSistema,
                x1,
                x2,
                t0,
                t2
            },
            historial_ventas: historialVentas,
            procedimiento: null,
            estimaciones: null,
            historial_ventas: historialVentas,
            observaciones: [
                'No se puede aplicar el modelo porque uno de los valores base es igual a cero.'
            ]
        };
    }

    if (t2 <= 0) {
        return {
            rango: {
                fecha_minima_db: rangoGlobal.fecha_minima_db,
                fecha_minima_rango: fechaInicialModelo,
                fecha_limite_actual: fechaActualSistema,
                dias_periodo_global: diasPeriodoGlobal
            },
            producto: {
                id_producto: Number(productoTop.id_producto),
                nombre_producto: productoTop.nombre_producto,
                total_vendido: Number(productoTop.total_vendido || 0)
            },
            puntos_modelo: {
                fecha_inicial_modelo: fechaInicialModelo,
                fecha_final_modelo: fechaActualSistema,
                x1,
                x2,
                t0,
                t2
            },
            procedimiento: null,
            estimaciones: null,
            historial_ventas: historialVentas,
            observaciones: [
                'Todavía no transcurre al menos un día entre la primera venta del producto líder y la fecha actual.'
            ]
        };
    }

    const C = round5(x1);
    const division = round5(x2 / x1);
    const lnDivision = round5(Math.log(division));
    const k = round5(lnDivision / t2);

    const calcularEstimacion = (diasEstimacion) => {
        const tiempoTotal = round5(t2 + diasEstimacion);
        const exponente = round5(k * tiempoTotal);
        const valor = round5(C * Math.exp(exponente));
        const diferencia = round5(valor - x2);

        return {
            dias_estimacion: diasEstimacion,
            tiempo_total: tiempoTotal,
            valor,
            diferencia
        };
    };

    const estimacionDia = calcularEstimacion(1);
    const estimacionSemana = calcularEstimacion(7);
    const estimacionMes = calcularEstimacion(30);

    return {
        rango: {
            fecha_minima_db: rangoGlobal.fecha_minima_db,
            fecha_minima_rango: fechaInicialModelo,
            fecha_limite_actual: fechaActualSistema,
            dias_periodo_global: diasPeriodoGlobal
        },
        producto: {
            id_producto: Number(productoTop.id_producto),
            nombre_producto: productoTop.nombre_producto,
            total_vendido: Number(productoTop.total_vendido || 0)
        },
        puntos_modelo: {
            fecha_inicial_modelo: fechaInicialModelo,
            fecha_final_modelo: fechaActualSistema,
            x1,
            x2,
            t0,
            t2
        },
        historial_ventas: historialVentas,
        procedimiento: {
            valor_C: C,
            valor_k: k,
            valor_t: t2,
            division_x2_entre_x1: division,
            ln_division: lnDivision
        },
        estimaciones: {
            un_dia: estimacionDia,
            una_semana: estimacionSemana,
            un_mes: estimacionMes
        },
        historial_ventas: historialVentas,
        observaciones: [
            'Se usa x1 como la cantidad vendida el primer día del producto líder.',
            'Se usa x2 como el total acumulado vendido hasta la fecha actual.',
            'El valor de k se calcula con ln(x2 / x1) / t2.',
            'La fila 3 suma al tiempo conocido 1, 7 o 30 días según la opción seleccionada.'
        ]
    };
};