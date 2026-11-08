// =============================================
// SANTO TOMÁS DE AQUINO — Rutas de Comunicados
// =============================================

const express = require('express');
const router = express.Router();

const {
  listarComunicados,
  listarMisComunicados,
  crearComunicado,
  editarComunicado,
  eliminarComunicado,
} = require('../controllers/comunicadosController');

const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');
const { validarBody, validarParamId } = require('../middlewares/validationMiddleware');
const { validarComunicado } = require('../utils/validadores');

router.use(verificarToken);

router.get('/mis', listarMisComunicados);

router.use(verificarRol('administrador'));

router.get('/', listarComunicados);
router.post('/', validarBody((body) => validarComunicado(body, true)), crearComunicado);
router.put('/:id', validarParamId('id'), validarBody((body) => validarComunicado(body, false)), editarComunicado);
router.patch('/:id', validarParamId('id'), validarBody((body) => validarComunicado(body, false)), editarComunicado);
router.delete('/:id', validarParamId('id'), eliminarComunicado);

module.exports = router;

