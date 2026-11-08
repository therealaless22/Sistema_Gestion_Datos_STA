// =============================================
// SANTO TOMÁS DE AQUINO — Auth Middleware
// =============================================

const AuthService = require('../services/authService');

function verificarToken(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      mensaje: 'Acceso denegado. Token no proporcionado.',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = AuthService.verificarToken(token);
    req.usuario = decoded; // { id, usuario, rol }
    next();
  } catch (error) {
    return res.status(401).json({
      mensaje: 'Token inválido o expirado.',
    });
  }
}

function verificarRol(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({
        mensaje: 'No autenticado.',
      });
    }

    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({
        mensaje: `Acceso denegado. Se requiere rol: ${rolesPermitidos.join(' o ')}.`,
      });
    }

    next();
  };
}

module.exports = { verificarToken, verificarRol };

