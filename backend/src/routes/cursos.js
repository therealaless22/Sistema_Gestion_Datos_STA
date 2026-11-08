// =============================================
// SANTO TOMÁS DE AQUINO — Rutas de Cursos
// =============================================

const express = require('express');
const router  = express.Router();

const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');
const { validarBody, validarParamId } = require('../middlewares/validationMiddleware');
const { validarCurso } = require('../utils/validadores');

const {
  listarCursos,
  listarProfesores,
  listarAnios,
  crearCurso,
  editarCurso,
  eliminarCurso,
  listarMisCursos,
  listarAlumnosDeHorario,
} = require('../controllers/cursosController');

// ── Rutas del profesor ──
router.get('/mis-cursos', verificarToken, verificarRol('profesor'), listarMisCursos);
router.get('/horario/:horario_id/alumnos', verificarToken, verificarRol('profesor'), validarParamId('horario_id'), listarAlumnosDeHorario);

// ── Rutas solo administrador ──
router.use(verificarToken, verificarRol('administrador'));

router.get('/',           listarCursos);
router.get('/profesores', listarProfesores);
router.get('/anios',      listarAnios);
router.post('/',          validarBody(validarCurso), crearCurso);
router.put('/:id',        validarParamId('id'), validarBody(validarCurso), editarCurso);
router.patch('/:id',      validarParamId('id'), validarBody(validarCurso), editarCurso);
router.delete('/:id',     validarParamId('id'), eliminarCurso);

module.exports = router;

