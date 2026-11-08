// =============================================
// SANTO TOMÁS DE AQUINO — Usuarios Controller
// CRUD de usuarios (solo administrador)
// =============================================

const UsuarioModel = require('../models/UsuarioModel');
const AuthService = require('../services/authService');
const { registrarActividad } = require('../middlewares/logger');
const { validarCrearUsuario, validarEditarUsuario } = require('../utils/validadores');
const Vista = require('../utils/httpResponse');

// ---------------------------------------------
// GET /api/usuarios
// Lista todos los usuarios
// ---------------------------------------------
async function listarUsuarios(req, res) {
  try {
    const usuarios = await UsuarioModel.listarTodos();
    return Vista.ok(res, { usuarios });
  } catch (error) {
    console.error('Error al listar usuarios:', error);
    return Vista.errorServidor(res);
  }
}

// ---------------------------------------------
// POST /api/usuarios
// Crea un nuevo usuario
// ---------------------------------------------
async function crearUsuario(req, res) {
  const errorValidacion = validarCrearUsuario(req.body || {});
  if (errorValidacion) {
    return Vista.errorValidacion(res, errorValidacion);
  }

  const { usuario, password, nombre, apellido, correo, rol, anio } = req.body;

  try {
    const existente = await UsuarioModel.verificarDuplicado(usuario, correo);
    if (existente.length > 0) {
      return Vista.conflicto(res, 'El usuario o correo ya está registrado.');
    }

    const passwordHash = await AuthService.encriptarPassword(password);

    await UsuarioModel.crear({
      usuario,
      passwordHash,
      nombre,
      apellido,
      correo,
      rol,
      anio,
    });

    registrarActividad(req.usuario.id, 'usuario_crear', `${nombre} ${apellido} (${usuario} - ${rol})`);

    return Vista.creado(res, 'Usuario creado correctamente.');
  } catch (error) {
    console.error('Error al crear usuario:', error);
    return Vista.errorServidor(res);
  }
}

// ---------------------------------------------
// PUT /api/usuarios/:id
// Edita un usuario existente
// ---------------------------------------------
async function editarUsuario(req, res) {
  const { id } = req.params;
  const errorValidacion = validarEditarUsuario(req.body || {});
  if (errorValidacion) {
    return Vista.errorValidacion(res, errorValidacion);
  }

  const { usuario, password, nombre, apellido, correo, rol, activo, anio } = req.body;

  try {
    const existente = await UsuarioModel.verificarDuplicado(usuario, correo, id);
    if (existente.length > 0) {
      return Vista.conflicto(res, 'El usuario o correo ya está en uso por otra cuenta.');
    }

    let passwordHash = null;
    if (password && password.trim() !== '') {
      passwordHash = await AuthService.encriptarPassword(password);
    }

    await UsuarioModel.actualizar(id, {
      usuario,
      passwordHash,
      nombre,
      apellido,
      correo,
      rol,
      anio,
      activo,
    });

    registrarActividad(req.usuario.id, 'usuario_editar', `${nombre} ${apellido} (#${id})`);

    return Vista.ok(res, { mensaje: 'Usuario actualizado correctamente.' });
  } catch (error) {
    console.error('Error al editar usuario:', error);
    return Vista.errorServidor(res);
  }
}

// ---------------------------------------------
// DELETE /api/usuarios/:id
// Elimina un usuario
// ---------------------------------------------
async function eliminarUsuario(req, res) {
  const { id } = req.params;

  if (req.usuario && req.usuario.id == id) {
    return Vista.errorValidacion(res, 'No puedes eliminar tu propia cuenta.');
  }

  try {
    await UsuarioModel.eliminar(id);

    registrarActividad(req.usuario.id, 'usuario_eliminar', `Usuario #${id}`);

    return Vista.ok(res, { mensaje: 'Usuario eliminado correctamente.' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    return Vista.errorServidor(res);
  }
}

module.exports = {
  listarUsuarios,
  crearUsuario,
  editarUsuario,
  eliminarUsuario,
};

