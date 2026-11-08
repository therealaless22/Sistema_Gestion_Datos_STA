// =============================================
// SANTO TOMÁS DE AQUINO — Modelo de Tareas
// Consultas SQL parametrizadas sobre Tareas
// =============================================

const { pool, poolConnect, sql } = require('../config/db');

const TareaModel = {
  async listarPorProfesor(profesor_id) {
    await poolConnect;
    const resultado = await pool.request()
      .input('profesor_id', sql.Int, profesor_id)
      .query(`
        SELECT
          t.id, t.titulo, t.descripcion,
          t.fecha_entrega, t.creado_en,
          t.archivo_url, t.solo_indicaciones,
          c.nombre   AS curso_nombre,
          h.anio,
          h.id       AS horario_id
        FROM Tareas t
        JOIN Horarios h ON h.id = t.horario_id
        JOIN Cursos c   ON c.id = h.curso_id
        WHERE h.profesor_id = @profesor_id
        ORDER BY t.creado_en DESC
      `);
    return resultado.recordset;
  },

  async verificarHorarioProfesor(horario_id, profesor_id) {
    await poolConnect;
    const resultado = await pool.request()
      .input('horario_id', sql.Int, horario_id)
      .input('profesor_id', sql.Int, profesor_id)
      .query(`SELECT id FROM Horarios WHERE id = @horario_id AND profesor_id = @profesor_id`);
    return resultado.recordset;
  },

  async crear({ horario_id, titulo, descripcion, fecha_entrega, archivo_url, solo_indicaciones }) {
    await poolConnect;
    await pool.request()
      .input('horario_id', sql.Int, horario_id)
      .input('titulo', sql.VarChar, titulo.trim())
      .input('descripcion', sql.VarChar, descripcion?.trim() || null)
      .input('fecha_entrega', sql.Date, fecha_entrega || null)
      .input('archivo_url', sql.VarChar, archivo_url)
      .input('solo_indicaciones', sql.Bit, solo_indicaciones === 'true' || solo_indicaciones === true ? 1 : 0)
      .query(`
        INSERT INTO Tareas (horario_id, titulo, descripcion, fecha_entrega, archivo_url, solo_indicaciones)
        VALUES (@horario_id, @titulo, @descripcion, @fecha_entrega, @archivo_url, @solo_indicaciones)
      `);
  },

  async verificarPropiedadTarea(id, profesor_id) {
    await poolConnect;
    const resultado = await pool.request()
      .input('id', sql.Int, id)
      .input('profesor_id', sql.Int, profesor_id)
      .query(`
        SELECT t.id, t.titulo, t.archivo_url
        FROM Tareas t
        JOIN Horarios h ON h.id = t.horario_id
        WHERE t.id = @id AND h.profesor_id = @profesor_id
      `);
    return resultado.recordset;
  },

  async actualizar(id, { titulo, descripcion, fecha_entrega, solo_indicaciones, archivo_url }) {
    await poolConnect;
    await pool.request()
      .input('id', sql.Int, id)
      .input('titulo', sql.VarChar, titulo.trim())
      .input('descripcion', sql.VarChar, descripcion?.trim() || null)
      .input('fecha_entrega', sql.Date, fecha_entrega || null)
      .input('solo_indicaciones', sql.Bit, solo_indicaciones === 'true' || solo_indicaciones === true ? 1 : 0)
      .input('archivo_url', sql.VarChar, archivo_url)
      .query(`
        UPDATE Tareas SET
          titulo            = @titulo,
          descripcion       = @descripcion,
          fecha_entrega     = @fecha_entrega,
          solo_indicaciones = @solo_indicaciones
          ${archivo_url ? ', archivo_url = @archivo_url' : ''}
        WHERE id = @id
      `);
  },

  async eliminarConEntregas(id) {
    await poolConnect;
    await pool.request()
      .input('tarea_id', sql.Int, id)
      .query(`DELETE FROM Entregas WHERE tarea_id = @tarea_id`);

    await pool.request()
      .input('id', sql.Int, id)
      .query(`DELETE FROM Tareas WHERE id = @id`);
  },

  async listarEntregasDeTarea(tarea_id) {
    await poolConnect;
    const resultado = await pool.request()
      .input('tarea_id', sql.Int, tarea_id)
      .query(`
        SELECT
          u.id          AS estudiante_id,
          u.nombre      AS estudiante_nombre,
          u.apellido    AS estudiante_apellido,
          e.id          AS entrega_id,
          e.archivo_url AS entrega_archivo,
          e.comentario  AS entrega_comentario,
          e.nota,
          e.entregado_en
        FROM Tareas t
        JOIN Horarios h ON h.id = t.horario_id
        JOIN Usuarios u ON u.anio = h.anio AND u.rol = 'estudiante'
        LEFT JOIN Entregas e ON e.tarea_id = @tarea_id AND e.estudiante_id = u.id
        WHERE t.id = @tarea_id AND u.activo = 1
        ORDER BY u.apellido, u.nombre
      `);
    return resultado.recordset;
  },

  async listarPorEstudiante(estudiante_id) {
    await poolConnect;
    const resultado = await pool.request()
      .input('estudiante_id', sql.Int, estudiante_id)
      .query(`
        SELECT
          t.id, t.titulo, t.descripcion,
          t.fecha_entrega, t.creado_en,
          t.archivo_url, t.solo_indicaciones,
          c.nombre   AS curso_nombre,
          h.anio,
          h.id       AS horario_id,
          e.id          AS entrega_id,
          e.archivo_url AS entrega_archivo,
          e.comentario  AS entrega_comentario,
          e.nota,
          e.entregado_en
        FROM Tareas t
        JOIN Horarios h ON h.id = t.horario_id
        JOIN Cursos c   ON c.id = h.curso_id
        JOIN Usuarios est ON est.id = @estudiante_id AND est.anio = h.anio
        LEFT JOIN Entregas e ON e.tarea_id = t.id AND e.estudiante_id = @estudiante_id
        ORDER BY t.creado_en DESC
      `);
    return resultado.recordset;
  },

  async obtenerRevisionAdmin({ curso_id, anio, mesFiltro, anioFiltro }) {
    await poolConnect;

    const requestResumen = pool.request()
      .input('mes', sql.Int, mesFiltro)
      .input('anioCal', sql.Int, anioFiltro);

    const condicionesResumen = [];
    if (curso_id) {
      requestResumen.input('curso_id', sql.Int, curso_id);
      condicionesResumen.push('c.id = @curso_id');
    }
    if (anio) {
      requestResumen.input('anio', sql.VarChar, anio);
      condicionesResumen.push('h.anio = @anio');
    }
    const whereResumen = condicionesResumen.length ? `WHERE ${condicionesResumen.join(' AND ')}` : '';

    const resumen = await requestResumen.query(`
      SELECT
        h.id         AS horario_id,
        c.id         AS curso_id,
        c.nombre     AS curso_nombre,
        h.anio,
        p.id         AS profesor_id,
        p.nombre     AS profesor_nombre,
        p.apellido   AS profesor_apellido,
        COUNT(t.id)  AS total_tareas
      FROM Horarios h
      JOIN Cursos c     ON c.id = h.curso_id
      LEFT JOIN Usuarios p ON p.id = h.profesor_id
      LEFT JOIN Tareas t ON t.horario_id = h.id
        AND MONTH(t.creado_en) = @mes
        AND YEAR(t.creado_en)  = @anioCal
      ${whereResumen}
      GROUP BY h.id, c.id, c.nombre, h.anio, p.id, p.nombre, p.apellido
      ORDER BY p.apellido, p.nombre, c.nombre
    `);

    const requestDetalle = pool.request()
      .input('mesD', sql.Int, mesFiltro)
      .input('anioCalD', sql.Int, anioFiltro);

    const condicionesDetalle = ['MONTH(t.creado_en) = @mesD', 'YEAR(t.creado_en) = @anioCalD'];
    if (curso_id) {
      requestDetalle.input('curso_id2', sql.Int, curso_id);
      condicionesDetalle.push('c.id = @curso_id2');
    }
    if (anio) {
      requestDetalle.input('anio2', sql.VarChar, anio);
      condicionesDetalle.push('h.anio = @anio2');
    }
    const whereDetalle = `WHERE ${condicionesDetalle.join(' AND ')}`;

    const detalle = await requestDetalle.query(`
      SELECT
        t.id, t.titulo, t.descripcion, t.creado_en, t.fecha_entrega,
        t.archivo_url, t.solo_indicaciones,
        c.nombre     AS curso_nombre,
        h.anio,
        p.nombre     AS profesor_nombre,
        p.apellido   AS profesor_apellido
      FROM Tareas t
      JOIN Horarios h ON h.id = t.horario_id
      JOIN Cursos c   ON c.id = h.curso_id
      LEFT JOIN Usuarios p ON p.id = h.profesor_id
      ${whereDetalle}
      ORDER BY t.creado_en DESC
    `);

    return {
      resumen: resumen.recordset,
      tareas: detalle.recordset,
    };
  },
};

module.exports = TareaModel;

