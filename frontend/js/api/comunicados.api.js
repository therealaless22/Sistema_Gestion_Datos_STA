/**
 * =============================================
 * 9. Comunicados (src/routes/comunicados.js)
 * =============================================
 * - GET    http://localhost:3000/api/comunicados/mis
 * - GET    http://localhost:3000/api/comunicados
 * - POST   http://localhost:3000/api/comunicados
 * - PUT    http://localhost:3000/api/comunicados/:id
 * - DELETE http://localhost:3000/api/comunicados/:id
 */

import { apiRequest } from './http.js';

export const comunicadosApi = {
  listarMisComunicados() {
    return apiRequest('/comunicados/mis', { method: 'GET' });
  },

  listarTodosAdmin() {
    return apiRequest('/comunicados', { method: 'GET' });
  },

  crear(payload) {
    return apiRequest('/comunicados', {
      method: 'POST',
      body: payload,
    });
  },

  actualizar(id, payload) {
    return apiRequest(`/comunicados/${id}`, {
      method: 'PUT',
      body: payload,
    });
  },

  eliminar(id) {
    return apiRequest(`/comunicados/${id}`, {
      method: 'DELETE',
    });
  },
};

