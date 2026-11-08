// =============================================
// SANTO TOMÁS DE AQUINO — Rutas de Usuarios
// Solo accesibles por administrador
// =============================================

const express = require('express');
const router = express.Router();

const {
  listarUsuarios,
  crearUsuario,
  editarUsuario,
  eliminarUsuario,
} = require('../controllers/usuariosController');

const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');
const { validarBody, validarParamId } = require('../middlewares/validationMiddleware');
const { validarCrearUsuario, validarEditarUsuario } = require('../utils/validadores');

// Todas las rutas requieren token + rol administrador
router.use(verificarToken, verificarRol('administrador'));

router.get('/', listarUsuarios);
router.post('/', validarBody(validarCrearUsuario), crearUsuario);
router.put('/:id', validarParamId('id'), validarBody(validarEditarUsuario), editarUsuario);
router.patch('/:id', validarParamId('id'), validarBody(validarEditarUsuario), editarUsuario);
router.delete('/:id', validarParamId('id'), eliminarUsuario);

module.exports = router;

