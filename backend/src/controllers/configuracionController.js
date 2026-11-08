// =============================================
// SANTO TOMÁS DE AQUINO — Configuración Controller
// =============================================

const ConfiguracionModel = require('../models/ConfiguracionModel');
const UsuarioModel = require('../models/UsuarioModel');
const AuthService = require('../services/authService');
const { registrarActividad } = require('../middlewares/logger');
const {
  validarConfigColegio,
  validarConfigPerfil,
  validarCambioPassword,
} = require('../utils/validadores');
const Vista = require('../utils/httpResponse');

// ---------------------------------------------
// GET /api/configuracion
// Devuelve todos los valores de configuración
// ---------------------------------------------
async function obtenerConfiguracion(req, res) {
  try {
    const filas = await ConfiguracionModel.obtenerTodas();

    const config = {};
    filas.forEach((row) => {
      config[row.clave] = row.valor;
    });

    return Vista.ok(res, { config });
  } catch (error) {
    console.error('Error al obtener configuración:', error);
    return Vista.errorServidor(res);
  }
}

// ---------------------------------------------
// PUT /api/configuracion/colegio
// Actualiza datos del colegio
// ---------------------------------------------
async function actualizarColegio(req, res) {
  const errorValidacion = validarConfigColegio(req.body || {});
  if (errorValidacion) {
    return Vista.errorValidacion(res, errorValidacion);
  }

  const { colegio_nombre, colegio_direccion, colegio_telefono, colegio_email } = req.body;

  try {
    const datos = { colegio_nombre, colegio_direccion, colegio_telefono, colegio_email };

    for (const [clave, valor] of Object.entries(datos)) {
      await ConfiguracionModel.actualizarClave(clave, valor);
    }

    registrarActividad(req.usuario.id, 'config_colegio', 'Datos del colegio actualizados');

    return Vista.ok(res, { mensaje: 'Datos del colegio actualizados correctamente.' });
  } catch (error) {
    console.error('Error al actualizar colegio:', error);
    return Vista.errorServidor(res);
  }
}

// ---------------------------------------------
// PUT /api/configuracion/perfil
// Actualiza nombre y apellido del admin
// ---------------------------------------------
async function actualizarPerfil(req, res) {
  const errorValidacion = validarConfigPerfil(req.body || {});
  if (errorValidacion) {
    return Vista.errorValidacion(res, errorValidacion);
  }

  const { nombre, apellido } = req.body;
  const id = req.usuario.id;

  try {
    await UsuarioModel.actualizarPerfil(id, nombre, apellido);

    registrarActividad(req.usuario.id, 'config_perfil', `${nombre} ${apellido}`);

    return Vista.ok(res, { mensaje: 'Perfil actualizado correctamente.' });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    return Vista.errorServidor(res);
  }
}

// ---------------------------------------------
// PUT /api/configuracion/password
// Cambia la contraseña del admin
// ---------------------------------------------
async function cambiarPassword(req, res) {
  const errorValidacion = validarCambioPassword(req.body || {});
  if (errorValidacion) {
    return Vista.errorValidacion(res, errorValidacion);
  }

  const { password_actual, password_nueva } = req.body;
  const id = req.usuario.id;

  try {
    const registro = await UsuarioModel.obtenerPasswordPorId(id);

    if (!registro) {
      return Vista.noEncontrado(res, 'Usuario no encontrado.');
    }

    const coincide = await AuthService.compararPassword(password_actual, registro.password);
    if (!coincide) {
      return Vista.noAutenticado(res, 'La contraseña actual es incorrecta.');
    }

    const nuevoHash = await AuthService.encriptarPassword(password_nueva);
    await UsuarioModel.actualizarPassword(id, nuevoHash);

    registrarActividad(req.usuario.id, 'config_password', 'Contraseña cambiada');

    return Vista.ok(res, { mensaje: 'Contraseña actualizada correctamente.' });
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    return Vista.errorServidor(res);
  }
}

module.exports = {
  obtenerConfiguracion,
  actualizarColegio,
  actualizarPerfil,
  cambiarPassword,
};

