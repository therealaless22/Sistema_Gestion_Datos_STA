// =============================================
// SANTO TOMÁS DE AQUINO — Enrutador Principal API
// =============================================

const express = require('express');
const router = express.Router();

router.use('/',              require('./auth'));
router.use('/usuarios',      require('./usuarios'));
router.use('/cursos',        require('./cursos'));
router.use('/configuracion', require('./configuracion'));
router.use('/reportes',      require('./reportes'));
router.use('/comunicados',   require('./comunicados'));
router.use('/actividades',   require('./actividades'));
router.use('/notas',         require('./notas'));
router.use('/asistencia',    require('./asistencia'));
router.use('/mensajes',      require('./mensajes'));
router.use('/tareas',        require('./tareas'));
router.use('/entregas',      require('./entregas'));
router.use('/horarios',      require('./horarios'));
router.use('/matriculas',    require('./matriculas'));

module.exports = router;

