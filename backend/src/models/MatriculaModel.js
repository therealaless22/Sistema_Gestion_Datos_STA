// =============================================
// SANTO TOMÁS DE AQUINO — Modelo de Matrículas
// Consultas SQL parametrizadas sobre Matriculas
// =============================================

const { pool, poolConnect, sql } = require('../config/db');

const MatriculaModel = {
  async listarTodas() {
    await poolConnect;
    const resultado = await pool.request().query(`
      SELECT
        m.id, m.grado, m.seccion, m.estudiante_id, m.creado_en,
        u.nombre   AS estudiante_nombre,
        u.apellido AS estudiante_apellido,
        u.usuario  AS estudiante_usuario
      FROM Matriculas m
      JOIN Usuarios u ON u.id = m.estudiante_id
      ORDER BY m.grado, m.seccion, u.apellido
    `);
    return resultado.recordset;
  },

  async listarEstudiantesDisponibles() {
    await poolConnect;
    const resultado = await pool.request().query(`
      SELECT id, usuario, nombre, apellido
      FROM Usuarios
      WHERE rol = 'estudiante' AND activo = 1
      ORDER BY apellido, nombre
    `);
    return resultado.recordset;
  },

  async listarSecciones() {
    await poolConnect;
    const resultado = await pool.request().query(`
      SELECT DISTINCT grado, seccion
      FROM Matriculas
      ORDER BY grado, seccion
    `);
    return resultado.recordset;
  },

  async buscarDuplicada({ estudiante_id, grado, seccion }) {
    await poolConnect;
    const resultado = await pool.request()
      .input('estudiante_id', sql.Int, estudiante_id)
      .input('grado', sql.VarChar, grado)
      .input('seccion', sql.VarChar, seccion)
      .query(`SELECT id FROM Matriculas WHERE estudiante_id = @estudiante_id AND grado = @grado AND seccion = @seccion`);
    return resultado.recordset;
  },

  async crear({ estudiante_id, grado, seccion }) {
    await poolConnect;
    await pool.request()
      .input('estudiante_id', sql.Int, estudiante_id)
      .input('grado', sql.VarChar, grado)
      .input('seccion', sql.VarChar, seccion)
      .query(`INSERT INTO Matriculas (estudiante_id, grado, seccion) VALUES (@estudiante_id, @grado, @seccion)`);
  },

  async obtenerDetallePorId(id) {
    await poolConnect;
    const resultado = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT m.id, m.grado, m.seccion, u.nombre AS en, u.apellido AS ea
        FROM Matriculas m
        JOIN Usuarios u ON u.id = m.estudiante_id
        WHERE m.id = @id
      `);
    return resultado.recordset[0] || null;
  },

  async eliminar(id) {
    await poolConnect;
    await pool.request()
      .input('id', sql.Int, id)
      .query(`DELETE FROM Matriculas WHERE id = @id`);
  },
};

module.exports = MatriculaModel;

