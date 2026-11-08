// =============================================
// SANTO TOMÁS DE AQUINO — Asistencia Controller
// La asistencia se gestiona por bloque de horario
// (curso + año + profesor), no solo por curso.
// =============================================

const AsistenciaModel = require('../models/AsistenciaModel');
const { registrarActividad } = require('../middlewares/logger');
const { validarAsistencia } = require('../utils/validadores');
const Vista = require('../utils/httpResponse');

// ---------------------------------------------
// GET /api/asistencia?horario_id=X&fecha=YYYY-MM-DD
// ---------------------------------------------
async function obtenerAsistencia(req, res) {
  const { horario_id, fecha } = req.query;

  if (!horario_id || !fecha) {
    return Vista.errorValidacion(res, 'horario_id y fecha son obligatorios.');
  }

  try {
    const asistencias = await AsistenciaModel.obtenerPorHorarioYFecha(horario_id, fecha);
    return Vista.ok(res, { asistencias });
  } catch (error) {
    console.error('Error al obtener asistencia:', error);
    return Vista.errorServidor(res);
  }
}

// ---------------------------------------------
// POST /api/asistencia/guardar
// Crea o actualiza asistencias en lote
// ---------------------------------------------
async function guardarAsistencia(req, res) {
  const errorValidacion = validarAsistencia(req.body || {});
  if (errorValidacion) {
    return Vista.errorValidacion(res, errorValidacion);
  }

  const { asistencias } = req.body;

  try {
    for (const item of asistencias) {
      const { asistencia_id, estudiante_id, horario_id, fecha, estado, observacion } = item;

      if (asistencia_id) {
        await AsistenciaModel.actualizar(asistencia_id, estado, observacion);
      } else {
        await AsistenciaModel.insertar({ estudiante_id, horario_id, fecha, estado, observacion });
      }
    }

    registrarActividad(
      req.usuario.id,
      'asistencia_guardar',
      `${asistencias.length} registro(s) — bloque #${asistencias[0].horario_id} — ${asistencias[0].fecha}`
    );

    return Vista.ok(res, {
      mensaje: `Asistencia de ${asistencias.length} alumno(s) guardada correctamente.`,
    });
  } catch (error) {
    console.error('Error al guardar asistencia:', error);
    return Vista.errorServidor(res);
  }
}

// ---------------------------------------------
// GET /api/asistencia/mi-resumen
// Totales de asistencia del estudiante logueado
// ---------------------------------------------
async function miResumenAsistencia(req, res) {
  try {
    const filas = await AsistenciaModel.resumenPorEstudiante(req.usuario.id);

    const resumen = {
      asistio: 0,
      tardanza: 0,
      falta: 0,
      falta_justificada: 0,
      tardanza_justificada: 0,
    };

    filas.forEach((fila) => {
      if (Object.prototype.hasOwnProperty.call(resumen, fila.estado)) {
        resumen[fila.estado] = fila.total;
      }
    });

    const totalRegistros = Object.values(resumen).reduce((a, b) => a + b, 0);

    return Vista.ok(res, { resumen, total_registros: totalRegistros });
  } catch (error) {
    console.error('Error al obtener resumen de asistencia:', error);
    return Vista.errorServidor(res);
  }
}

module.exports = { obtenerAsistencia, guardarAsistencia, miResumenAsistencia };

