// =============================================
// SANTO TOMÁS DE AQUINO — Manejo de Errores
// =============================================

function rutaNoEncontrada(req, res) {
  res.status(404).json({ mensaje: 'Ruta no encontrada.' });
}

function manejadorErrores(err, req, res, next) {
  console.error(err.stack || err.message || err);

  if (err.message && err.message.includes('Tipo de archivo no permitido')) {
    return res.status(400).json({ mensaje: err.message });
  }

  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({ mensaje: err.message });
  }

  res.status(500).json({ mensaje: 'Error interno del servidor.' });
}

module.exports = {
  rutaNoEncontrada,
  manejadorErrores,
};

