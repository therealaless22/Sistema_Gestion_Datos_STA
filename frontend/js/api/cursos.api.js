/**
 * =============================================
 * 3. Cursos (src/routes/cursos.js)
 * =============================================
 * - GET    http://localhost:3000/api/cursos
 * - GET    http://localhost:3000/api/cursos/profesores
 * - GET    http://localhost:3000/api/cursos/anios
 * - POST   http://localhost:3000/api/cursos
 * - PUT    http://localhost:3000/api/cursos/:id
 * - DELETE http://localhost:3000/api/cursos/:id
 * - GET    http://localhost:3000/api/cursos/mis-cursos
 * - GET    http://localhost:3000/api/cursos/horario/:horarioId/alumnos
 */

import { apiRequest } from './http.js';

export const cursosApi = {
  listar() {
    return apiRequest('/cursos', { method: 'GET' });
  },

  listarProfesores() {
    return apiRequest('/cursos/profesores', { method: 'GET' });
  },

  listarAnios() {
    return apiRequest('/cursos/anios', { method: 'GET' });
  },

  crear(payload) {
    return apiRequest('/cursos', {
      method: 'POST',
      body: payload,
    });
  },

  actualizar(id, payload) {
    return apiRequest(`/cursos/${id}`, {
      method: 'PUT',
      body: payload,
    });
  },

  eliminar(id) {
    return apiRequest(`/cursos/${id}`, {
      method: 'DELETE',
    });
  },

  listarMisCursosProfesor() {
    return apiRequest('/cursos/mis-cursos', { method: 'GET' });
  },

  listarAlumnosDeHorario(horarioId) {
    return apiRequest(`/cursos/horario/${horarioId}/alumnos`, { method: 'GET' });
  },
};

