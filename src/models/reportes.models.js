import db from '../config/db.js';

export const totalCompras = async ()=>{

    const [rows] = await db.query(
        'SELECT c.id_compra,p.nombre, c.fecha, c.total FROM compras c INNER JOIN proveedores p ON c.proveedor= p.idProveedor ORDER BY c.id_compra DESC'
    );
    return rows;
};

export const detalleCompraById = async (id) =>{

    const [rows] = await db.query(
        'SELECT c.compra, p.nombre, c.cantidad, c.precio_unitario FROM detalle_compras c INNER JOIN productos p ON c.producto = p.id_producto WHERE c.compra = ?',
        [id]
    );
    return rows;
};

export const insertarOpinion = async (nombreUsuario,Sugerencia) =>{

    const [result] = await db.query(
        'INSERT INTO opiniones (nombreUsuario,sugerencia) VALUES (?,?)',
        [nombreUsuario,Sugerencia]
    );
    return {
      id: result.insertId,
      nombreUsuario,
      Sugerencia
    };
};

export const consultarOpiniones = async () =>{

    const [rows] = await db.query(
        'SELECT * FROM opiniones ORDER BY idOpinion DESC'
    );
    return rows;
};