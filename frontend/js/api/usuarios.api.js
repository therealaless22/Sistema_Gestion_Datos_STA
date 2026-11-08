/**
 * =============================================
 * 2. Usuarios (src/routes/usuarios.js)
 * =============================================
 * - GET    http://localhost:3000/api/usuarios
 * - POST   http://localhost:3000/api/usuarios
 * - PUT    http://localhost:3000/api/usuarios/:id
 * - DELETE http://localhost:3000/api/usuarios/:id
 */

import { apiRequest } from './http.js';

export const usuariosApi = {
  listar() {
    return apiRequest('/usuarios', { method: 'GET' });
  },

  crear(payload) {
    return apiRequest('/usuarios', {
      method: 'POST',
      body: payload,
    });
  },

  actualizar(id, payload) {
    return apiRequest(`/usuarios/${id}`, {
      method: 'PUT',
      body: payload,
    });
  },

  eliminar(id) {
    return apiRequest(`/usuarios/${id}`, {
      method: 'DELETE',
    });
  },
};

