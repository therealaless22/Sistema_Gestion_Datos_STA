// =============================================
// SANTO TOMÁS DE AQUINO — Auth Controller
// =============================================

const UsuarioModel = require('../models/UsuarioModel');
const AuthService = require('../services/authService');
const { registrarActividad } = require('../middlewares/logger');
const { validarLogin } = require('../utils/validadores');
const Vista = require('../utils/httpResponse');

// ---------------------------------------------
// POST /api/login
// ---------------------------------------------
async function login(req, res) {
  const errorValidacion = validarLogin(req.body || {});
  if (errorValidacion) {
    return Vista.errorValidacion(res, errorValidacion);
  }

  const { usuario, password } = req.body;

  try {
    // Buscar usuario por nombre de usuario O por correo
    const user = await UsuarioModel.buscarPorCredencial(usuario);

    if (!user) {
      return Vista.noAutenticado(res, 'Usuario o contraseña incorrectos.');
    }

    if (!user.activo) {
      return Vista.prohibido(res, 'Tu cuenta está desactivada. Contacta al administrador.');
    }

    const passwordValida = await AuthService.compararPassword(password, user.password);
    if (!passwordValida) {
      return Vista.noAutenticado(res, 'Usuario o contraseña incorrectos.');
    }

    const token = AuthService.generarToken(user);

    registrarActividad(user.id, 'login', `${user.usuario} (${user.rol})`);

    return Vista.ok(res, {
      mensaje: 'Inicio de sesión exitoso.',
      token,
      usuario: {
        id:       user.id,
        usuario:  user.usuario,
        correo:   user.correo,
        nombre:   user.nombre,
        apellido: user.apellido,
        rol:      user.rol,
      },
    });
  } catch (error) {
    console.error('Error en login:', error);
    return Vista.errorServidor(res);
  }
}

module.exports = { login };

