// =============================================
// SANTO TOMÁS DE AQUINO — Tareas Controller
// Las tareas se crean sobre un bloque de horario
// (curso + año + profesor), no solo sobre un curso.
// =============================================

const TareaModel = require('../models/TareaModel');
const { eliminarArchivoPublico } = require('../services/archivoService');
const { registrarActividad } = require('../middlewares/logger');
const { validarCrearTarea, validarEditarTarea } = require('../utils/validadores');
const Vista = require('../utils/httpResponse');

// ---------------------------------------------
// GET /api/tareas
// Tareas creadas por el profesor logueado
// ---------------------------------------------
async function misTareas(req, res) {
  try {
    const tareas = await TareaModel.listarPorProfesor(req.usuario.id);
    return Vista.ok(res, { tareas });
  } catch (error) {
    console.error('Error al listar tareas:', error);
    return Vista.errorServidor(res);
  }
}

// ---------------------------------------------
// POST /api/tareas
// Crear nueva tarea sobre un bloque de horario
// ---------------------------------------------
async function crearTarea(req, res) {
  const errorValidacion = validarCrearTarea(req.body || {});
  if (errorValidacion) {
    return Vista.errorValidacion(res, errorValidacion);
  }

  const { horario_id, titulo, descripcion, fecha_entrega, solo_indicaciones } = req.body;
  const archivo_url = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const verificacion = await TareaModel.verificarHorarioProfesor(horario_id, req.usuario.id);
    if (!verificacion.length) {
      return Vista.prohibido(res, 'No puedes crear tareas en ese curso.');
    }

    await TareaModel.crear({
      horario_id,
      titulo,
      descripcion,
      fecha_entrega,
      archivo_url,
      solo_indicaciones,
    });

    registrarActividad(req.usuario.id, 'tarea_crear', titulo.trim());

    return Vista.creado(res, 'Tarea creada correctamente.');
  } catch (error) {
    console.error('Error al crear tarea:', error);
    return Vista.errorServidor(res);
  }
}

// ---------------------------------------------
// PUT /api/tareas/:id
// Editar tarea existente
// ---------------------------------------------
async function editarTarea(req, res) {
  const { id } = req.params;
  const errorValidacion = validarEditarTarea(req.body || {});
  if (errorValidacion) {
    return Vista.errorValidacion(res, errorValidacion);
  }

  const { titulo, descripcion, fecha_entrega, solo_indicaciones } = req.body;
  const archivo_url = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const verificacion = await TareaModel.verificarPropiedadTarea(id, req.usuario.id);
    if (!verificacion.length) {
      return Vista.prohibido(res, 'No puedes editar esta tarea.');
    }

    if (archivo_url && verificacion[0].archivo_url) {
      eliminarArchivoPublico(verificacion[0].archivo_url);
    }

    await TareaModel.actualizar(id, {
      titulo,
      descripcion,
      fecha_entrega,
      solo_indicaciones,
      archivo_url,
    });

    registrarActividad(req.usuario.id, 'tarea_editar', `Tarea #${id} — ${titulo}`);

    return Vista.ok(res, { mensaje: 'Tarea actualizada correctamente.' });
  } catch (error) {
    console.error('Error al editar tarea:', error);
    return Vista.errorServidor(res);
  }
}

// ---------------------------------------------
// DELETE /api/tareas/:id
// Eliminar tarea
// ---------------------------------------------
async function eliminarTarea(req, res) {
  const { id } = req.params;

  try {
    const verificacion = await TareaModel.verificarPropiedadTarea(id, req.usuario.id);
    if (!verificacion.length) {
      return Vista.prohibido(res, 'No puedes eliminar esta tarea.');
    }

    if (verificacion[0].archivo_url) {
      eliminarArchivoPublico(verificacion[0].archivo_url);
    }

    await TareaModel.eliminarConEntregas(id);

    registrarActividad(req.usuario.id, 'tarea_eliminar', `Tarea #${id}`);

    return Vista.ok(res, { mensaje: 'Tarea eliminada correctamente.' });
  } catch (error) {
    console.error('Error al eliminar tarea:', error);
    return Vista.errorServidor(res);
  }
}

// ---------------------------------------------
// GET /api/tareas/:id/entregas
// Ver entregas de alumnos por tarea
// ---------------------------------------------
async function verEntregas(req, res) {
  const { id } = req.params;

  try {
    const verificacion = await TareaModel.verificarPropiedadTarea(id, req.usuario.id);
    if (!verificacion.length) {
      return Vista.prohibido(res, 'Acceso denegado.');
    }

    const entregas = await TareaModel.listarEntregasDeTarea(id);

    return Vista.ok(res, {
      tarea: { id: verificacion[0].id, titulo: verificacion[0].titulo },
      entregas,
    });
  } catch (error) {
    console.error('Error al ver entregas:', error);
    return Vista.errorServidor(res);
  }
}

// ---------------------------------------------
// GET /api/tareas/mis-tareas-estudiante
// Tareas de los cursos correspondientes al año del estudiante
// ---------------------------------------------
async function misTareasEstudiante(req, res) {
  try {
    const tareas = await TareaModel.listarPorEstudiante(req.usuario.id);
    return Vista.ok(res, { tareas });
  } catch (error) {
    console.error('Error al listar tareas del estudiante:', error);
    return Vista.errorServidor(res);
  }
}

// ---------------------------------------------
// GET /api/tareas/admin
// Revisión de administración por mes/año
// ---------------------------------------------
async function revisionTareasAdmin(req, res) {
  const { curso_id, anio, mes, anio_calendario } = req.query;

  const hoy = new Date();
  const mesFiltro  = mes             ? parseInt(mes, 10)             : (hoy.getMonth() + 1);
  const anioFiltro = anio_calendario ? parseInt(anio_calendario, 10) : hoy.getFullYear();

  try {
    const { resumen, tareas } = await TareaModel.obtenerRevisionAdmin({
      curso_id,
      anio,
      mesFiltro,
      anioFiltro,
    });

    return Vista.ok(res, {
      mes: mesFiltro,
      anio_calendario: anioFiltro,
      resumen,
      tareas,
    });
  } catch (error) {
    console.error('Error en revisión de tareas (admin):', error);
    return Vista.errorServidor(res);
  }
}

module.exports = {
  misTareas,
  crearTarea,
  editarTarea,
  eliminarTarea,
  verEntregas,
  misTareasEstudiante,
  revisionTareasAdmin,
};

