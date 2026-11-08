// =============================================
// SANTO TOMÁS DE AQUINO — Notas Controller
// Las notas se gestionan por bloque de horario
// (curso + año + profesor), no solo por curso.
// =============================================

const NotaModel = require('../models/NotaModel');
const NotaService = require('../services/notaService');
const { registrarActividad } = require('../middlewares/logger');
const { validarItemNota } = require('../utils/validadores');
const Vista = require('../utils/httpResponse');

// ---------------------------------------------
// GET /api/notas?horario_id=X&periodo=Y
// Notas existentes de un bloque de horario en un período
// (solo del profesor dueño del bloque)
// ---------------------------------------------
async function obtenerNotas(req, res) {
  const { horario_id, periodo } = req.query;

  if (!horario_id || !periodo) {
    return Vista.errorValidacion(res, 'horario_id y periodo son obligatorios.');
  }

  try {
    const verificacion = await NotaModel.verificarHorarioProfesor(horario_id, req.usuario.id);
    if (!verificacion.length) {
      return Vista.prohibido(res, 'No tienes acceso a este bloque de horario.');
    }

    const notas = await NotaModel.obtenerPorHorarioYPeriodo(horario_id, periodo);
    return Vista.ok(res, { notas });
  } catch (error) {
    console.error('Error al obtener notas:', error);
    return Vista.errorServidor(res);
  }
}

// ---------------------------------------------
// POST /api/notas/guardar
// Crea o actualiza notas en lote
// Body: { notas: [{ nota_id, estudiante_id, horario_id, nota, periodo, observacion }] }
// ---------------------------------------------
async function guardarNotas(req, res) {
  const { notas } = req.body || {};
  if (!Array.isArray(notas) || notas.length === 0) {
    return Vista.errorValidacion(res, 'No se recibieron notas para guardar.');
  }

  // Etapa Refactor: validar la integridad de todo el lote antes de consultar SQL
  for (const item of notas) {
    const errorValidacion = validarItemNota(item);
    if (errorValidacion) {
      return Vista.errorValidacion(res, errorValidacion);
    }
  }

  try {
    const resultado = await NotaService.procesarLoteNotas(notas, req.usuario.id);
    if (!resultado.ok) {
      return res.status(resultado.codigo).json({ mensaje: resultado.mensaje });
    }

    registrarActividad(
      req.usuario.id,
      'notas.guardar',
      `${notas.length} nota(s) guardadas - bloque #${notas[0].horario_id} ${notas[0].periodo}`
    );

    return Vista.ok(res, { mensaje: `${notas.length} nota(s) guardadas correctamente.` });
  } catch (error) {
    console.error('Error al guardar notas:', error);
    return Vista.errorServidor(res);
  }
}

// ---------------------------------------------
// GET /api/notas/mis-cursos
// Bloques de horario correspondientes al año del estudiante
// (para el selector en "Mis notas")
// ---------------------------------------------
async function misCursosEstudiante(req, res) {
  try {
    const cursos = await NotaModel.obtenerCursosEstudiante(req.usuario.id);
    return Vista.ok(res, { cursos });
  } catch (error) {
    console.error('Error al obtener cursos del estudiante:', error);
    return Vista.errorServidor(res);
  }
}

// ---------------------------------------------
// GET /api/notas/mis-notas?horario_id=X
// Notas del estudiante logueado en un bloque (todos los periodos)
// ---------------------------------------------
async function misNotasEstudiante(req, res) {
  const { horario_id } = req.query;

  if (!horario_id) {
    return Vista.errorValidacion(res, 'horario_id es obligatorio.');
  }

  try {
    const verificacion = await NotaModel.verificarAccesoEstudianteHorario(horario_id, req.usuario.id);
    if (!verificacion.length) {
      return Vista.prohibido(res, 'No tienes acceso a ese curso.');
    }

    const notas = await NotaModel.obtenerNotasEstudiante(horario_id, req.usuario.id);
    return Vista.ok(res, { notas });
  } catch (error) {
    console.error('Error al obtener notas del estudiante:', error);
    return Vista.errorServidor(res);
  }
}

module.exports = {
  obtenerNotas,
  guardarNotas,
  misCursosEstudiante,
  misNotasEstudiante,
  validarItemNota,
};

