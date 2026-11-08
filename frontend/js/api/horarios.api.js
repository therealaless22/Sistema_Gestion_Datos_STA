/**
 * =============================================
 * 4. Horarios (src/routes/horarios.js)
 * =============================================
 * - GET    http://localhost:3000/api/horarios
 * - POST   http://localhost:3000/api/horarios
 * - PUT    http://localhost:3000/api/horarios/:id
 * - DELETE http://localhost:3000/api/horarios/:id
 * - GET    http://localhost:3000/api/horarios/mi-horario
 * - GET    http://localhost:3000/api/horarios/mi-horario-estudiante
 */

import { apiRequest } from './http.js';

export const horariosApi = {
  listar() {
    return apiRequest('/horarios', { method: 'GET' });
  },

  crear(payload) {
    return apiRequest('/horarios', {
      method: 'POST',
      body: payload,
    });
  },

  actualizar(id, payload) {
    return apiRequest(`/horarios/${id}`, {
      method: 'PUT',
      body: payload,
    });
  },

  eliminar(id) {
    return apiRequest(`/horarios/${id}`, {
      method: 'DELETE',
    });
  },

  obtenerMiHorarioProfesor() {
    return apiRequest('/horarios/mi-horario', { method: 'GET' });
  },

  obtenerMiHorarioEstudiante() {
    return apiRequest('/horarios/mi-horario-estudiante', { method: 'GET' });
  },
};

