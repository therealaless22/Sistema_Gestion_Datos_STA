// =============================================
// SANTO TOMÁS DE AQUINO — Modelo de Cursos
// Consultas SQL parametrizadas sobre Cursos
// =============================================

const { pool, poolConnect, sql } = require('../config/db');

const CursoModel = {
  async listarTodos() {
    await poolConnect;
    const resultado = await pool.request().query(`
      SELECT id, nombre, creado_en
      FROM Cursos
      ORDER BY nombre ASC
    `);
    return resultado.recordset;
  },

  async crear(nombre) {
    await poolConnect;
    await pool.request()
      .input('nombre', sql.VarChar, nombre)
      .query(`INSERT INTO Cursos (nombre) VALUES (@nombre)`);
  },

  async actualizar(id, nombre) {
    await poolConnect;
    await pool.request()
      .input('id', sql.Int, id)
      .input('nombre', sql.VarChar, nombre)
      .query(`UPDATE Cursos SET nombre = @nombre WHERE id = @id`);
  },

  async eliminar(id) {
    await poolConnect;
    await pool.request()
      .input('id', sql.Int, id)
      .query(`DELETE FROM Cursos WHERE id = @id`);
  },

  async listarPorProfesor(profesor_id) {
    await poolConnect;
    const resultado = await pool.request()
      .input('profesor_id', sql.Int, profesor_id)
      .query(`
        SELECT
          h.id AS horario_id,
          c.id AS curso_id,
          c.nombre AS curso_nombre,
          h.anio,
          h.dia, h.hora_inicio, h.hora_fin
        FROM Horarios h
        JOIN Cursos c ON c.id = h.curso_id
        WHERE h.profesor_id = @profesor_id
        ORDER BY c.nombre, h.anio
      `);
    return resultado.recordset;
  },

  async listarAlumnosPorHorario(horario_id) {
    await poolConnect;
    const resultado = await pool.request()
      .input('horario_id', sql.Int, horario_id)
      .query(`
        SELECT u.id, u.nombre, u.apellido
        FROM Usuarios u
        JOIN Horarios h ON h.anio = u.anio
        WHERE h.id = @horario_id AND u.rol = 'estudiante' AND u.activo = 1
        ORDER BY u.apellido ASC, u.nombre ASC
      `);
    return resultado.recordset;
  },
};

module.exports = CursoModel;

