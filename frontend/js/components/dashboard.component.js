/**
 * =============================================
 * SANTO TOMÁS DE AQUINO — Componente Dashboard
 * Paneles principales para Administrador, Profesor y Estudiante
 * =============================================
 */

import { store } from '../state.js';
import { escapeHtml } from '../utils/dom.js';
import { renderNavbarHTML, bindNavbarEvents } from './navbar.component.js';

const DASHBOARD_CONFIG = {
  administrador: {
    avatarClase: 'avatar-administrador',
    icono: 'bi-shield-fill',
    subtitulo: 'Panel de administración · Colegio Santo Tomás de Aquino',
    rolNombre: 'Administrador',
    accesos: [
      { href: '#/admin/usuarios',        icono: 'bi-people-fill',          texto: 'Gestionar usuarios' },
      { href: '#/admin/cursos',          icono: 'bi-book-fill',            texto: 'Cursos' },
      { href: '#/admin/horarios',        icono: 'bi-calendar3-week-fill',  texto: 'Horarios' },
      { href: '#/admin/matriculas',      icono: 'bi-person-vcard-fill',    texto: 'Matrículas' },
      { href: '#/admin/comunicados',     icono: 'bi-megaphone-fill',       texto: 'Comunicados' },
      { href: '#/admin/revision-tareas', icono: 'bi-clipboard-check-fill', texto: 'Revisión de tareas' },
      { href: '#/admin/reportes',        icono: 'bi-bar-chart-fill',       texto: 'Reportes' },
      { href: '#/admin/actividades',     icono: 'bi-clock-history',        texto: 'Actividades' },
      { href: '#/admin/configuracion',   icono: 'bi-gear-fill',            texto: 'Configuración' },
    ],
  },
  profesor: {
    avatarClase: 'avatar-profesor',
    icono: 'bi-person-badge-fill',
    subtitulo: 'Panel de profesor · Colegio Santo Tomás de Aquino',
    rolNombre: 'Profesor',
    accesos: [
      { href: '#/profesor/comunicados',     icono: 'bi-megaphone-fill',    texto: 'Comunicados' },
      { href: '#/profesor/mis-cursos',      icono: 'bi-people-fill',       texto: 'Mis cursos' },
      { href: '#/profesor/registrar-notas', icono: 'bi-pencil-square',     texto: 'Registrar notas' },
      { href: '#/profesor/horario',         icono: 'bi-calendar3',         texto: 'Horario' },
      { href: '#/profesor/asistencia',      icono: 'bi-clipboard-check',   texto: 'Asistencia' },
      { href: '#/profesor/mensajes',        icono: 'bi-chat-dots',         texto: 'Mensajes' },
      { href: '#/profesor/tareas',          icono: 'bi-file-earmark-plus', texto: 'Tareas' },
    ],
  },
  estudiante: {
    avatarClase: 'avatar-estudiante',
    icono: 'bi-person-fill',
    subtitulo: 'Panel de estudiante · Colegio Santo Tomás de Aquino',
    rolNombre: 'Estudiante',
    accesos: [
      { href: '#/estudiante/comunicados',   icono: 'bi-megaphone-fill',    texto: 'Comunicados' },
      { href: '#/estudiante/mis-notas',     icono: 'bi-journal-text',      texto: 'Mis notas' },
      { href: '#/estudiante/mi-horario',    icono: 'bi-calendar3',         texto: 'Horario' },
      { href: '#/estudiante/mis-mensajes',  icono: 'bi-chat-dots',         texto: 'Mensajes' },
      { href: '#/estudiante/mis-tareas',    icono: 'bi-file-earmark-text', texto: 'Tareas' },
      { href: '#/estudiante/mi-asistencia', icono: 'bi-bar-chart-line',    texto: 'Asistencia' },
    ],
  },
};

export function renderDashboard(container) {
  const usuario = store.getUser() || {};
  const config = DASHBOARD_CONFIG[usuario.rol] || DASHBOARD_CONFIG.estudiante;

  const accesosHTML = config.accesos
    .map(
      (item) => `
      <a href="${item.href}" class="quick-btn">
        <i class="bi ${item.icono}"></i>
        ${escapeHtml(item.texto)}
      </a>
    `
    )
    .join('');

  container.innerHTML = `
    ${renderNavbarHTML()}

    <main class="dash-main">
      <!-- Bienvenida -->
      <div class="welcome-card">
        <div class="welcome-avatar ${config.avatarClase}">
          <i class="bi ${config.icono}"></i>
        </div>
        <div>
          <h2>Bienvenido, <span>${escapeHtml(usuario.nombre || '')} ${escapeHtml(usuario.apellido || '')}</span></h2>
          <p>${escapeHtml(config.subtitulo)}</p>
        </div>
      </div>

      <!-- Información de cuenta -->
      <div class="info-grid">
        <div class="info-card">
          <div class="ic-label">Código de usuario</div>
          <div class="ic-value">${escapeHtml(usuario.usuario || '—')}</div>
        </div>
        <div class="info-card">
          <div class="ic-label">Correo institucional</div>
          <div class="ic-value">${escapeHtml(usuario.correo || '—')}</div>
        </div>
        <div class="info-card">
          <div class="ic-label">Rol</div>
          <div class="ic-value">${escapeHtml(config.rolNombre)}</div>
        </div>
      </div>

      <!-- Accesos rápidos -->
      <div class="quick-panel">
        <h3>Accesos rápidos</h3>
        <div class="quick-grid">
          ${accesosHTML}
        </div>
      </div>
    </main>
  `;

  bindNavbarEvents(container);
}

