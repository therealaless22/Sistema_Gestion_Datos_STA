// =============================================
// SANTO TOMÁS DE AQUINO — Actividades Controller
// =============================================

const ActividadModel = require('../models/ActividadModel');
const Vista = require('../utils/httpResponse');

async function listarActividades(req, res) {
  try {
    const actividades = await ActividadModel.listarTodas();
    return Vista.ok(res, { actividades });
  } catch (error) {
    console.error('Error al listar actividades:', error);
    return Vista.errorServidor(res);
  }
}

module.exports = { listarActividades };

