/**
 * =============================================
 * SANTO TOMÁS DE AQUINO — Validaciones
 * =============================================
 */

export function esNotaValida(valor) {
  if (valor === '' || valor === null || valor === undefined) return false;
  const num = Number(valor);
  return !Number.isNaN(num) && num >= 0 && num <= 20;
}

export function esPasswordValido(password, minLength = 6) {
  return typeof password === 'string' && password.trim().length >= minLength;
}

export function esRangoHoraValido(horaInicio, horaFin) {
  if (!horaInicio || !horaFin) return false;
  return horaFin > horaInicio;
}

export function obtenerFechaHoyISO() {
  return new Date().toISOString().split('T')[0];
}

