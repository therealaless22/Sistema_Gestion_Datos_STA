// =============================================
// SANTO TOMÁS DE AQUINO — Modelo de Configuración
// Consultas SQL parametrizadas sobre Configuracion
// =============================================

const { pool, poolConnect, sql } = require('../config/db');

const ConfiguracionModel = {
  async obtenerTodas() {
    await poolConnect;
    const resultado = await pool.request().query(`
      SELECT clave, valor FROM Configuracion
    `);
    return resultado.recordset;
  },

  async actualizarClave(clave, valor) {
    await poolConnect;
    await pool.request()
      .input('clave', sql.VarChar, clave)
      .input('valor', sql.VarChar, valor || '')
      .query(`
        UPDATE Configuracion SET valor = @valor WHERE clave = @clave
      `);
  },
};

module.exports = ConfiguracionModel;

