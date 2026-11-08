// =============================================
// SANTO TOMÁS DE AQUINO — Servicio de Autenticación
// =============================================

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../config/env');

const AuthService = {
  async compararPassword(passwordPlano, hashBD) {
    return bcrypt.compare(passwordPlano, hashBD);
  },

  async encriptarPassword(passwordPlano) {
    return bcrypt.hash(passwordPlano, 10);
  },

  generarToken(usuario) {
    return jwt.sign(
      { id: usuario.id, usuario: usuario.usuario, rol: usuario.rol },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN }
    );
  },

  verificarToken(token) {
    return jwt.verify(token, env.JWT_SECRET);
  },
};

module.exports = AuthService;

