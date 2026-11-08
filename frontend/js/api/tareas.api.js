/**
 * =============================================
 * 7. Tareas y 8. Entregas (src/routes/tareas.js y entregas.js)
 * =============================================
 * - GET    http://localhost:3000/api/tareas
 * - POST   http://localhost:3000/api/tareas (form-data)
 * - PUT    http://localhost:3000/api/tareas/:id (form-data)
 * - DELETE http://localhost:3000/api/tareas/:id
 * - GET    http://localhost:3000/api/tareas/:id/entregas
 * - GET    http://localhost:3000/api/tareas/mis-tareas-estudiante
 * - GET    http://localhost:3000/api/tareas/admin?mes=11&anio_calendario=2026
 * - POST   http://localhost:3000/api/entregas (form-data)
 * - PUT    http://localhost:3000/api/entregas/:id/calificar (JSON)
 */

import { apiRequest } from './http.js';

export const tareasApi = {
  listarProfesor() {
    return apiRequest('/tareas', { method: 'GET' });
  },

  crear(formData) {
    return apiRequest('/tareas', {
      method: 'POST',
      body: formData,
    });
  },

  actualizar(id, formData) {
    return apiRequest(`/tareas/${id}`, {
      method: 'PUT',
      body: formData,
    });
  },

  eliminar(id) {
    return apiRequest(`/tareas/${id}`, {
      method: 'DELETE',
    });
  },

  listarEntregasDeTarea(tareaId) {
    return apiRequest(`/tareas/${tareaId}/entregas`, { method: 'GET' });
  },

  listarMisTareasEstudiante() {
    return apiRequest('/tareas/mis-tareas-estudiante', { method: 'GET' });
  },

  listarRevisionAdmin(params = {}) {
    const search = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        search.set(key, val);
      }
    });
    const qs = search.toString();
    return apiRequest(`/tareas/admin${qs ? `?${qs}` : ''}`, { method: 'GET' });
  },

  enviarEntregaEstudiante(formData) {
    return apiRequest('/entregas', {
      method: 'POST',
      body: formData,
    });
  },

  calificarEntrega(entregaId, nota) {
    return apiRequest(`/entregas/${entregaId}/calificar`, {
      method: 'PUT',
      body: { nota },
    });
  },
};

