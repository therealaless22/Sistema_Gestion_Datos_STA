/**
 * =============================================
 * SANTO TOMÁS DE AQUINO — Cliente HTTP Centralizado
 * Manejo de peticiones con CORS, CSRF y Token JWT
 * =============================================
 */

import { store } from '../state.js';

export const BACKEND_ORIGIN = 'http://localhost:3000';
export const API_BASE_URL = `${BACKEND_ORIGIN}/api`;

let csrfPromise = null;
let credentialsMode = 'include';

/**
 * Obtiene y almacena el token CSRF desde GET http://localhost:3000/api/csrf-token
 */
export async function ensureCsrfToken(forceRefresh = false) {
  const existing = store.getCsrfToken();
  if (existing && !forceRefresh) {
    return existing;
  }

  if (csrfPromise && !forceRefresh) {
    return csrfPromise;
  }

  csrfPromise = (async () => {
    try {
      let response;
      try {
        response = await fetch(`${API_BASE_URL}/csrf-token`, {
          method: 'GET',
          credentials: credentialsMode,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      } catch {
        // Fallback si el servidor CORS usa Access-Control-Allow-Origin: *
        credentialsMode = 'same-origin';
        response = await fetch(`${API_BASE_URL}/csrf-token`, {
          method: 'GET',
          credentials: credentialsMode,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }

      if (response && response.ok) {
        const data = await response.json();
        if (data && data.csrfToken) {
          store.setCsrfToken(data.csrfToken);
          return data.csrfToken;
        }
      }
    } catch (error) {
      console.warn('No se pudo obtener el token CSRF (opcional):', error);
    } finally {
      csrfPromise = null;
    }
    return store.getCsrfToken() || '';
  })();

  return csrfPromise;
}

/**
 * Construye las cabeceras requeridas para cada petición:
 * - Authorization: Bearer <TU_TOKEN_JWT>
 * - Content-Type: application/json (excepto cuando es FormData)
 * - X-CSRF-Token: <TOKEN_OPCIONAL_DE_/api/csrf-token>
 */
export async function buildHeaders(isFormData = false, customHeaders = {}) {
  const token = store.getToken();
  let csrfToken = store.getCsrfToken();

  if (!csrfToken) {
    csrfToken = await ensureCsrfToken();
  }

  const headers = {
    ...customHeaders,
  };

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (csrfToken) {
    headers['X-CSRF-Token'] = csrfToken;
  }

  return headers;
}

/**
 * Ejecuta una petición HTTP hacia el backend Node.js
 * @param {string} endpoint Ruta relativa a /api (ej. '/usuarios' o '/login')
 * @param {Object} options Opciones de petición { method, body, headers, skipAuthRedirect }
 */
export async function apiRequest(endpoint, options = {}) {
  const {
    method = 'GET',
    body = undefined,
    headers: customHeaders = {},
    skipAuthRedirect = false,
  } = options;

  const isFormData = body instanceof FormData;
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  // Asegurar CSRF token antes de peticiones que modifican estado
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase()) && !store.getCsrfToken()) {
    await ensureCsrfToken();
  }

  const headers = await buildHeaders(isFormData, customHeaders);

  const fetchOptions = {
    method: method.toUpperCase(),
    headers,
    credentials: credentialsMode,
  };

  if (body !== undefined && body !== null) {
    fetchOptions.body = isFormData ? body : JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(url, fetchOptions);
  } catch (err) {
    if (credentialsMode === 'include') {
      credentialsMode = 'same-origin';
      fetchOptions.credentials = credentialsMode;
      response = await fetch(url, fetchOptions);
    } else {
      throw err;
    }
  }

  // Si falla por CSRF inválido/expirado (403), refrescar token CSRF y reintentar una vez
  if (response.status === 403 && !options._retriedCsrf) {
    const cloned = response.clone();
    try {
      const errData = await cloned.json();
      const msg = (errData.mensaje || errData.message || '').toLowerCase();
      if (msg.includes('csrf')) {
        await ensureCsrfToken(true);
        return apiRequest(endpoint, { ...options, _retriedCsrf: true });
      }
    } catch {
      // Continuar flujo normal si no es JSON
    }
  }

  let data = {};
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = {};
    }
  }

  // Si el token JWT expiró o no es válido (401), limpiar sesión y redirigir a login
  if (response.status === 401 && !skipAuthRedirect && !endpoint.includes('/login')) {
    store.clearSession();
    window.location.hash = '#/login';
  }

  return {
    ok: response.ok,
    status: response.status,
    data,
  };
}

