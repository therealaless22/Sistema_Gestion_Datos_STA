// =============================================
// SANTO TOMÁS DE AQUINO — Reportes Controller
// =============================================

const ReporteModel = require('../models/ReporteModel');
const Vista = require('../utils/httpResponse');

// ---------------------------------------------
// GET /api/reportes
// Devuelve todos los datos para los reportes
// ---------------------------------------------
async function obtenerReportes(req, res) {
  try {
    const datos = await ReporteModel.obtenerEstadisticasGenerales();
    return Vista.ok(res, datos);
  } catch (error) {
    console.error('Error al obtener reportes:', error);
    return Vista.errorServidor(res);
  }
}

module.exports = { obtenerReportes };

