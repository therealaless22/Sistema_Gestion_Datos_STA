// =============================================
// SANTO TOMÁS DE AQUINO — Reglas de Validación
// Validadores reutilizables para POST, PUT y PATCH
// =============================================

const ROLES_VALIDOS = ['estudiante', 'profesor', 'administrador'];
const DESTINOS_COMUNICADO = ['estudiantes', 'profesores', 'todos'];
const ESTADOS_ASISTENCIA = [
  'asistio',
  'tardanza',
  'falta',
  'falta_justificada',
  'tardanza_justificada',
];

/**
 * Valida un elemento individual del lote de notas (CU-14).
 */
function validarItemNota(item) {
  if (!item || typeof item !== 'object' || Array.isArray(item)) {
    return 'El elemento de nota es nulo o inválido.';
  }
  const { nota_id, estudiante_id, horario_id, nota, periodo } = item;
  const valorNota = typeof nota === 'number' ? nota : Number(nota);

  if (
    nota === null ||
    nota === undefined ||
    (typeof nota === 'string' && nota.trim() === '') ||
    Number.isNaN(valorNota)
  ) {
    return 'La calificación debe ser un valor numérico.';
  }
  if (valorNota < 0 || valorNota > 20) {
    return 'La calificación debe estar en el rango de 0 a 20.';
  }
  if (!nota_id) {
    if (!horario_id || !estudiante_id) {
      return 'Faltan identificadores obligatorios (horario o estudiante).';
    }
    if (typeof periodo !== 'string' || periodo.trim() === '') {
      return 'El período académico es obligatorio.';
    }
  }
  return null;
}

/**
 * Valida el lote completo de notas.
 */
function validarLoteNotas(body = {}) {
  const { notas } = body;
  if (!Array.isArray(notas) || notas.length === 0) {
    return 'No se recibieron notas para guardar.';
  }
  for (const item of notas) {
    const error = validarItemNota(item);
    if (error) return error;
  }
  return null;
}

/**
 * Valida credenciales de inicio de sesión.
 */
function validarLogin(body = {}) {
  const { usuario, password } = body;
  if (!usuario || !password || String(usuario).trim() === '' || String(password).trim() === '') {
    return 'El usuario y la contraseña son obligatorios.';
  }
  return null;
}

/**
 * Valida creación de usuario.
 */
function validarCrearUsuario(body = {}) {
  const { usuario, password, nombre, apellido, rol, anio } = body;
  if (!usuario || !password || !nombre || !apellido || !rol) {
    return 'Usuario, contraseña, nombre, apellido y rol son obligatorios.';
  }
  if (!ROLES_VALIDOS.includes(rol)) {
    return 'Rol no válido.';
  }
  if (rol === 'estudiante' && !anio) {
    return 'El año es obligatorio para un estudiante.';
  }
  return null;
}

/**
 * Valida edición de usuario.
 */
function validarEditarUsuario(body = {}) {
  const { usuario, nombre, apellido, rol, anio } = body;
  if (!usuario || !nombre || !apellido || !rol) {
    return 'Usuario, nombre, apellido y rol son obligatorios.';
  }
  if (!ROLES_VALIDOS.includes(rol)) {
    return 'Rol no válido.';
  }
  if (rol === 'estudiante' && !anio) {
    return 'El año es obligatorio para un estudiante.';
  }
  return null;
}

/**
 * Valida creación/edición de curso.
 */
function validarCurso(body = {}) {
  const { nombre } = body;
  if (!nombre || String(nombre).trim() === '') {
    return 'El nombre del curso es obligatorio.';
  }
  return null;
}

/**
 * Valida creación/edición de horario.
 */
const DIAS_VALIDOS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
const REGEX_HORA = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;

function validarHorario(body = {}) {
  const { curso_id, anio, dia, hora_inicio, hora_fin } = body;
  if (!curso_id || !anio || !dia || !hora_inicio || !hora_fin) {
    return 'Curso, año, día, hora inicio y hora fin son obligatorios.';
  }
  if (typeof dia !== 'string' || !DIAS_VALIDOS.includes(dia)) {
    return 'El día no es válido.';
  }
  if (!REGEX_HORA.test(String(hora_inicio)) || !REGEX_HORA.test(String(hora_fin))) {
    return 'El formato de hora no es válido (HH:MM).';
  }
  return null;
}

/**
 * Valida creación/edición de comunicado.
 */
function validarComunicado(body = {}, esCreacion = true) {
  const { titulo, contenido, dirigido_a } = body;
  if (!titulo || !contenido || !dirigido_a) {
    return 'Título, contenido y dirigido_a son obligatorios.';
  }
  if (esCreacion && !DESTINOS_COMUNICADO.includes(dirigido_a)) {
    return 'Valor de dirigido_a no válido.';
  }
  return null;
}

/**
 * Valida lote de asistencia.
 */
function validarAsistencia(body = {}) {
  const { asistencias } = body;
  if (!Array.isArray(asistencias) || asistencias.length === 0) {
    return 'No se recibieron asistencias.';
  }
  for (const item of asistencias) {
    if (!item || typeof item !== 'object') {
      return 'Cada registro de asistencia debe ser un objeto válido.';
    }
    if (item.estado && !ESTADOS_ASISTENCIA.includes(item.estado)) {
      return 'Estado de asistencia no válido.';
    }
  }
  return null;
}

/**
 * Valida actualización de datos del colegio.
 */
function validarConfigColegio(body = {}) {
  if (!body.colegio_nombre || String(body.colegio_nombre).trim() === '') {
    return 'El nombre del colegio es obligatorio.';
  }
  return null;
}

/**
 * Valida actualización de perfil.
 */
const REGEX_NOMBRE = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s'\-]{1,100}$/;

function validarConfigPerfil(body = {}) {
  const { nombre, apellido } = body;
  if (!nombre || !apellido) {
    return 'Nombre y apellido son obligatorios.';
  }
  if (typeof nombre !== 'string' || typeof apellido !== 'string'
    || !REGEX_NOMBRE.test(nombre.trim()) || !REGEX_NOMBRE.test(apellido.trim())) {
    return 'Nombre y apellido solo pueden tener letras (máx. 100 caracteres).';
  }
  return null;
}

/**
 * Valida cambio de contraseña.
 */
function validarCambioPassword(body = {}) {
  const { password_actual, password_nueva } = body;
  if (!password_actual || !password_nueva) {
    return 'Ambas contraseñas son obligatorias.';
  }
  if (String(password_nueva).length < 6) {
    return 'La nueva contraseña debe tener al menos 6 caracteres.';
  }
  return null;
}

/**
 * Valida creación de tarea.
 */
function validarCrearTarea(body = {}) {
  const { horario_id, titulo } = body;
  if (!horario_id || !titulo?.trim()) {
    return 'Curso y título son obligatorios.';
  }
  return null;
}

/**
 * Valida edición de tarea.
 */
function validarEditarTarea(body = {}) {
  const { titulo } = body;
  if (!titulo?.trim()) {
    return 'El título es obligatorio.';
  }
  return null;
}

/**
 * Valida entrega de tarea por estudiante.
 */
function validarEntregarTarea(body = {}) {
  if (!body.tarea_id) {
    return 'tarea_id es obligatorio.';
  }
  return null;
}

/**
 * Valida calificación de entrega por profesor.
 */
function validarCalificarEntrega(body = {}) {
  const { nota } = body;
  if (nota === undefined || nota === null || String(nota).trim() === '') {
    return 'La nota es obligatoria.';
  }
  if (typeof nota !== 'number' && !/^\d{1,2}(\.\d{1,2})?$/.test(String(nota).trim())) {
    return 'La nota debe ser un número válido.';
  }
  const notaNum = Number(nota);
  if (!Number.isFinite(notaNum) || notaNum < 0 || notaNum > 20) {
    return 'La nota debe estar entre 0 y 20.';
  }
  return null;
}

/**
 * Valida creación de matrícula.
 */
function validarMatricula(body = {}) {
  const { grado, seccion, estudiante_id } = body;
  if (!grado || !seccion || !estudiante_id) {
    return 'Grado, sección y estudiante son obligatorios.';
  }
  return null;
}

/**
 * Valida envío de mensaje.
 */
function validarMensaje(body = {}) {
  const { destinatario_id, mensaje } = body;
  if (!destinatario_id || !mensaje?.trim()) {
    return 'Destinatario y mensaje son obligatorios.';
  }
  return null;
}

module.exports = {
  validarItemNota,
  validarLoteNotas,
  validarLogin,
  validarCrearUsuario,
  validarEditarUsuario,
  validarCurso,
  validarHorario,
  validarComunicado,
  validarAsistencia,
  validarConfigColegio,
  validarConfigPerfil,
  validarCambioPassword,
  validarCrearTarea,
  validarEditarTarea,
  validarEntregarTarea,
  validarCalificarEntrega,
  validarMatricula,
  validarMensaje,
};

