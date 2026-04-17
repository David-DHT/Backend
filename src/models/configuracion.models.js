import db from '../config/db.js';

export const obtenerDatos = async () => {
    const [rows] = await db.query(
    `SELECT * FROM configuracion WHERE id_configuracion=1`
  );
  return rows[0];
};

export const actualizarDatos= async (nombreSitio, eslogan, mision, vision, politicas, logo)=> {
    const [resultado] = await db.query(
    `UPDATE configuracion SET nombreSitio=?, eslogan=?, mision=?, vision=?, politicas=?,logo=? WHERE id_configuracion=1`,
    [nombreSitio, eslogan, mision, vision, politicas, logo]
    );

    return resultado;
};