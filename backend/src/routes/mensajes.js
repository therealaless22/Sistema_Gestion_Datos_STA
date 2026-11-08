// =============================================
// SANTO TOMÁS DE AQUINO — Rutas de Mensajes
// =============================================

const express = require('express');
const router  = express.Router();

const { mensajesEnviados, enviarMensaje, eliminarMensaje, mensajesRecibidos } = require('../controllers/mensajesController');
const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');
const { validarBody, validarParamId } = require('../middlewares/validationMiddleware');
const { validarMensaje } = require('../utils/validadores');

// Estudiante — ver mensajes recibidos
router.get('/recibidos', verificarToken, verificarRol('estudiante'), mensajesRecibidos);

// Profesor — gestión completa
router.use(verificarToken, verificarRol('profesor'));

router.get('/enviados', mensajesEnviados);
router.post('/enviar',  validarBody(validarMensaje), enviarMensaje);
router.delete('/:id',   validarParamId('id'), eliminarMensaje);

module.exports = router;

