/**
 * =============================================
 * SANTO TOMÁS DE AQUINO — Componente Navbar
 * Barra superior compartida para vistas autenticadas
 * =============================================
 */

import { store } from '../state.js';
import { getDashboardRouteByRole, navigateTo } from '../utils/router.js';

const ROL_META = {
  administrador: {
    clase: 'badge-administrador',
    icono: 'bi-shield-fill',
    etiqueta: 'Administrador',
  },
  profesor: {
    clase: 'badge-profesor',
    icono: 'bi-person-badge-fill',
    etiqueta: 'Profesor',
  },
  estudiante: {
    clase: 'badge-estudiante',
    icono: 'bi-person-fill',
    etiqueta: 'Estudiante',
  },
};

/**
 * Genera el HTML del Navbar superior
 */
export function renderNavbarHTML() {
  const user = store.getUser() || {};
  const meta = ROL_META[user.rol] || ROL_META.estudiante;
  const dashRoute = getDashboardRouteByRole(user.rol);

  return `
    <nav class="dash-navbar">
      <a class="brand" href="${dashRoute}">
        <img src="assets/images/logo.png" alt="Logo"/>
        Santo Tomás de Aquino
      </a>

      <div class="nav-right">
        <span class="badge-rol ${meta.clase}">
          <i class="bi ${meta.icono}"></i> ${meta.etiqueta}
        </span>

        <button id="btnSalir" class="btn-salir" type="button">
          <i class="bi bi-box-arrow-right"></i> Salir
        </button>
      </div>
    </nav>
  `;
}

/**
 * Enlaza el evento de cerrar sesión en el Navbar
 */
export function bindNavbarEvents(container = document) {
  const btnSalir = container.querySelector('#btnSalir');
  if (btnSalir) {
    btnSalir.addEventListener('click', () => {
      store.clearSession();
      navigateTo('#/login');
    });
  }
}

