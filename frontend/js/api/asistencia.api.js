/**
 * =============================================
 * 6. Asistencia (src/routes/asistencia.js)
 * =============================================
 * - GET  http://localhost:3000/api/asistencia?horario_id=10&fecha=2026-11-05
 * - POST http://localhost:3000/api/asistencia/guardar
 * - GET  http://localhost:3000/api/asistencia/mi-resumen
 */

import { apiRequest } from './http.js';

export const asistenciaApi = {
  obtenerPorHorarioYFecha(horarioId, fecha) {
    const query = `horario_id=${encodeURIComponent(horarioId)}&fecha=${encodeURIComponent(fecha)}`;
    return apiRequest(`/asistencia?${query}`, { method: 'GET' });
  },

  guardar(asistencias) {
    return apiRequest('/asistencia/guardar', {
      method: 'POST',
      body: { asistencias },
    });
  },

  obtenerMiResumenEstudiante() {
    return apiRequest('/asistencia/mi-resumen', { method: 'GET' });
  },
};

