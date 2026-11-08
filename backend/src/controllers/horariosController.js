// =============================================
// SANTO TOMÁS DE AQUINO — Horarios Controller
// Aquí se define la asignación real: curso +
// profesor + año + día + hora.
// =============================================

const HorarioModel = require('../models/HorarioModel');
const { registrarActividad } = require('../middlewares/logger');
const { validarHorario } = require('../utils/validadores');
const Vista = require('../utils/httpResponse');

// ---------------------------------------------
// GET /api/horarios
// Lista todos los bloques de horario (admin)
// ---------------------------------------------
async function listarHorarios(req, res) {
  try {
    const horarios = await HorarioModel.listarTodos();
    return Vista.ok(res, { horarios });
  } catch (error) {
    console.error('Error al listar horarios:', error);
    return Vista.errorServidor(res);
  }
}

// ---------------------------------------------
// GET /api/horarios/mi-horario
// Horario del profesor logueado (sus bloques asignados)
// ---------------------------------------------
async function miHorario(req, res) {
  try {
    const horarios = await HorarioModel.listarPorProfesor(req.usuario.id);
    return Vista.ok(res, { horarios });
  } catch (error) {
    console.error('Error al obtener horario del profesor:', error);
    return Vista.errorServidor(res);
  }
}

// ---------------------------------------------
// GET /api/horarios/mi-horario-estudiante
// Horario del estudiante logueado, según su año
// ---------------------------------------------
async function miHorarioEstudiante(req, res) {
  try {
    const horarios = await HorarioModel.listarPorEstudiante(req.usuario.id);
    return Vista.ok(res, { horarios });
  } catch (error) {
    console.error('Error al obtener horario del estudiante:', error);
    return Vista.errorServidor(res);
  }
}

// ---------------------------------------------
// POST /api/horarios
// Crear bloque de horario (admin): curso + profesor + año + día + hora
// ---------------------------------------------
async function crearHorario(req, res) {
  const errorValidacion = validarHorario(req.body || {});
  if (errorValidacion) {
    return Vista.errorValidacion(res, errorValidacion);
  }

  const { curso_id, profesor_id, anio, dia, hora_inicio, hora_fin } = req.body;

  try {
    const conflicto = await HorarioModel.buscarConflicto({
      curso_id,
      anio,
      dia,
      hora_inicio,
      hora_fin,
    });

    if (conflicto.length) {
      return Vista.errorValidacion(res, 'Ya existe un bloque en ese horario para este curso y año.');
    }

    await HorarioModel.crear({
      curso_id,
      profesor_id,
      anio,
      dia,
      hora_inicio,
      hora_fin,
    });

    registrarActividad(req.usuario.id, 'horario_crear', `${dia} ${hora_inicio}-${hora_fin} curso #${curso_id} - ${anio}`);

    return Vista.creado(res, 'Bloque de horario creado correctamente.');
  } catch (error) {
    console.error('Error al crear horario:', error);
    return Vista.errorServidor(res);
  }
}

// ---------------------------------------------
// PUT /api/horarios/:id
// Editar bloque de horario (admin)
// ---------------------------------------------
async function editarHorario(req, res) {
  const { id } = req.params;
  const errorValidacion = validarHorario(req.body || {});
  if (errorValidacion) {
    return Vista.errorValidacion(res, errorValidacion);
  }

  const { curso_id, profesor_id, anio, dia, hora_inicio, hora_fin } = req.body;

  try {
    await HorarioModel.actualizar(id, {
      curso_id,
      profesor_id,
      anio,
      dia,
      hora_inicio,
      hora_fin,
    });

    registrarActividad(req.usuario.id, 'horario_editar', `Bloque #${id}`);

    return Vista.ok(res, { mensaje: 'Horario actualizado correctamente.' });
  } catch (error) {
    console.error('Error al editar horario:', error);
    return Vista.errorServidor(res);
  }
}

// ---------------------------------------------
// DELETE /api/horarios/:id
// Eliminar bloque (admin)
// ---------------------------------------------
async function eliminarHorario(req, res) {
  const { id } = req.params;

  try {
    await HorarioModel.eliminar(id);

    registrarActividad(req.usuario.id, 'horario_eliminar', `Bloque #${id}`);

    return Vista.ok(res, { mensaje: 'Bloque eliminado correctamente.' });
  } catch (error) {
    console.error('Error al eliminar horario:', error);
    return Vista.errorServidor(res);
  }
}

module.exports = {
  listarHorarios,
  miHorario,
  miHorarioEstudiante,
  crearHorario,
  editarHorario,
  eliminarHorario,
};

