// =============================================
// SANTO TOMÁS DE AQUINO — Configuración CORS
// Soporte para Frontend en HTML, CSS y JS Vanilla
// =============================================

const cors = require('cors');
const env = require('./env');

const origenesPermitidos = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'http://localhost:8080',
  'http://127.0.0.1:8080',
];

const opcionesCors = {
  origin(origin, callback) {
    // Permitir peticiones del mismo servidor, Live Server, archivos locales o lista blanca
    if (!origin || env.CORS_ORIGIN === '*' || origenesPermitidos.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Origen no permitido por CORS.'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-CSRF-Token',
    'X-Requested-With',
    'Accept',
  ],
  exposedHeaders: ['X-CSRF-Token'],
  credentials: true,
  optionsSuccessStatus: 200,
};

module.exports = {
  corsMiddleware: cors(opcionesCors),
  opcionesCors,
  origenesPermitidos,
};

