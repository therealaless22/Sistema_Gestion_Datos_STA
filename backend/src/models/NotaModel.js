// =============================================
// SANTO TOMÁS DE AQUINO — Modelo de Notas
// Consultas SQL parametrizadas sobre Notas
// =============================================

const { pool, poolConnect, sql } = require('../config/db');

const NotaModel = {
  async verificarHorarioProfesor(horario_id, profesor_id) {
    await poolConnect;
    const resultado = await pool.request()
      .input('horario_id', sql.Int, horario_id)
      .input('profesor_id', sql.Int, profesor_id)
      .query(`SELECT id FROM Horarios WHERE id = @horario_id AND profesor_id = @profesor_id`);
    return resultado.recordset;
  },

  async verificarTitularidadHorario(horario_id, profesor_id) {
    await poolConnect;
    const resultado = await pool.request()
      .input('horario_id', sql.Int, horario_id)
      .input('profesor_id', sql.Int, profesor_id)
      .query(`
        SELECT h.id
        FROM Horarios h
        WHERE h.id = @horario_id AND h.profesor_id = @profesor_id
      `);
    return resultado.recordset;
  },

  async verificarTitularidadNota(nota_id, profesor_id) {
    await poolConnect;
    const resultado = await pool.request()
      .input('id', sql.Int, nota_id)
      .input('profesor_id', sql.Int, profesor_id)
      .query(`
        SELECT n.id
        FROM Notas n
        JOIN Horarios h ON h.id = n.horario_id
        WHERE n.id = @id AND h.profesor_id = @profesor_id
      `);
    return resultado.recordset;
  },

  async obtenerPorHorarioYPeriodo(horario_id, periodo) {
    await poolConnect;
    const resultado = await pool.request()
      .input('horario_id', sql.Int, horario_id)
      .input('periodo', sql.VarChar, periodo)
      .query(`
        SELECT id, estudiante_id, nota, observacion
        FROM Notas
        WHERE horario_id = @horario_id AND periodo = @periodo
      `);
    return resultado.recordset;
  },

  async actualizarNota(nota_id, nota, observacion) {
    await poolConnect;
    await pool.request()
      .input('id', sql.Int, nota_id)
      .input('nota', sql.Decimal(5, 2), nota)
      .input('observacion', sql.VarChar, observacion || null)
      .query(`
        UPDATE Notas
        SET nota = @nota, observacion = @observacion
        WHERE id = @id
      `);
  },

  async insertarNota({ estudiante_id, horario_id, nota, periodo, observacion }) {
    await poolConnect;
    await pool.request()
      .input('estudiante_id', sql.Int, estudiante_id)
      .input('horario_id', sql.Int, horario_id)
      .input('nota', sql.Decimal(5, 2), nota)
      .input('periodo', sql.VarChar, periodo)
      .input('observacion', sql.VarChar, observacion || null)
      .query(`
        INSERT INTO Notas (estudiante_id, horario_id, nota, periodo, observacion)
        VALUES (@estudiante_id, @horario_id, @nota, @periodo, @observacion)
      `);
  },

  async obtenerCursosEstudiante(estudiante_id) {
    await poolConnect;
    const resultado = await pool.request()
      .input('estudiante_id', sql.Int, estudiante_id)
      .query(`
        SELECT
          h.id      AS horario_id,
          c.nombre  AS curso_nombre,
          h.anio,
          pu.nombre   AS profesor_nombre,
          pu.apellido AS profesor_apellido
        FROM Usuarios e
        JOIN Horarios h ON h.anio = e.anio
        JOIN Cursos c ON c.id = h.curso_id
        LEFT JOIN Usuarios pu ON pu.id = h.profesor_id
        WHERE e.id = @estudiante_id
        ORDER BY c.nombre
      `);
    return resultado.recordset;
  },

  async verificarAccesoEstudianteHorario(horario_id, estudiante_id) {
    await poolConnect;
    const resultado = await pool.request()
      .input('horario_id', sql.Int, horario_id)
      .input('estudiante_id', sql.Int, estudiante_id)
      .query(`
        SELECT h.id FROM Horarios h
        JOIN Usuarios e ON e.anio = h.anio
        WHERE h.id = @horario_id AND e.id = @estudiante_id
      `);
    return resultado.recordset;
  },

  async obtenerNotasEstudiante(horario_id, estudiante_id) {
    await poolConnect;
    const resultado = await pool.request()
      .input('horario_id', sql.Int, horario_id)
      .input('estudiante_id', sql.Int, estudiante_id)
      .query(`
        SELECT id, nota, periodo, observacion, creado_en
        FROM Notas
        WHERE horario_id = @horario_id AND estudiante_id = @estudiante_id
        ORDER BY periodo
      `);
    return resultado.recordset;
  },
};

module.exports = NotaModel;

