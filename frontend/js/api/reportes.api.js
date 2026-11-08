/**
 * =============================================
 * 13. Reportes y Actividades (src/routes/reportes.js y actividades.js)
 * =============================================
 * - GET http://localhost:3000/api/reportes
 * - GET http://localhost:3000/api/actividades
 */

import { apiRequest } from './http.js';

export const reportesApi = {
  obtenerResumen() {
    return apiRequest('/reportes', { method: 'GET' });
  },

  listarActividades() {
    return apiRequest('/actividades', { method: 'GET' });
  },
};

