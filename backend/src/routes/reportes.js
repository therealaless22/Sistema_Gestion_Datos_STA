// =============================================
// SANTO TOMÁS DE AQUINO — Rutas de Reportes
// =============================================

const express = require('express');
const router = express.Router();
const { obtenerReportes } = require('../controllers/reportesController');
const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');

router.use(verificarToken, verificarRol('administrador'));
router.get('/', obtenerReportes);

module.exports = router;

