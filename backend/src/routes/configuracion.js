// =============================================
// SANTO TOMÁS DE AQUINO — Rutas de Configuración
// =============================================

const express = require('express');
const router = express.Router();

const {
  obtenerConfiguracion,
  actualizarColegio,
  actualizarPerfil,
  cambiarPassword,
} = require('../controllers/configuracionController');

const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');
const { validarBody } = require('../middlewares/validationMiddleware');
const {
  validarConfigColegio,
  validarConfigPerfil,
  validarCambioPassword,
} = require('../utils/validadores');

router.use(verificarToken, verificarRol('administrador'));

router.get('/', obtenerConfiguracion);
router.put('/colegio', validarBody(validarConfigColegio), actualizarColegio);
router.patch('/colegio', validarBody(validarConfigColegio), actualizarColegio);
router.put('/perfil', validarBody(validarConfigPerfil), actualizarPerfil);
router.patch('/perfil', validarBody(validarConfigPerfil), actualizarPerfil);
router.put('/password', validarBody(validarCambioPassword), cambiarPassword);
router.patch('/password', validarBody(validarCambioPassword), cambiarPassword);

module.exports = router;

