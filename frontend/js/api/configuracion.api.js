/**
 * =============================================
 * 12. Configuración (src/routes/configuracion.js)
 * =============================================
 * - GET http://localhost:3000/api/configuracion
 * - PUT http://localhost:3000/api/configuracion/colegio
 * - PUT http://localhost:3000/api/configuracion/perfil
 * - PUT http://localhost:3000/api/configuracion/password
 */

import { apiRequest } from './http.js';

export const configuracionApi = {
  obtener() {
    return apiRequest('/configuracion', { method: 'GET' });
  },

  actualizarColegio(payload) {
    return apiRequest('/configuracion/colegio', {
      method: 'PUT',
      body: payload,
    });
  },

  actualizarPerfil(payload) {
    return apiRequest('/configuracion/perfil', {
      method: 'PUT',
      body: payload,
    });
  },

  cambiarPassword(payload) {
    return apiRequest('/configuracion/password', {
      method: 'PUT',
      body: payload,
    });
  },
};

