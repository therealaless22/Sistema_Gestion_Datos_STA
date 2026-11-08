// =============================================
// SANTO TOMÁS DE AQUINO — Servicio de Archivos
// Gestión segura de archivos subidos en frontend/uploads
// =============================================

const fs = require('fs');
const path = require('path');

const FRONTEND_DIR = path.join(__dirname, '../../../frontend');

function eliminarArchivoPublico(archivoUrl) {
  if (!archivoUrl) return;
  try {
    const rutaNormalizada = path.normalize(archivoUrl).replace(/^(\.\.(\/|\\|$))+/, '');
    const rutaCompleta = path.join(FRONTEND_DIR, rutaNormalizada);
    if (rutaCompleta.startsWith(FRONTEND_DIR) && fs.existsSync(rutaCompleta)) {
      fs.unlinkSync(rutaCompleta);
    }
  } catch (error) {
    console.error('Error al eliminar archivo físico:', error);
  }
}

module.exports = { eliminarArchivoPublico };

