/**
 * =============================================
 * SANTO TOMÁS DE AQUINO — Utilidades DOM
 * =============================================
 */

import { BACKEND_ORIGIN } from '../api/http.js';

/**
 * Escapa texto para prevenir inyección XSS al insertar en HTML
 */
export function escapeHtml(texto) {
  const div = document.createElement('div');
  div.textContent = texto ?? '';
  return div.innerHTML;
}

/**
 * Escapa comillas para atributos HTML
 */
export function escapeAttr(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/'/g, '&#39;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Muestra un mensaje de alerta en el contenedor #alertBox (o el elemento indicado)
 * @param {string} mensaje
 * @param {'exito'|'error'} tipo
 * @param {HTMLElement|string} [contenedor='alertBox']
 */
export function mostrarAlerta(mensaje, tipo = 'exito', contenedor = 'alertBox') {
  const alertBox = typeof contenedor === 'string'
    ? document.getElementById(contenedor)
    : contenedor;

  if (!alertBox) return;

  alertBox.textContent = mensaje;
  alertBox.className = `alert-box ${tipo}`;
  alertBox.classList.remove('d-none');
  alertBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  clearTimeout(alertBox._timer);
  alertBox._timer = setTimeout(() => {
    alertBox.className = 'alert-box d-none';
    alertBox.textContent = '';
  }, 4000);
}

/**
 * Oculta el contenedor de alerta inmediatamente
 */
export function ocultarAlerta(contenedor = 'alertBox') {
  const alertBox = typeof contenedor === 'string'
    ? document.getElementById(contenedor)
    : contenedor;
  if (!alertBox) return;
  clearTimeout(alertBox._timer);
  alertBox.className = 'alert-box d-none';
  alertBox.textContent = '';
}

/**
 * Resuelve la URL de un archivo subido al backend (ej. /uploads/archivo.pdf)
 */
export function resolveFileUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${BACKEND_ORIGIN}${cleanPath}`;
}

