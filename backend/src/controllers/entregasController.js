// =============================================
// SANTO TOMÁS DE AQUINO — Entregas Controller
// (usado por el estudiante y calificado por el profesor)
// =============================================

const EntregaModel = require('../models/EntregaModel');
const { registrarActividad } = require('../middlewares/logger');
const { validarEntregarTarea, validarCalificarEntrega } = require('../utils/validadores');
const Vista = require('../utils/httpResponse');

// ---------------------------------------------
// POST /api/entregas
// Alumno entrega su evidencia
// ---------------------------------------------
async function entregarTarea(req, res) {
  const errorValidacion = validarEntregarTarea(req.body || {});
  if (errorValidacion) {
    return Vista.errorValidacion(res, errorValidacion);
  }

  const { tarea_id, comentario } = req.body;
  const archivo_url = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    // Verificar que el alumno pertenece al año correspondiente a esa tarea
    const verificacion = await EntregaModel.verificarAccesoEstudiante(tarea_id, req.usuario.id);
    if (!verificacion.length) {
      return Vista.prohibido(res, 'No puedes entregar esta tarea.');
    }

    // Verificar si ya entregó
    const yaEntrego = await EntregaModel.buscarPorTareaYEstudiante(tarea_id, req.usuario.id);

    if (yaEntrego.length) {
      await EntregaModel.actualizarEntrega({
        tarea_id,
        estudiante_id: req.usuario.id,
        comentario,
        archivo_url,
      });
    } else {
      await EntregaModel.insertarEntrega({
        tarea_id,
        estudiante_id: req.usuario.id,
        comentario,
        archivo_url,
      });
    }

    registrarActividad(req.usuario.id, 'tarea_entregar', `Tarea #${tarea_id}`);

    return Vista.ok(res, { mensaje: 'Tarea entregada correctamente.' });
  } catch (error) {
    console.error('Error al entregar tarea:', error);
    return Vista.errorServidor(res);
  }
}

// ---------------------------------------------
// PUT /api/entregas/:id/calificar
// Profesor califica una entrega (escala 0-20)
// ---------------------------------------------
async function calificarEntrega(req, res) {
  const { id } = req.params;
  const errorValidacion = validarCalificarEntrega(req.body || {});
  if (errorValidacion) {
    return Vista.errorValidacion(res, errorValidacion);
  }

  const notaNum = Number(req.body.nota);

  try {
    const verificacion = await EntregaModel.verificarPropiedadProfesor(id, req.usuario.id);
    if (!verificacion.length) {
      return Vista.prohibido(res, 'No puedes calificar esta entrega.');
    }

    await EntregaModel.calificar(id, notaNum);

    registrarActividad(req.usuario.id, 'entrega_calificar', `Entrega #${id} — nota ${notaNum}`);

    return Vista.ok(res, { mensaje: 'Nota guardada correctamente.' });
  } catch (error) {
    console.error('Error al calificar entrega:', error);
    return Vista.errorServidor(res);
  }
}

module.exports = { entregarTarea, calificarEntrega };

