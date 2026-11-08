// =============================================
// SANTO TOMÁS DE AQUINO — Rutas de Actividades
// =============================================

const express = require('express');
const router = express.Router();

const { listarActividades } = require('../controllers/actividadesController');
const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');

router.use(verificarToken, verificarRol('administrador'));

router.get('/', listarActividades);

module.exports = router;

