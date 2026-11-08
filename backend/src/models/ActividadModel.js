// =============================================
// SANTO TOMÁS DE AQUINO — Modelo de Actividades
// Consultas SQL parametrizadas sobre Actividades
// =============================================

const { pool, poolConnect, sql } = require('../config/db');

const ActividadModel = {
  async crear(usuario_id, accion, detalle) {
    await poolConnect;
    await pool.request()
      .input('usuario_id', sql.Int, usuario_id)
      .input('accion', sql.VarChar, accion)
      .input('detalle', sql.VarChar, detalle || null)
      .query(`
        INSERT INTO Actividades (usuario_id, accion, detalle)
        VALUES (@usuario_id, @accion, @detalle)
      `);
  },

  async listarTodas() {
    await poolConnect;
    const resultado = await pool.request().query(`
      SELECT
        a.id, a.accion, a.detalle, a.creado_en,
        u.usuario  AS usuario_nombre,
        u.nombre   AS usuario_nombre_completo,
        u.apellido AS usuario_apellido,
        u.rol      AS usuario_rol
      FROM Actividades a
      JOIN Usuarios u ON u.id = a.usuario_id
      ORDER BY a.creado_en DESC
    `);
    return resultado.recordset;
  },
};

module.exports = ActividadModel;

