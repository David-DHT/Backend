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
    const diasPeriodo = 30;

    const [rangoRows] = await db.query(`
        SELECT
            DATE_SUB(CURDATE(), INTERVAL 30 DAY) AS fecha_minima_rango,
            CURDATE() AS fecha_limite_actual
    `);

    const rango = rangoRows[0] || {};

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
          AND DATE(v.Fecha) BETWEEN DATE_SUB(CURDATE(), INTERVAL 30 DAY) AND CURDATE()
        GROUP BY p.id_producto, p.nombre
        ORDER BY total_vendido DESC, nombre_producto ASC
        LIMIT 1
    `);

    const productoTop = topRows[0];

    if (!productoTop) {
        return {
            rango: {
                fecha_minima_rango: rango.fecha_minima_rango,
                fecha_limite_actual: rango.fecha_limite_actual,
                dias_periodo: diasPeriodo
            },
            producto: null,
            puntos_modelo: null,
            historial_ventas: [],
            procedimiento: null,
            estimaciones: null,
            observaciones: [
                'No existen ventas activas suficientes dentro del rango seleccionado.'
            ]
        };
    }

    const [seriesRows] = await db.query(`
        SELECT
            DATE(v.Fecha) AS fecha,
            SUM(dv.Cantidad) AS cantidad_dia
        FROM detalle_venta dv
        INNER JOIN venta v
            ON v.ID_Venta = dv.ID_Venta
        WHERE v.Estatus = 'activa'
          AND dv.ID_Producto = ?
          AND DATE(v.Fecha) BETWEEN DATE_SUB(CURDATE(), INTERVAL 30 DAY) AND CURDATE()
        GROUP BY DATE(v.Fecha)
        ORDER BY DATE(v.Fecha) ASC
    `, [productoTop.id_producto]);

    if (!seriesRows.length) {
        return {
            rango: {
                fecha_minima_rango: rango.fecha_minima_rango,
                fecha_limite_actual: rango.fecha_limite_actual,
                dias_periodo: diasPeriodo
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
            observaciones: [
                'No se encontró historial de ventas en el rango seleccionado para el producto líder.'
            ]
        };
    }

    const historialVentas = seriesRows.map((item) => ({
        fecha: item.fecha,
        cantidad_dia: round5(item.cantidad_dia || 0)
    }));

    const primerPunto = historialVentas[0];
    const ultimoPunto = historialVentas[historialVentas.length - 1];

    const [diasRows] = await db.query(`
        SELECT DATEDIFF(?, ?) AS dias_transcurridos
    `, [ultimoPunto.fecha, primerPunto.fecha]);

    let diasTranscurridos = Number(diasRows[0]?.dias_transcurridos || 0);

    if (diasTranscurridos <= 0) {
        diasTranscurridos = 1;
    }

    const y0 = round5(primerPunto.cantidad_dia || 0);
    const yt = round5(ultimoPunto.cantidad_dia || 0);
    const t = round5(diasTranscurridos);

    if (y0 <= 0 || yt <= 0) {
        return {
            rango: {
                fecha_minima_rango: rango.fecha_minima_rango,
                fecha_limite_actual: rango.fecha_limite_actual,
                dias_periodo: diasPeriodo
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
                t
            },
            historial_ventas: historialVentas,
            procedimiento: null,
            estimaciones: null,
            observaciones: [
                'No se puede aplicar el modelo porque uno de los puntos base del rango tiene valor cero.'
            ]
        };
    }

    const C = round5(y0);
    const division = round5(yt / y0);
    const lnDivision = round5(Math.log(division));
    const k = round5(lnDivision / t);

    const exponenteDia = round5(k * 1);
    const exponenteSemana = round5(k * 7);
    const exponenteMes = round5(k * 30);

    const eDia = round5(Math.exp(exponenteDia));
    const eSemana = round5(Math.exp(exponenteSemana));
    const eMes = round5(Math.exp(exponenteMes));

    const estimacionDia = round5(C * eDia);
    const estimacionSemana = round5(C * eSemana);
    const estimacionMes = round5(C * eMes);

    return {
        rango: {
            fecha_minima_rango: rango.fecha_minima_rango,
            fecha_limite_actual: rango.fecha_limite_actual,
            dias_periodo: diasPeriodo
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
            t
        },
        historial_ventas: historialVentas,
        procedimiento: {
            valor_C: C,
            valor_k: k,
            valor_t: t
        },
        estimaciones: {
            un_dia: estimacionDia,
            una_semana: estimacionSemana,
            un_mes: estimacionMes
        },
        observaciones: []
    };
};