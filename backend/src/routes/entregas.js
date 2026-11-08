// =============================================
// SANTO TOMÁS DE AQUINO — Rutas de Entregas
// =============================================

const express = require('express');
const router  = express.Router();
const upload  = require('../config/multer');

const { entregarTarea, calificarEntrega } = require('../controllers/entregasController');
const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');
const { validarBody, validarParamId } = require('../middlewares/validationMiddleware');
const { validarEntregarTarea, validarCalificarEntrega } = require('../utils/validadores');

// Estudiante — entregar tarea
router.post(
  '/',
  verificarToken,
  verificarRol('estudiante'),
  upload.single('archivo'),
  validarBody(validarEntregarTarea),
  entregarTarea
);

// Profesor — calificar entrega
router.put(
  '/:id/calificar',
  verificarToken,
  verificarRol('profesor'),
  validarParamId('id'),
  validarBody(validarCalificarEntrega),
  calificarEntrega
);
router.patch(
  '/:id/calificar',
  verificarToken,
  verificarRol('profesor'),
  validarParamId('id'),
  validarBody(validarCalificarEntrega),
  calificarEntrega
);

module.exports = router;

