// =============================================
// SANTO TOMÁS DE AQUINO — Modelo de Reportes
// Consultas SQL parametrizadas para estadísticas
// =============================================

const { pool, poolConnect } = require('../config/db');

const ReporteModel = {
  async obtenerEstadisticasGenerales() {
    await poolConnect;

    const porRol = await pool.request().query(`
      SELECT rol, COUNT(*) AS total
      FROM Usuarios
      GROUP BY rol
    `);

    const porEstado = await pool.request().query(`
      SELECT
        SUM(CASE WHEN activo = 1 THEN 1 ELSE 0 END) AS activos,
        SUM(CASE WHEN activo = 0 THEN 1 ELSE 0 END) AS inactivos
      FROM Usuarios
    `);

    const porGrado = await pool.request().query(`
      SELECT anio AS grado, COUNT(*) AS total
      FROM Usuarios
      WHERE rol = 'estudiante' AND anio IS NOT NULL
      GROUP BY anio
      ORDER BY anio ASC
    `);

    const totalCursosResult = await pool.request().query(`
      SELECT COUNT(*) AS total FROM Cursos
    `);

    const usuarios = await pool.request().query(`
      SELECT id, usuario, correo, nombre, apellido, rol,
             CASE WHEN activo = 1 THEN 'Activo' ELSE 'Inactivo' END AS estado,
             CONVERT(VARCHAR, creado_en, 103) AS creado_en
      FROM Usuarios
      ORDER BY id ASC
    `);

    return {
      porRol: porRol.recordset,
      porEstado: porEstado.recordset[0],
      porGrado: porGrado.recordset,
      totalCursos: totalCursosResult.recordset[0].total,
      usuarios: usuarios.recordset,
    };
  },
};

module.exports = ReporteModel;

