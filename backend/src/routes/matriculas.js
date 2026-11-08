// =============================================
// SANTO TOMÁS DE AQUINO — Rutas de Matrículas
// =============================================

const express = require('express');
const router = express.Router();

const {
  listarMatriculas,
  listarEstudiantesDisponibles,
  listarSecciones,
  crearMatricula,
  eliminarMatricula,
} = require('../controllers/matriculasController');

const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');
const { validarBody, validarParamId } = require('../middlewares/validationMiddleware');
const { validarMatricula } = require('../utils/validadores');

router.use(verificarToken, verificarRol('administrador'));

router.get('/', listarMatriculas);
router.get('/estudiantes', listarEstudiantesDisponibles);
router.get('/secciones', listarSecciones);
router.post('/', validarBody(validarMatricula), crearMatricula);
router.delete('/:id', validarParamId('id'), eliminarMatricula);

module.exports = router;

