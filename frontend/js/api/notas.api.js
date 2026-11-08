/**
 * =============================================
 * 5. Notas (src/routes/notas.js)
 * =============================================
 * - GET  http://localhost:3000/api/notas?horario_id=10&periodo=Bimestre%201
 * - POST http://localhost:3000/api/notas/guardar
 * - GET  http://localhost:3000/api/notas/mis-cursos
 * - GET  http://localhost:3000/api/notas/mis-notas?horario_id=10
 */

import { apiRequest } from './http.js';

export const notasApi = {
  obtenerPorHorarioYPeriodo(horarioId, periodo) {
    const query = `horario_id=${encodeURIComponent(horarioId)}&periodo=${encodeURIComponent(periodo)}`;
    return apiRequest(`/notas?${query}`, { method: 'GET' });
  },

  guardar(notas) {
    return apiRequest('/notas/guardar', {
      method: 'POST',
      body: { notas },
    });
  },

  listarMisCursosEstudiante() {
    return apiRequest('/notas/mis-cursos', { method: 'GET' });
  },

  obtenerMisNotasEstudiante(horarioId) {
    return apiRequest(`/notas/mis-notas?horario_id=${encodeURIComponent(horarioId)}`, {
      method: 'GET',
    });
  },
};

