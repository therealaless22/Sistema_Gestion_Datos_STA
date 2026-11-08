/**
 * =============================================
 * 11. Matrículas (src/routes/matriculas.js)
 * =============================================
 * - GET    http://localhost:3000/api/matriculas
 * - GET    http://localhost:3000/api/matriculas/estudiantes
 * - GET    http://localhost:3000/api/matriculas/secciones
 * - POST   http://localhost:3000/api/matriculas
 * - DELETE http://localhost:3000/api/matriculas/:id
 */

import { apiRequest } from './http.js';

export const matriculasApi = {
  listar() {
    return apiRequest('/matriculas', { method: 'GET' });
  },

  listarEstudiantes() {
    return apiRequest('/matriculas/estudiantes', { method: 'GET' });
  },

  listarSecciones() {
    return apiRequest('/matriculas/secciones', { method: 'GET' });
  },

  crear(payload) {
    return apiRequest('/matriculas', {
      method: 'POST',
      body: payload,
    });
  },

  eliminar(id) {
    return apiRequest(`/matriculas/${id}`, {
      method: 'DELETE',
    });
  },
};

