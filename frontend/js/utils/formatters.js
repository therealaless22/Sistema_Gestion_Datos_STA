/**
 * =============================================
 * SANTO TOMÁS DE AQUINO — Formateadores y Escala de Notas
 * =============================================
 */

/**
 * Convierte una nota numérica (0-20) a su letra y clase CSS:
 *   17-20 → AD (verde)
 *   13-16 → A  (verde claro)
 *   11-12 → B  (amarillo)
 *    0-10 → C  (rojo)
 */
export function notaAEscala(nota) {
  const n = Number(nota);
  if (n >= 17) return { letra: 'AD', clase: 'escala-ad' };
  if (n >= 13) return { letra: 'A',  clase: 'escala-a' };
  if (n >= 11) return { letra: 'B',  clase: 'escala-b' };
  return { letra: 'C', clase: 'escala-c' };
}

/**
 * Devuelve el HTML del badge con nota numérica y letra según escala
 */
export function notaConLetraHTML(nota) {
  const n = Number(nota);
  const escala = notaAEscala(n);
  const valorFormateado = Number.isInteger(n) ? n.toFixed(0) : n.toFixed(1);
  return `<span class="tag ${escala.clase} tag-nota-escala">
    <span class="nota-valor">${valorFormateado}</span>
    <span class="separador-nota"></span>
    <span class="nota-letra">${escala.letra}</span>
  </span>`;
}

/**
 * Formatea una hora ("08:00:00" o ISO "1970-01-01T07:30:00.000Z") a "HH:MM"
 */
export function formatHora(hora) {
  if (!hora) return '—';
  if (hora.includes('T')) {
    return hora.split('T')[1].substring(0, 5);
  }
  return hora.substring(0, 5);
}

/**
 * Formatea fecha ISO a formato corto DD/MM/YYYY
 */
export function formatearFecha(fechaISO) {
  if (!fechaISO) return '—';
  const d = new Date(fechaISO);
  if (isNaN(d.getTime())) return String(fechaISO);
  return d.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Formatea fecha ISO a formato largo (ej. "5 de noviembre de 2026")
 */
export function formatearFechaLarga(fechaISO) {
  if (!fechaISO) return '—';
  const d = new Date(fechaISO);
  if (isNaN(d.getTime())) return String(fechaISO);
  return d.toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Formatea fecha y hora ISO a "DD/MM/YYYY HH:MM"
 */
export function formatearFechaHora(fechaISO) {
  if (!fechaISO) return '—';
  const d = new Date(fechaISO);
  if (isNaN(d.getTime())) return String(fechaISO);
  const fecha = d.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const hora = d.toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${fecha} ${hora}`;
}

