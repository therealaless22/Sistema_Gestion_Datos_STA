// =============================================
// SANTO TOMÁS DE AQUINO — Rutas de Tareas
// =============================================

const express = require('express');
const router  = express.Router();
const upload  = require('../config/multer');

const {
  misTareas,
  crearTarea,
  editarTarea,
  eliminarTarea,
  verEntregas,
  misTareasEstudiante,
  revisionTareasAdmin,
} = require('../controllers/tareasController');
const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');
const { validarBody, validarParamId } = require('../middlewares/validationMiddleware');
const { validarCrearTarea, validarEditarTarea } = require('../utils/validadores');

router.use(verificarToken);

// Estudiante — solo lectura de tareas de sus cursos
router.get('/mis-tareas-estudiante', verificarRol('estudiante'), misTareasEstudiante);

// Administrador — revisión de cumplimiento de tareas por profesor/curso/mes
router.get('/admin', verificarRol('administrador'), revisionTareasAdmin);

// Profesor — gestión de tareas
router.use(verificarRol('profesor'));

router.get('/',             misTareas);
router.post('/',            upload.single('archivo'), validarBody(validarCrearTarea), crearTarea);
router.put('/:id',          validarParamId('id'), upload.single('archivo'), validarBody(validarEditarTarea), editarTarea);
router.patch('/:id',        validarParamId('id'), upload.single('archivo'), validarBody(validarEditarTarea), editarTarea);
router.delete('/:id',       validarParamId('id'), eliminarTarea);
router.get('/:id/entregas', validarParamId('id'), verEntregas);

module.exports = router;

