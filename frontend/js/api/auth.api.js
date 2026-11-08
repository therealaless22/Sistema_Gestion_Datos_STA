/**
 * =============================================
 * 1. Autenticación y CSRF (src/routes/auth.js)
 * =============================================
 * - GET  http://localhost:3000/api/csrf-token
 * - POST http://localhost:3000/api/login
 * - GET  http://localhost:3000/api/verificar
 */

import { apiRequest, ensureCsrfToken } from './http.js';

export const authApi = {
  obtenerCsrfToken() {
    return ensureCsrfToken(true);
  },

  login(usuario, password) {
    return apiRequest('/login', {
      method: 'POST',
      body: { usuario, password },
      skipAuthRedirect: true,
    });
  },

  verificar() {
    return apiRequest('/verificar', {
      method: 'GET',
      skipAuthRedirect: true,
    });
  },
};

