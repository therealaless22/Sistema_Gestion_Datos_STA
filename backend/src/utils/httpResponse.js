// =============================================
// SANTO TOMÁS DE AQUINO — Capa de Vista JSON (MVC)
// Formateador estandarizado de respuestas HTTP
// =============================================

const Vista = {
  ok(res, datos = {}, codigo = 200) {
    return res.status(codigo).json(datos);
  },

  creado(res, mensaje, extra = {}) {
    return res.status(201).json({ mensaje, ...extra });
  },

  errorValidacion(res, mensaje) {
    return res.status(400).json({ mensaje });
  },

  noAutenticado(res, mensaje = 'No autenticado.') {
    return res.status(401).json({ mensaje });
  },

  prohibido(res, mensaje = 'Acceso denegado.') {
    return res.status(403).json({ mensaje });
  },

  noEncontrado(res, mensaje = 'Recurso no encontrado.') {
    return res.status(404).json({ mensaje });
  },

  conflicto(res, mensaje) {
    return res.status(409).json({ mensaje });
  },

  errorServidor(res, mensaje = 'Error interno del servidor.') {
    return res.status(500).json({ mensaje });
  },
};

module.exports = Vista;

