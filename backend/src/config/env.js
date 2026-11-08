// =============================================
// SANTO TOMÁS DE AQUINO — Variables de Entorno
// =============================================

const path = require('path');
require('dotenv').config({
  path: path.join(__dirname, '../../.env'),
});

module.exports = {
  PORT: process.env.PORT || 3000,
  DB_SERVER: process.env.DB_SERVER || 'localhost',
  DB_NAME: process.env.DB_NAME || 'SantoTomasDB',
  DB_PORT: Number(process.env.DB_PORT) || 1433,
  DB_USER: process.env.DB_USER || 'sa',
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  JWT_SECRET: process.env.JWT_SECRET || 'santo_tomas_clave_secreta_2025',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '8h',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '',
  CSRF_SECRET: process.env.CSRF_SECRET || process.env.JWT_SECRET || 'csrf_secreto_santo_tomas',
};
