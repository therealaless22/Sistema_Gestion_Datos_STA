// =============================================
// SANTO TOMÁS DE AQUINO — Modelo de Comunicados
// Consultas SQL parametrizadas sobre Comunicados
// =============================================

const { pool, poolConnect, sql } = require('../config/db');

const ComunicadoModel = {
  async listarTodos() {
    await poolConnect;
    const resultado = await pool.request().query(`
      SELECT
        c.id, c.titulo, c.contenido, c.dirigido_a, c.activo, c.creado_en,
        u.nombre   AS autor_nombre,
        u.apellido AS autor_apellido
      FROM Comunicados c
      JOIN Usuarios u ON u.id = c.autor_id
      ORDER BY c.creado_en DESC
    `);
    return resultado.recordset;
  },

  async listarPorRol(rol) {
    await poolConnect;
    const resultado = await pool.request()
      .input('rol', sql.VarChar, rol)
      .query(`
        SELECT
          c.id, c.titulo, c.contenido, c.dirigido_a, c.creado_en,
          u.nombre   AS autor_nombre,
          u.apellido AS autor_apellido
        FROM Comunicados c
        JOIN Usuarios u ON u.id = c.autor_id
        WHERE c.activo = 1
          AND (c.dirigido_a = 'todos' OR c.dirigido_a = @rol)
        ORDER BY c.creado_en DESC
      `);
    return resultado.recordset;
  },

  async crear({ titulo, contenido, dirigido_a, autor_id }) {
    await poolConnect;
    await pool.request()
      .input('titulo', sql.VarChar, titulo)
      .input('contenido', sql.NVarChar(sql.MAX), contenido)
      .input('dirigido_a', sql.VarChar, dirigido_a)
      .input('autor_id', sql.Int, autor_id)
      .query(`
        INSERT INTO Comunicados (titulo, contenido, dirigido_a, autor_id)
        VALUES (@titulo, @contenido, @dirigido_a, @autor_id)
      `);
  },

  async actualizar(id, { titulo, contenido, dirigido_a, activo }) {
    await poolConnect;
    await pool.request()
      .input('id', sql.Int, id)
      .input('titulo', sql.VarChar, titulo)
      .input('contenido', sql.NVarChar(sql.MAX), contenido)
      .input('dirigido_a', sql.VarChar, dirigido_a)
      .input('activo', sql.Bit, activo === undefined ? 1 : (activo ? 1 : 0))
      .query(`
        UPDATE Comunicados
        SET titulo = @titulo,
            contenido = @contenido,
            dirigido_a = @dirigido_a,
            activo = @activo
        WHERE id = @id
      `);
  },

  async eliminar(id) {
    await poolConnect;
    await pool.request()
      .input('id', sql.Int, id)
      .query(`DELETE FROM Comunicados WHERE id = @id`);
  },
};

module.exports = ComunicadoModel;

