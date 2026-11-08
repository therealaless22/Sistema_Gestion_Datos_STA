// =============================================
// SANTO TOMÁS DE AQUINO — Modelo de Asistencias
// Consultas SQL parametrizadas sobre Asistencias
// =============================================

const { pool, poolConnect, sql } = require('../config/db');

const AsistenciaModel = {
  async obtenerPorHorarioYFecha(horario_id, fecha) {
    await poolConnect;
    const resultado = await pool.request()
      .input('horario_id', sql.Int, horario_id)
      .input('fecha', sql.Date, fecha)
      .query(`
        SELECT id, estudiante_id, estado, observacion
        FROM Asistencias
        WHERE horario_id = @horario_id AND fecha = @fecha
      `);
    return resultado.recordset;
  },

  async actualizar(asistencia_id, estado, observacion) {
    await poolConnect;
    await pool.request()
      .input('id', sql.Int, asistencia_id)
      .input('estado', sql.VarChar, estado)
      .input('observacion', sql.VarChar, observacion || null)
      .query(`
        UPDATE Asistencias
        SET estado = @estado, observacion = @observacion
        WHERE id = @id
      `);
  },

  async insertar({ estudiante_id, horario_id, fecha, estado, observacion }) {
    await poolConnect;
    await pool.request()
      .input('estudiante_id', sql.Int, estudiante_id)
      .input('horario_id', sql.Int, horario_id)
      .input('fecha', sql.Date, fecha)
      .input('estado', sql.VarChar, estado)
      .input('observacion', sql.VarChar, observacion || null)
      .query(`
        INSERT INTO Asistencias (estudiante_id, horario_id, fecha, estado, observacion)
        VALUES (@estudiante_id, @horario_id, @fecha, @estado, @observacion)
      `);
  },

  async resumenPorEstudiante(estudiante_id) {
    await poolConnect;
    const resultado = await pool.request()
      .input('estudiante_id', sql.Int, estudiante_id)
      .query(`
        SELECT estado, COUNT(*) AS total
        FROM Asistencias
        WHERE estudiante_id = @estudiante_id
        GROUP BY estado
      `);
    return resultado.recordset;
  },
};

module.exports = AsistenciaModel;

