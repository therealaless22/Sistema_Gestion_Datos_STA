// =============================================
// SANTO TOMÁS DE AQUINO — Modelo de Mensajes
// Consultas SQL parametrizadas sobre Mensajes
// =============================================

const { pool, poolConnect, sql } = require('../config/db');

const MensajeModel = {
  async listarEnviados(remitente_id) {
    await poolConnect;
    const resultado = await pool.request()
      .input('remitente_id', sql.Int, remitente_id)
      .query(`
        SELECT
          m.id,
          m.asunto,
          m.mensaje,
          m.creado_en,
          m.destinatario_id,
          u.nombre   AS destinatario_nombre,
          u.apellido AS destinatario_apellido
        FROM Mensajes m
        JOIN Usuarios u ON u.id = m.destinatario_id
        WHERE m.remitente_id = @remitente_id
        ORDER BY m.creado_en DESC
      `);
    return resultado.recordset;
  },

  async verificarRelacionProfesorEstudiante(profesor_id, estudiante_id) {
    await poolConnect;
    const resultado = await pool.request()
      .input('profesor_id', sql.Int, profesor_id)
      .input('estudiante_id', sql.Int, estudiante_id)
      .query(`
        SELECT TOP 1 h.id
        FROM Horarios h
        JOIN Usuarios u ON u.anio = h.anio
        WHERE h.profesor_id  = @profesor_id
          AND u.id           = @estudiante_id
      `);
    return resultado.recordset;
  },

  async crear({ remitente_id, destinatario_id, asunto, mensaje }) {
    await poolConnect;
    await pool.request()
      .input('remitente_id', sql.Int, remitente_id)
      .input('destinatario_id', sql.Int, destinatario_id)
      .input('asunto', sql.VarChar, asunto?.trim() || null)
      .input('mensaje', sql.VarChar, mensaje.trim())
      .query(`
        INSERT INTO Mensajes (remitente_id, destinatario_id, asunto, mensaje)
        VALUES (@remitente_id, @destinatario_id, @asunto, @mensaje)
      `);
  },

  async verificarRemitente(id, remitente_id) {
    await poolConnect;
    const resultado = await pool.request()
      .input('id', sql.Int, id)
      .input('remitente_id', sql.Int, remitente_id)
      .query(`
        SELECT id FROM Mensajes
        WHERE id = @id AND remitente_id = @remitente_id
      `);
    return resultado.recordset;
  },

  async eliminar(id) {
    await poolConnect;
    await pool.request()
      .input('id', sql.Int, id)
      .query(`DELETE FROM Mensajes WHERE id = @id`);
  },

  async listarRecibidosYMarcarLeidos(destinatario_id) {
    await poolConnect;
    const resultado = await pool.request()
      .input('destinatario_id', sql.Int, destinatario_id)
      .query(`
        SELECT
          m.id,
          m.asunto,
          m.mensaje,
          m.leido,
          m.creado_en,
          u.nombre   AS remitente_nombre,
          u.apellido AS remitente_apellido
        FROM Mensajes m
        JOIN Usuarios u ON u.id = m.remitente_id
        WHERE m.destinatario_id = @destinatario_id
        ORDER BY m.creado_en DESC
      `);

    await pool.request()
      .input('destinatario_id', sql.Int, destinatario_id)
      .query(`
        UPDATE Mensajes SET leido = 1
        WHERE destinatario_id = @destinatario_id AND leido = 0
      `);

    return resultado.recordset;
  },
};

module.exports = MensajeModel;

