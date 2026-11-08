// =============================================
// SANTO TOMÁS DE AQUINO — Configuración de Express
// =============================================

const express = require('express');
const path = require('path');


const { corsMiddleware } = require('./config/cors');
const { proteccionCsrf } = require('./middlewares/csrfMiddleware');
const { rutaNoEncontrada, manejadorErrores } = require('./middlewares/errorMiddleware');
const apiRoutes = require('./routes');

const app = express();
const helmet = require('helmet');
const { prevenirInyeccionSQL, validarTiposBody } = require('./middlewares/validationMiddleware');

// ---------------------------------------------
// Middlewares globales de seguridad y parseo
// ---------------------------------------------
app.disable('x-powered-by');
app.set('etag', false); // evita respuestas 304 cacheadas con datos de usuarios
app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: false,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      styleSrcAttr: ["'unsafe-inline'"],
      fontSrc: ["'self'"],
      imgSrc: ["'self'", 'data:'],
      connectSrc: ["'self'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
    },
  },
  frameguard: { action: 'deny' },
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
// Las respuestas de la API contienen datos personales: nunca se cachean
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});
app.use(corsMiddleware);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(prevenirInyeccionSQL);
app.use('/api', validarTiposBody);
app.use('/api', proteccionCsrf);

// ---------------------------------------------
// Archivos estáticos del frontend (HTML, CSS, JS Vanilla)
// ---------------------------------------------
const frontendPath = path.join(__dirname, '../../frontend');
app.use(express.static(frontendPath));
app.use('/uploads', express.static(path.join(frontendPath, 'uploads')));

// ---------------------------------------------
// Rutas de la API
// ---------------------------------------------
app.use('/api', apiRoutes);

// ---------------------------------------------
// Ruta raíz — sirve la página principal
// ---------------------------------------------
app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// ---------------------------------------------
// Ruta no encontrada (404) y Manejo de errores globales
// ---------------------------------------------
app.use(rutaNoEncontrada);
app.use(manejadorErrores);

module.exports = app;

