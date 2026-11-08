// =============================================
// SANTO TOMÁS DE AQUINO — Modelo de Usuarios
// Consultas SQL parametrizadas sobre Usuarios
// =============================================

const { pool, poolConnect, sql } = require('../config/db');

const UsuarioModel = {
  async buscarPorCredencial(usuarioOCorreo) {
    await poolConnect;
    const resultado = await pool.request()
      .input('usuario', sql.VarChar, usuarioOCorreo)
      .query(`
        SELECT id, usuario, correo, password, nombre, apellido, rol, activo
        FROM   Usuarios
        WHERE  usuario = @usuario
           OR  correo  = @usuario
      `);
    return resultado.recordset[0] || null;
  },

  async listarTodos() {
    await poolConnect;
    const resultado = await pool.request().query(`
      SELECT id, usuario, correo, nombre, apellido, rol, anio, activo, creado_en
      FROM Usuarios
      ORDER BY id ASC
    `);
    return resultado.recordset;
  },

  async listarProfesoresActivos() {
    await poolConnect;
    const resultado = await pool.request().query(`
      SELECT id, nombre, apellido
      FROM Usuarios
      WHERE rol = 'profesor' AND activo = 1
      ORDER BY nombre ASC
    `);
    return resultado.recordset;
  },

  async listarAniosEstudiantes() {
    await poolConnect;
    const resultado = await pool.request().query(`
      SELECT DISTINCT anio
      FROM Usuarios
      WHERE rol = 'estudiante' AND anio IS NOT NULL AND anio <> ''
      ORDER BY anio ASC
    `);
    return resultado.recordset.map((r) => r.anio);
  },

  async verificarDuplicado(usuario, correo, excluirId = null) {
    await poolConnect;
    const request = pool.request()
      .input('usuario', sql.VarChar, usuario)
      .input('correo', sql.VarChar, correo || null);

    let query = `
      SELECT id FROM Usuarios
      WHERE (usuario = @usuario OR (correo IS NOT NULL AND correo = @correo))
    `;

    if (excluirId !== null) {
      request.input('id', sql.Int, excluirId);
      query += ` AND id <> @id`;
    }

    const resultado = await request.query(query);
    return resultado.recordset;
  },

  async crear({ usuario, passwordHash, nombre, apellido, correo, rol, anio }) {
    await poolConnect;
    await pool.request()
      .input('usuario', sql.VarChar, usuario)
      .input('password', sql.VarChar, passwordHash)
      .input('nombre', sql.VarChar, nombre)
      .input('apellido', sql.VarChar, apellido)
      .input('correo', sql.VarChar, correo || null)
      .input('rol', sql.VarChar, rol)
      .input('anio', sql.VarChar, rol === 'estudiante' ? anio : null)
      .query(`
        INSERT INTO Usuarios (usuario, password, nombre, apellido, correo, rol, anio, activo)
        VALUES (@usuario, @password, @nombre, @apellido, @correo, @rol, @anio, 1)
      `);
  },

  async actualizar(id, { usuario, passwordHash, nombre, apellido, correo, rol, anio, activo }) {
    await poolConnect;
    let query = `
      UPDATE Usuarios
      SET usuario = @usuario,
          nombre = @nombre,
          apellido = @apellido,
          correo = @correo,
          rol = @rol,
          anio = @anio,
          activo = @activo
    `;

    const request = pool.request()
      .input('id', sql.Int, id)
      .input('usuario', sql.VarChar, usuario)
      .input('nombre', sql.VarChar, nombre)
      .input('apellido', sql.VarChar, apellido)
      .input('correo', sql.VarChar, correo || null)
      .input('rol', sql.VarChar, rol)
      .input('anio', sql.VarChar, rol === 'estudiante' ? anio : null)
      .input('activo', sql.Bit, activo === undefined ? 1 : (activo ? 1 : 0));

    if (passwordHash) {
      query += `, password = @password`;
      request.input('password', sql.VarChar, passwordHash);
    }

    query += ` WHERE id = @id`;
    await request.query(query);
  },

  async eliminar(id) {
    await poolConnect;
    await pool.request()
      .input('id', sql.Int, id)
      .query(`DELETE FROM Usuarios WHERE id = @id`);
  },

  async actualizarPerfil(id, nombre, apellido) {
    await poolConnect;
    await pool.request()
      .input('id', sql.Int, id)
      .input('nombre', sql.VarChar, nombre)
      .input('apellido', sql.VarChar, apellido)
      .query(`
        UPDATE Usuarios SET nombre = @nombre, apellido = @apellido WHERE id = @id
      `);
  },

  async obtenerPasswordPorId(id) {
    await poolConnect;
    const resultado = await pool.request()
      .input('id', sql.Int, id)
      .query(`SELECT password FROM Usuarios WHERE id = @id`);
    return resultado.recordset[0] || null;
  },

  async actualizarPassword(id, nuevoHash) {
    await poolConnect;
    await pool.request()
      .input('id', sql.Int, id)
      .input('password', sql.VarChar, nuevoHash)
      .query(`UPDATE Usuarios SET password = @password WHERE id = @id`);
  },
};

module.exports = UsuarioModel;

