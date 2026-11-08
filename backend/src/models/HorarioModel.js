// =============================================
// SANTO TOMÁS DE AQUINO — Modelo de Horarios
// Consultas SQL parametrizadas sobre Horarios
// =============================================

const { pool, poolConnect, sql } = require('../config/db');

const ORDEN_DIA = `
  CASE h.dia
    WHEN 'Lunes'     THEN 1
    WHEN 'Martes'    THEN 2
    WHEN 'Miércoles' THEN 3
    WHEN 'Jueves'    THEN 4
    WHEN 'Viernes'   THEN 5
  END
`;

const HorarioModel = {
  async listarTodos() {
    await poolConnect;
    const resultado = await pool.request().query(`
      SELECT
        h.id, h.dia, h.hora_inicio, h.hora_fin, h.anio,
        c.id       AS curso_id,
        c.nombre   AS curso_nombre,
        u.id       AS profesor_id,
        u.nombre   AS profesor_nombre,
        u.apellido AS profesor_apellido
      FROM Horarios h
      JOIN Cursos c  ON c.id = h.curso_id
      LEFT JOIN Usuarios u ON u.id = h.profesor_id
      ORDER BY h.anio, ${ORDEN_DIA}, h.hora_inicio
    `);
    return resultado.recordset;
  },

  async listarPorProfesor(profesor_id) {
    await poolConnect;
    const resultado = await pool.request()
      .input('profesor_id', sql.Int, profesor_id)
      .query(`
        SELECT
          h.id, h.dia, h.hora_inicio, h.hora_fin, h.anio,
          c.nombre  AS curso_nombre
        FROM Horarios h
        JOIN Cursos c ON c.id = h.curso_id
        WHERE h.profesor_id = @profesor_id
        ORDER BY ${ORDEN_DIA}, h.hora_inicio
      `);
    return resultado.recordset;
  },

  async listarPorEstudiante(estudiante_id) {
    await poolConnect;
    const resultado = await pool.request()
      .input('estudiante_id', sql.Int, estudiante_id)
      .query(`
        SELECT
          h.id, h.dia, h.hora_inicio, h.hora_fin, h.anio,
          c.nombre   AS curso_nombre,
          pu.nombre   AS profesor_nombre,
          pu.apellido AS profesor_apellido
        FROM Horarios h
        JOIN Cursos c ON c.id = h.curso_id
        JOIN Usuarios e ON e.id = @estudiante_id
        LEFT JOIN Usuarios pu ON pu.id = h.profesor_id
        WHERE h.anio = e.anio
        ORDER BY ${ORDEN_DIA}, h.hora_inicio
      `);
    return resultado.recordset;
  },

  async buscarConflicto({ curso_id, anio, dia, hora_inicio, hora_fin }) {
    await poolConnect;
    const resultado = await pool.request()
      .input('curso_id', sql.Int, curso_id)
      .input('anio', sql.VarChar, anio)
      .input('dia', sql.VarChar, dia)
      .input('hora_inicio', sql.VarChar, hora_inicio)
      .input('hora_fin', sql.VarChar, hora_fin)
      .query(`
        SELECT id FROM Horarios
        WHERE curso_id = @curso_id AND anio = @anio AND dia = @dia
          AND (
            (@hora_inicio >= hora_inicio AND @hora_inicio < hora_fin) OR
            (@hora_fin > hora_inicio AND @hora_fin <= hora_fin) OR
            (@hora_inicio <= hora_inicio AND @hora_fin >= hora_fin)
          )
      `);
    return resultado.recordset;
  },

  async crear({ curso_id, profesor_id, anio, dia, hora_inicio, hora_fin }) {
    await poolConnect;
    await pool.request()
      .input('curso_id', sql.Int, curso_id)
      .input('profesor_id', sql.Int, profesor_id || null)
      .input('anio', sql.VarChar, anio)
      .input('dia', sql.VarChar, dia)
      .input('hora_inicio', sql.VarChar, hora_inicio)
      .input('hora_fin', sql.VarChar, hora_fin)
      .query(`
        INSERT INTO Horarios (curso_id, profesor_id, anio, dia, hora_inicio, hora_fin)
        VALUES (@curso_id, @profesor_id, @anio, @dia, @hora_inicio, @hora_fin)
      `);
  },

  async actualizar(id, { curso_id, profesor_id, anio, dia, hora_inicio, hora_fin }) {
    await poolConnect;
    await pool.request()
      .input('id', sql.Int, id)
      .input('curso_id', sql.Int, curso_id)
      .input('profesor_id', sql.Int, profesor_id || null)
      .input('anio', sql.VarChar, anio)
      .input('dia', sql.VarChar, dia)
      .input('hora_inicio', sql.VarChar, hora_inicio)
      .input('hora_fin', sql.VarChar, hora_fin)
      .query(`
        UPDATE Horarios SET
          curso_id    = @curso_id,
          profesor_id = @profesor_id,
          anio        = @anio,
          dia         = @dia,
          hora_inicio = @hora_inicio,
          hora_fin    = @hora_fin
        WHERE id = @id
      `);
  },

  async eliminar(id) {
    await poolConnect;
    await pool.request()
      .input('id', sql.Int, id)
      .query(`DELETE FROM Horarios WHERE id = @id`);
  },
};

module.exports = HorarioModel;

