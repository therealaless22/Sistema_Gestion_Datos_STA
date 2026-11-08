/**
 * =============================================
 * SANTO TOMÁS DE AQUINO — Enrutador SPA con Guardias de Rol
 * Sin frameworks — Bloquea acceso a usuarios no autorizados
 * =============================================
 */

import { store } from '../state.js';
import { authApi } from '../api/auth.api.js';

const routes = new Map();
let currentCleanup = null;

/**
 * Devuelve la ruta del panel principal según el rol del usuario
 */
export function getDashboardRouteByRole(rol) {
  switch (rol) {
    case 'administrador':
      return '#/admin';
    case 'profesor':
      return '#/profesor';
    case 'estudiante':
      return '#/estudiante';
    default:
      return '#/login';
  }
}

/**
 * Registra una ruta en el sistema de enrutamiento
 * @param {string} path Ruta hash (ej. '/admin/usuarios')
 * @param {Object} config { render: Function, roles?: string[], title?: string, publicOnly?: boolean }
 */
export function registerRoute(path, config) {
  routes.set(path, config);
}

/**
 * Navega programáticamente hacia una ruta
 */
export function navigateTo(hashPath) {
  const normalized = hashPath.startsWith('#') ? hashPath : `#${hashPath}`;
  if (window.location.hash === normalized) {
    handleRouteChange();
  } else {
    window.location.hash = normalized;
  }
}

/**
 * Obtiene la ruta actual limpia (sin # ni query string)
 */
export function getCurrentPath() {
  const hash = window.location.hash || '#/';
  const raw = hash.startsWith('#') ? hash.slice(1) : hash;
  const [pathPart] = raw.split('?');
  return pathPart || '/';
}

/**
 * Procesa el cambio de ruta, verifica autenticación y autorización por rol
 */
export async function handleRouteChange() {
  const appContainer = document.getElementById('app');
  if (!appContainer) return;

  // Ejecutar limpieza de la vista anterior si existe
  if (typeof currentCleanup === 'function') {
    try {
      currentCleanup();
    } catch (e) {
      console.error('Error al limpiar vista previa:', e);
    }
    currentCleanup = null;
  }

  const path = getCurrentPath();
  const route = routes.get(path) || routes.get('/');

  // 1. Si es una ruta exclusiva para no autenticados (ej. /login) y ya hay sesión válida
  if (route.publicOnly && store.isAuthenticated()) {
    const user = store.getUser();
    navigateTo(getDashboardRouteByRole(user.rol));
    return;
  }

  // 2. Si la ruta requiere autorización por rol
  if (Array.isArray(route.roles) && route.roles.length > 0) {
    if (!store.isAuthenticated()) {
      store.clearSession();
      navigateTo('#/login');
      return;
    }

    // Verificar token JWT contra GET /api/verificar al iniciar o recuperar sesión
    if (!store.isSessionVerified()) {
      try {
        const { ok, status, data } = await authApi.verificar();
        if (!ok || status === 401 || status === 403) {
          store.clearSession();
          navigateTo('#/login');
          return;
        }
        if (data && data.usuario) {
          store.updateUser(data.usuario);
        }
        store.setSessionVerified(true);
      } catch {
        // Si el backend no responde momentáneamente, mantenemos validación local del token
      }
    }

    const user = store.getUser();
    if (!user || !route.roles.includes(user.rol)) {
      // Usuario autenticado intentando entrar a una ruta de otro rol no autorizado
      if (user && ['administrador', 'profesor', 'estudiante'].includes(user.rol)) {
        navigateTo(getDashboardRouteByRole(user.rol));
      } else {
        store.clearSession();
        navigateTo('#/login');
      }
      return;
    }
  }

  // Actualizar título del documento
  if (route.title) {
    document.title = route.title;
  }

  // Hacer scroll al inicio al cambiar de vista
  window.scrollTo({ top: 0, behavior: 'instant' });

  // Renderizar componente de la ruta
  const cleanup = await route.render(appContainer);
  if (typeof cleanup === 'function') {
    currentCleanup = cleanup;
  }
}

/**
 * Inicializa los listeners del router
 */
export function initRouter() {
  window.addEventListener('hashchange', handleRouteChange);
  handleRouteChange();
}

