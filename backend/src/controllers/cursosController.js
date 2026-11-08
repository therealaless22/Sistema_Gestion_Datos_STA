// =============================================
// SANTO TOMÁS DE AQUINO — Cursos Controller
// Un curso es solo una materia (nombre).
// El profesor, el año, día y hora se asignan en Horarios.
// =============================================

const CursoModel = require('../models/CursoModel');
const UsuarioModel = require('../models/UsuarioModel');
const { registrarActividad } = require('../middlewares/logger');
const { validarCurso } = require('../utils/validadores');
const Vista = require('../utils/httpResponse');

// ---------------------------------------------
// GET /api/cursos
// Lista todos los cursos (solo id + nombre)
// ---------------------------------------------
async function listarCursos(req, res) {
  try {
    const cursos = await CursoModel.listarTodos();
    return Vista.ok(res, { cursos });
  } catch (error) {
    console.error('Error al listar cursos:', error);
    return Vista.errorServidor(res);
  }
}

// ---------------------------------------------
// GET /api/cursos/profesores
// Lista usuarios con rol profesor (para el select de Horarios)
// ---------------------------------------------
async function listarProfesores(req, res) {
  try {
    const profesores = await UsuarioModel.listarProfesoresActivos();
    return Vista.ok(res, { profesores });
  } catch (error) {
    console.error('Error al listar profesores:', error);
    return Vista.errorServidor(res);
  }
}

// ---------------------------------------------
// GET /api/cursos/anios
// Lista los años existentes (de los estudiantes ya registrados),
// para el select de Horarios al asignar un bloque
// ---------------------------------------------
async function listarAnios(req, res) {
  try {
    const anios = await UsuarioModel.listarAniosEstudiantes();
    return Vista.ok(res, { anios });
  } catch (error) {
    console.error('Error al listar años:', error);
    return Vista.errorServidor(res);
  }
}

// ---------------------------------------------
// POST /api/cursos
// Crea un nuevo curso (solo nombre)
// ---------------------------------------------
async function crearCurso(req, res) {
  const errorValidacion = validarCurso(req.body || {});
  if (errorValidacion) {
    return Vista.errorValidacion(res, errorValidacion);
  }

  const { nombre } = req.body;

  try {
    await CursoModel.crear(nombre);

    registrarActividad(req.usuario.id, 'curso_crear', nombre);

    return Vista.creado(res, 'Curso creado correctamente.');
  } catch (error) {
    console.error('Error al crear curso:', error);
    return Vista.errorServidor(res);
  }
}

// ---------------------------------------------
// PUT /api/cursos/:id
// Edita un curso existente (solo nombre)
// ---------------------------------------------
async function editarCurso(req, res) {
  const { id } = req.params;
  const errorValidacion = validarCurso(req.body || {});
  if (errorValidacion) {
    return Vista.errorValidacion(res, errorValidacion);
  }

  const { nombre } = req.body;

  try {
    await CursoModel.actualizar(id, nombre);

    registrarActividad(req.usuario.id, 'curso_editar', `${nombre} (#${id})`);

    return Vista.ok(res, { mensaje: 'Curso actualizado correctamente.' });
  } catch (error) {
    console.error('Error al editar curso:', error);
    return Vista.errorServidor(res);
  }
}

// ---------------------------------------------
// DELETE /api/cursos/:id
// Elimina un curso
// ---------------------------------------------
async function eliminarCurso(req, res) {
  const { id } = req.params;

  try {
    await CursoModel.eliminar(id);

    registrarActividad(req.usuario.id, 'curso_eliminar', `Curso #${id}`);

    return Vista.ok(res, { mensaje: 'Curso eliminado correctamente.' });
  } catch (error) {
    console.error('Error al eliminar curso:', error);

    // Si tiene horarios asociados, SQL Server lanzará error de FK
    if (error.number === 547) {
      return Vista.conflicto(res, 'No se puede eliminar: este curso tiene horarios asignados.');
    }

    return Vista.errorServidor(res);
  }
}

// ---------------------------------------------
// GET /api/cursos/mis-cursos
// Bloques de horario (curso + año) asignados al profesor logueado
// ---------------------------------------------
async function listarMisCursos(req, res) {
  try {
    const cursos = await CursoModel.listarPorProfesor(req.usuario.id);
    return Vista.ok(res, { cursos });
  } catch (error) {
    console.error('Error al listar cursos del profesor:', error);
    return Vista.errorServidor(res);
  }
}

// ---------------------------------------------
// GET /api/cursos/horario/:horario_id/alumnos
// Alumnos del año correspondiente a un bloque de horario específico
// ---------------------------------------------
async function listarAlumnosDeHorario(req, res) {
  const { horario_id } = req.params;

  try {
    const alumnos = await CursoModel.listarAlumnosPorHorario(horario_id);
    return Vista.ok(res, { alumnos });
  } catch (error) {
    console.error('Error al listar alumnos del bloque de horario:', error);
    return Vista.errorServidor(res);
  }
}

module.exports = {
  listarCursos,
  listarProfesores,
  listarAnios,
  crearCurso,
  editarCurso,
  eliminarCurso,
  listarMisCursos,
  listarAlumnosDeHorario,
};

