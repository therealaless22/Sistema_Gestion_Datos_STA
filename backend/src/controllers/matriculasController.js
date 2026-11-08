// =============================================
// SANTO TOMÁS DE AQUINO — Matrículas Controller
// =============================================

const MatriculaModel = require('../models/MatriculaModel');
const { registrarActividad } = require('../middlewares/logger');
const { validarMatricula } = require('../utils/validadores');
const Vista = require('../utils/httpResponse');

async function listarMatriculas(req, res) {
  try {
    const matriculas = await MatriculaModel.listarTodas();
    return Vista.ok(res, { matriculas });
  } catch (error) {
    console.error('Error al listar matrículas:', error);
    return Vista.errorServidor(res);
  }
}

async function listarEstudiantesDisponibles(req, res) {
  try {
    const estudiantes = await MatriculaModel.listarEstudiantesDisponibles();
    return Vista.ok(res, { estudiantes });
  } catch (error) {
    console.error('Error al listar estudiantes:', error);
    return Vista.errorServidor(res);
  }
}

async function listarSecciones(req, res) {
  try {
    const secciones = await MatriculaModel.listarSecciones();
    return Vista.ok(res, { secciones });
  } catch (error) {
    console.error('Error al listar secciones:', error);
    return Vista.errorServidor(res);
  }
}

async function crearMatricula(req, res) {
  const errorValidacion = validarMatricula(req.body || {});
  if (errorValidacion) {
    return Vista.errorValidacion(res, errorValidacion);
  }

  const { grado, seccion, estudiante_id } = req.body;

  try {
    const existente = await MatriculaModel.buscarDuplicada({ estudiante_id, grado, seccion });
    if (existente.length > 0) {
      return Vista.conflicto(res, 'El estudiante ya está matriculado en ese grado y sección.');
    }

    await MatriculaModel.crear({ estudiante_id, grado, seccion });

    const detalle = `Matriculado en ${grado} "${seccion}"`;
    registrarActividad(req.usuario.id, 'matricula_crear', detalle);

    return Vista.creado(res, 'Matrícula creada correctamente.');
  } catch (error) {
    console.error('Error al crear matrícula:', error);
    return Vista.errorServidor(res);
  }
}

async function eliminarMatricula(req, res) {
  const { id } = req.params;

  try {
    const m = await MatriculaModel.obtenerDetallePorId(id);
    await MatriculaModel.eliminar(id);

    if (m) {
      const detalle = `${m.en} ${m.ea} dado de baja de ${m.grado} "${m.seccion}"`;
      registrarActividad(req.usuario.id, 'matricula_eliminar', detalle);
    }

    return Vista.ok(res, { mensaje: 'Matrícula eliminada correctamente.' });
  } catch (error) {
    console.error('Error al eliminar matrícula:', error);
    return Vista.errorServidor(res);
  }
}

module.exports = {
  listarMatriculas,
  listarEstudiantesDisponibles,
  listarSecciones,
  crearMatricula,
  eliminarMatricula,
};

