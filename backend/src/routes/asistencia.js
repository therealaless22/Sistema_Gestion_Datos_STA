// =============================================
// SANTO TOMÁS DE AQUINO — Rutas de Asistencia
// =============================================

const express = require('express');
const router  = express.Router();

const { obtenerAsistencia, guardarAsistencia, miResumenAsistencia } = require('../controllers/asistenciaController');
const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');
const { validarBody } = require('../middlewares/validationMiddleware');
const { validarAsistencia } = require('../utils/validadores');

router.use(verificarToken);

// Estudiante — resumen de su propia asistencia
router.get('/mi-resumen', verificarRol('estudiante'), miResumenAsistencia);

// Profesor — gestión de asistencia
router.use(verificarRol('profesor'));

router.get('/',         obtenerAsistencia);
router.post('/guardar', validarBody(validarAsistencia), guardarAsistencia);

module.exports = router;

