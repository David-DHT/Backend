import db from '../config/db.js';

export const obtenerDatos = async () => {
    const [rows] = await db.query(
    `SELECT * FROM configuracion WHERE id_configuracion=1`
  );
  return rows;
}

