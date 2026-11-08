// =============================================
// SANTO TOMÁS DE AQUINO — Rutas de Auth y CSRF
// =============================================

const express = require('express');
const router  = express.Router();

const { login } = require('../controllers/authController');
const { verificarToken } = require('../middlewares/authMiddleware');
const { emitirCsrfToken } = require('../middlewares/csrfMiddleware');
const { validarBody } = require('../middlewares/validationMiddleware');
const { validarLogin } = require('../utils/validadores');

// ---------------------------------------------
// GET /api/csrf-token
// Emite token CSRF firmado (Double-Submit Cookie)
// ---------------------------------------------
router.get('/csrf-token', emitirCsrfToken);

// ---------------------------------------------
// POST /api/login
// Ruta pública — validada con reglas de entrada
// ---------------------------------------------
router.post('/login', validarBody(validarLogin), login);

// ---------------------------------------------
// GET /api/verificar
// Ruta protegida — verifica si el token sigue vigente
// ---------------------------------------------
router.get('/verificar', verificarToken, (req, res) => {
  return res.status(200).json({
    mensaje: 'Token válido.',
    usuario: req.usuario,
  });
});

module.exports = router;

