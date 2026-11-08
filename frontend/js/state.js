/**
 * =============================================
 * SANTO TOMÁS DE AQUINO — Estado Global (Store)
 * Manejo de sesión, usuario autenticado y CSRF
 * =============================================
 */

const STORAGE_KEYS = {
  TOKEN: 'token',
  USUARIO: 'usuario',
  CSRF: 'csrfToken',
};

const state = {
  token: sessionStorage.getItem(STORAGE_KEYS.TOKEN) || null,
  usuario: (() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEYS.USUARIO);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })(),
  csrfToken: sessionStorage.getItem(STORAGE_KEYS.CSRF) || null,
  sessionVerified: false,
};

const listeners = new Set();

function sinCorreo(u) {
  const { correo, ...resto } = u || {};
  return resto;
}
export const store = {
  getState() {
    return { ...state };
  },

  getToken() {
    return state.token || sessionStorage.getItem(STORAGE_KEYS.TOKEN) || null;
  },

  getUser() {
    if (state.usuario) return state.usuario;
    try {
      const raw = sessionStorage.getItem(STORAGE_KEYS.USUARIO);
      state.usuario = raw ? JSON.parse(raw) : null;
      return state.usuario;
    } catch {
      return null;
    }
  },

  getCsrfToken() {
    return state.csrfToken || sessionStorage.getItem(STORAGE_KEYS.CSRF) || null;
  },

  isAuthenticated() {
    const token = this.getToken();
    const user = this.getUser();
    return Boolean(token && user && user.rol);
  },

  setSession(token, usuario) {
    state.token = token;
    state.usuario = usuario;
    state.sessionVerified = true;
    sessionStorage.setItem(STORAGE_KEYS.TOKEN, token);
    sessionStorage.setItem(STORAGE_KEYS.USUARIO, JSON.stringify(sinCorreo(usuario)));
    this.notify();
  },

  updateUser(partialUser) {
    const current = this.getUser() || {};
    const updated = { ...current, ...partialUser };
    state.usuario = updated;
    sessionStorage.setItem(STORAGE_KEYS.USUARIO, JSON.stringify(sinCorreo(updated)));
    this.notify();
  },

  setCsrfToken(csrfToken) {
    state.csrfToken = csrfToken;
    if (csrfToken) {
      sessionStorage.setItem(STORAGE_KEYS.CSRF, csrfToken);
    } else {
      sessionStorage.removeItem(STORAGE_KEYS.CSRF);
    }
    this.notify();
  },

  setSessionVerified(verified) {
    state.sessionVerified = Boolean(verified);
  },

  isSessionVerified() {
    return state.sessionVerified;
  },

  clearSession() {
    const currentCsrf = state.csrfToken;
    state.token = null;
    state.usuario = null;
    state.sessionVerified = false;
    sessionStorage.removeItem(STORAGE_KEYS.TOKEN);
    sessionStorage.removeItem(STORAGE_KEYS.USUARIO);
    if (currentCsrf) {
      sessionStorage.setItem(STORAGE_KEYS.CSRF, currentCsrf);
    }
    this.notify();
  },

  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  notify() {
    listeners.forEach((listener) => {
      try {
        listener(this.getState());
      } catch (err) {
        console.error('Error en suscriptor de estado:', err);
      }
    });
  },
};

