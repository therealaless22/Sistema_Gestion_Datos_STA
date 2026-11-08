// =============================================
// SANTO TOMÁS DE AQUINO — Modelo de Entregas
// Consultas SQL parametrizadas sobre Entregas
// =============================================

const { pool, poolConnect, sql } = require('../config/db');

const EntregaModel = {
  async verificarAccesoEstudiante(tarea_id, estudiante_id) {
    await poolConnect;
    const resultado = await pool.request()
      .input('tarea_id', sql.Int, tarea_id)
      .input('estudiante_id', sql.Int, estudiante_id)
      .query(`
        SELECT t.id, t.solo_indicaciones
        FROM Tareas t
        JOIN Horarios h ON h.id = t.horario_id
        JOIN Usuarios u ON u.id = @estudiante_id AND u.anio = h.anio
        WHERE t.id = @tarea_id
      `);
    return resultado.recordset;
  },

  async buscarPorTareaYEstudiante(tarea_id, estudiante_id) {
    await poolConnect;
    const resultado = await pool.request()
      .input('tarea_id', sql.Int, tarea_id)
      .input('estudiante_id', sql.Int, estudiante_id)
      .query(`SELECT id FROM Entregas WHERE tarea_id = @tarea_id AND estudiante_id = @estudiante_id`);
    return resultado.recordset;
  },

  async actualizarEntrega({ tarea_id, estudiante_id, comentario, archivo_url }) {
    await poolConnect;
    await pool.request()
      .input('tarea_id', sql.Int, tarea_id)
      .input('estudiante_id', sql.Int, estudiante_id)
      .input('comentario', sql.VarChar, comentario?.trim() || null)
      .input('archivo_url', sql.VarChar, archivo_url)
      .query(`
        UPDATE Entregas SET
          comentario   = @comentario,
          entregado_en = GETDATE(),
          nota         = NULL
          ${archivo_url ? ', archivo_url = @archivo_url' : ''}
        WHERE tarea_id = @tarea_id AND estudiante_id = @estudiante_id
      `);
  },

  async insertarEntrega({ tarea_id, estudiante_id, comentario, archivo_url }) {
    await poolConnect;
    await pool.request()
      .input('tarea_id', sql.Int, tarea_id)
      .input('estudiante_id', sql.Int, estudiante_id)
      .input('comentario', sql.VarChar, comentario?.trim() || null)
      .input('archivo_url', sql.VarChar, archivo_url)
      .query(`
        INSERT INTO Entregas (tarea_id, estudiante_id, archivo_url, comentario)
        VALUES (@tarea_id, @estudiante_id, @archivo_url, @comentario)
      `);
  },

  async verificarPropiedadProfesor(id, profesor_id) {
    await poolConnect;
    const resultado = await pool.request()
      .input('id', sql.Int, id)
      .input('profesor_id', sql.Int, profesor_id)
      .query(`
        SELECT e.id
        FROM Entregas e
        JOIN Tareas t   ON t.id = e.tarea_id
        JOIN Horarios h ON h.id = t.horario_id
        WHERE e.id = @id AND h.profesor_id = @profesor_id
      `);
    return resultado.recordset;
  },

  async calificar(id, notaNum) {
    await poolConnect;
    await pool.request()
      .input('id', sql.Int, id)
      .input('nota', sql.Decimal(5, 2), notaNum)
      .query(`UPDATE Entregas SET nota = @nota WHERE id = @id`);
  },
};

module.exports = EntregaModel;

