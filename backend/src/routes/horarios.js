// =============================================
// SANTO TOMÁS DE AQUINO — Rutas de Horarios
// =============================================

const express = require('express');
const router  = express.Router();

const {
  listarHorarios, miHorario, miHorarioEstudiante,
  crearHorario, editarHorario, eliminarHorario,
} = require('../controllers/horariosController');

const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');
const { validarBody, validarParamId } = require('../middlewares/validationMiddleware');
const { validarHorario } = require('../utils/validadores');

// Profesor — solo lectura
router.get('/mi-horario', verificarToken, verificarRol('profesor'), miHorario);

// Estudiante — solo lectura
router.get('/mi-horario-estudiante', verificarToken, verificarRol('estudiante'), miHorarioEstudiante);

// Admin — CRUD completo
router.use(verificarToken, verificarRol('administrador'));
router.get('/',       listarHorarios);
router.post('/',      validarBody(validarHorario), crearHorario);
router.put('/:id',    validarParamId('id'), validarBody(validarHorario), editarHorario);
router.patch('/:id',  validarParamId('id'), validarBody(validarHorario), editarHorario);
router.delete('/:id', validarParamId('id'), eliminarHorario);

module.exports = router;

