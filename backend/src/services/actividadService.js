// =============================================
// SANTO TOMÁS DE AQUINO — Servicio de Auditoría
// =============================================

const ActividadModel = require('../models/ActividadModel');

async function registrarActividad(usuario_id, accion, detalle) {
  try {
    await ActividadModel.crear(usuario_id, accion, detalle);
  } catch (error) {
    console.error('Error al registrar actividad:', error);
  }
}

module.exports = { registrarActividad };

