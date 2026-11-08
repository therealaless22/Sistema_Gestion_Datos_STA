/**
 * =============================================
 * 10. Mensajes (src/routes/mensajes.js)
 * =============================================
 * - GET    http://localhost:3000/api/mensajes/recibidos
 * - GET    http://localhost:3000/api/mensajes/enviados
 * - POST   http://localhost:3000/api/mensajes/enviar
 * - DELETE http://localhost:3000/api/mensajes/:id
 */

import { apiRequest } from './http.js';

export const mensajesApi = {
  listarRecibidosEstudiante() {
    return apiRequest('/mensajes/recibidos', { method: 'GET' });
  },

  listarEnviadosProfesor() {
    return apiRequest('/mensajes/enviados', { method: 'GET' });
  },

  enviar(payload) {
    return apiRequest('/mensajes/enviar', {
      method: 'POST',
      body: payload,
    });
  },

  eliminar(id) {
    return apiRequest(`/mensajes/${id}`, {
      method: 'DELETE',
    });
  },
};

