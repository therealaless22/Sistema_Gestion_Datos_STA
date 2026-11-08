// =============================================
// SANTO TOMÁS DE AQUINO — Multer Config
// =============================================

const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

// Crear carpeta si no existe (en frontend/uploads)
const uploadDir = path.join(__dirname, '../../../frontend/uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename:    (req, file, cb) => {
    const ext    = path.extname(file.originalname);
    const nombre = `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
    cb(null, nombre);
  },
});

const fileFilter = (req, file, cb) => {
  const permitidos = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/jpg',
  ];
  if (permitidos.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido. Solo PDF, Word e imágenes.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB máximo
});

module.exports = upload;

