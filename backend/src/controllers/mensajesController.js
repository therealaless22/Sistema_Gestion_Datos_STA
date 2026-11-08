// =============================================
// SANTO TOMÁS DE AQUINO — Mensajes Controller
// =============================================

const MensajeModel = require('../models/MensajeModel');
const { registrarActividad } = require('../middlewares/logger');
const { validarMensaje } = require('../utils/validadores');
const Vista = require('../utils/httpResponse');

// ---------------------------------------------
// GET /api/mensajes/enviados
// Historial de mensajes enviados por el profesor
// ---------------------------------------------
async function mensajesEnviados(req, res) {
  try {
    const mensajes = await MensajeModel.listarEnviados(req.usuario.id);
    return Vista.ok(res, { mensajes });
  } catch (error) {
    console.error('Error al obtener mensajes:', error);
    return Vista.errorServidor(res);
  }
}

// ---------------------------------------------
// POST /api/mensajes/enviar
// Enviar mensaje a un alumno
// ---------------------------------------------
async function enviarMensaje(req, res) {
  const errorValidacion = validarMensaje(req.body || {});
  if (errorValidacion) {
    return Vista.errorValidacion(res, errorValidacion);
  }

  const { destinatario_id, asunto, mensaje } = req.body;

  try {
    const verificacion = await MensajeModel.verificarRelacionProfesorEstudiante(
      req.usuario.id,
      destinatario_id
    );

    if (!verificacion.length) {
      return Vista.prohibido(res, 'No puedes enviar mensajes a ese alumno.');
    }

    await MensajeModel.crear({
      remitente_id: req.usuario.id,
      destinatario_id,
      asunto,
      mensaje,
    });

    registrarActividad(
      req.usuario.id,
      'mensaje_enviar',
      `Para alumno #${destinatario_id} — "${asunto || 'Sin asunto'}"`
    );

    return Vista.creado(res, 'Mensaje enviado correctamente.');
  } catch (error) {
    console.error('Error al enviar mensaje:', error);
    return Vista.errorServidor(res);
  }
}

// ---------------------------------------------
// DELETE /api/mensajes/:id
// Eliminar un mensaje (solo el remitente)
// ---------------------------------------------
async function eliminarMensaje(req, res) {
  const { id } = req.params;

  try {
    const verificacion = await MensajeModel.verificarRemitente(id, req.usuario.id);
    if (!verificacion.length) {
      return Vista.prohibido(res, 'No puedes eliminar este mensaje.');
    }

    await MensajeModel.eliminar(id);

    registrarActividad(req.usuario.id, 'mensaje_eliminar', `Mensaje #${id}`);

    return Vista.ok(res, { mensaje: 'Mensaje eliminado correctamente.' });
  } catch (error) {
    console.error('Error al eliminar mensaje:', error);
    return Vista.errorServidor(res);
  }
}

// ---------------------------------------------
// GET /api/mensajes/recibidos
// Mensajes recibidos por el estudiante logueado
// ---------------------------------------------
async function mensajesRecibidos(req, res) {
  try {
    const mensajes = await MensajeModel.listarRecibidosYMarcarLeidos(req.usuario.id);
    return Vista.ok(res, { mensajes });
  } catch (error) {
    console.error('Error al obtener mensajes recibidos:', error);
    return Vista.errorServidor(res);
  }
}

module.exports = { mensajesEnviados, enviarMensaje, eliminarMensaje, mensajesRecibidos };

