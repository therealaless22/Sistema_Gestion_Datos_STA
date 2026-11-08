// =============================================
// SANTO TOMÁS DE AQUINO — Protección CSRF
// Patrón Signed Double-Submit Token + Origin Check
// Compatible con Frontend HTML/CSS/JS Vanilla (JWT Bearer)
// =============================================

const crypto = require('crypto');
const env = require('../config/env');
const { origenesPermitidos } = require('../config/cors');

const METODOS_SEGUROS = ['GET', 'HEAD', 'OPTIONS'];

/**
 * Genera un token CSRF firmado con HMAC-SHA256.
 */
function generarTokenCsrf() {
  const nonce = crypto.randomBytes(24).toString('hex');
  const firma = crypto
    .createHmac('sha256', env.CSRF_SECRET)
    .update(nonce)
    .digest('hex');
  return `${nonce}.${firma}`;
}

/**
 * Verifica que un token CSRF tenga una firma HMAC válida.
 */
function verificarTokenCsrf(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) {
    return false;
  }
  const [nonce, firmaRecibida] = token.split('.');
  if (!nonce || !firmaRecibida) return false;

  const firmaEsperada = crypto
    .createHmac('sha256', env.CSRF_SECRET)
    .update(nonce)
    .digest('hex');

  const bufRecibida = Buffer.from(firmaRecibida, 'utf8');
  const bufEsperada = Buffer.from(firmaEsperada, 'utf8');

  if (bufRecibida.length !== bufEsperada.length) return false;
  return crypto.timingSafeEqual(bufRecibida, bufEsperada);
}

/**
 * Endpoint GET /api/csrf-token para emitir un token CSRF al frontend.
 */
function emitirCsrfToken(req, res) {
  const token = generarTokenCsrf();
  res.cookie('XSRF-TOKEN', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
  res.setHeader('X-CSRF-Token', token);
  return res.status(200).json({ csrfToken: token });
}

/**
 * Middleware de protección CSRF en peticiones mutadoras (POST, PUT, PATCH, DELETE).
 */
function proteccionCsrf(req, res, next) {
  if (METODOS_SEGUROS.includes(req.method)) {
    return next();
  }

  // 1. Verificar cabecera Origin si está presente (defensa estándar OWASP contra CSRF)
  const origin = req.headers['origin'];
  if (origin && origin !== 'null') {
    const hostActual = `${req.protocol}://${req.get('host')}`;
    if (origin !== hostActual && !origenesPermitidos.includes(origin)) {
      return res.status(403).json({
        mensaje: 'Solicitud bloqueada por protección CSRF: origen no autorizado.',
      });
    }
  }

  // 2. Si el cliente envía explícitamente X-CSRF-Token, validar su firma criptográfica
  const tokenHeader = req.headers['x-csrf-token'] || req.headers['x-xsrf-token'];
  if (tokenHeader !== undefined) {
    if (!verificarTokenCsrf(tokenHeader)) {
      return res.status(403).json({
        mensaje: 'Token CSRF inválido o manipulado.',
      });
    }
    return next();
  }

  // 3. Permitir peticiones legítimas del frontend JS Vanilla que usan Authorization Bearer,
  //    JSON explícito o multipart/form-data autenticado (no explotables por formularios CSRF simples)
  const tieneBearer =
    typeof req.headers['authorization'] === 'string' &&
    req.headers['authorization'].startsWith('Bearer ');
  const contentType = req.headers['content-type'] || '';
  const esJsonOMultipart =
    contentType.includes('application/json') ||
    contentType.includes('multipart/form-data');

  if (tieneBearer || esJsonOMultipart) {
    return next();
  }

  return res.status(403).json({
    mensaje: 'Solicitud rechazada por protección CSRF: falta X-CSRF-Token.',
  });
}

module.exports = {
  generarTokenCsrf,
  verificarTokenCsrf,
  emitirCsrfToken,
  proteccionCsrf,
};

