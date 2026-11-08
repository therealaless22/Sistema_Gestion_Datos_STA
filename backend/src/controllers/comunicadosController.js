// =============================================
// SANTO TOMÁS DE AQUINO — Comunicados Controller
// =============================================

const ComunicadoModel = require('../models/ComunicadoModel');
const { registrarActividad } = require('../middlewares/logger');
const { validarComunicado } = require('../utils/validadores');
const Vista = require('../utils/httpResponse');

async function listarComunicados(req, res) {
  try {
    const comunicados = await ComunicadoModel.listarTodos();
    return Vista.ok(res, { comunicados });
  } catch (error) {
    console.error('Error al listar comunicados:', error);
    return Vista.errorServidor(res);
  }
}

async function crearComunicado(req, res) {
  const errorValidacion = validarComunicado(req.body || {}, true);
  if (errorValidacion) {
    return Vista.errorValidacion(res, errorValidacion);
  }

  const { titulo, contenido, dirigido_a } = req.body;

  try {
    await ComunicadoModel.crear({
      titulo,
      contenido,
      dirigido_a,
      autor_id: req.usuario.id,
    });

    registrarActividad(req.usuario.id, 'comunicado_crear', titulo);

    return Vista.creado(res, 'Comunicado creado correctamente.');
  } catch (error) {
    console.error('Error al crear comunicado:', error);
    return Vista.errorServidor(res);
  }
}

async function editarComunicado(req, res) {
  const { id } = req.params;
  const errorValidacion = validarComunicado(req.body || {}, false);
  if (errorValidacion) {
    return Vista.errorValidacion(res, errorValidacion);
  }

  const { titulo, contenido, dirigido_a, activo } = req.body;

  try {
    await ComunicadoModel.actualizar(id, { titulo, contenido, dirigido_a, activo });

    registrarActividad(req.usuario.id, 'comunicado_editar', `${titulo} (#${id})`);

    return Vista.ok(res, { mensaje: 'Comunicado actualizado correctamente.' });
  } catch (error) {
    console.error('Error al editar comunicado:', error);
    return Vista.errorServidor(res);
  }
}

async function eliminarComunicado(req, res) {
  const { id } = req.params;

  try {
    await ComunicadoModel.eliminar(id);

    registrarActividad(req.usuario.id, 'comunicado_eliminar', `Comunicado #${id}`);

    return Vista.ok(res, { mensaje: 'Comunicado eliminado correctamente.' });
  } catch (error) {
    console.error('Error al eliminar comunicado:', error);
    return Vista.errorServidor(res);
  }
}

async function listarMisComunicados(req, res) {
  try {
    const comunicados = await ComunicadoModel.listarPorRol(req.usuario.rol);
    return Vista.ok(res, { comunicados });
  } catch (error) {
    console.error('Error al listar comunicados:', error);
    return Vista.errorServidor(res);
  }
}

module.exports = {
  listarComunicados,
  listarMisComunicados,
  crearComunicado,
  editarComunicado,
  eliminarComunicado,
};

