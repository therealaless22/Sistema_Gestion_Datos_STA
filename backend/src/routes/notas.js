// =============================================
// SANTO TOMÁS DE AQUINO — Rutas de Notas
// =============================================

const express = require('express');
const router  = express.Router();

const {
  obtenerNotas,
  guardarNotas,
  misCursosEstudiante,
  misNotasEstudiante,
} = require('../controllers/notasController');
const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');
const { validarBody } = require('../middlewares/validationMiddleware');
const { validarLoteNotas } = require('../utils/validadores');

router.use(verificarToken);

// Estudiante — solo lectura
router.get('/mis-cursos', verificarRol('estudiante'), misCursosEstudiante);
router.get('/mis-notas',  verificarRol('estudiante'), misNotasEstudiante);

// Profesor — gestión de notas
router.get('/',         verificarRol('profesor'), obtenerNotas);
router.post('/guardar', verificarRol('profesor'), validarBody(validarLoteNotas), guardarNotas);

module.exports = router;

