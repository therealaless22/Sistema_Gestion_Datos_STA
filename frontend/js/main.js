/**
 * =============================================
 * SANTO TOMÁS DE AQUINO — Punto de Entrada Principal (main.js)
 * Inicializa CSRF, Estado Global y Enrutador SPA con protección por Rol
 * =============================================
 */

import { ensureCsrfToken } from './api/http.js';
import { registerRoute, initRouter } from './utils/router.js';

import { renderLanding } from './components/landing.component.js';
import { renderLogin } from './components/login.component.js';
import { renderDashboard } from './components/dashboard.component.js';
import { renderUsuariosAdmin } from './components/usuarios.component.js';
import { renderCursosAdmin, renderMisCursosProfesor } from './components/cursos.component.js';
import {
  renderHorariosAdmin,
  renderMiHorarioProfesor,
  renderMiHorarioEstudiante,
} from './components/horarios.component.js';
import {
  renderRegistrarNotasProfesor,
  renderMisNotasEstudiante,
} from './components/notas.component.js';
import {
  renderAsistenciaProfesor,
  renderMiAsistenciaEstudiante,
} from './components/asistencia.component.js';
import {
  renderTareasProfesor,
  renderMisTareasEstudiante,
  renderRevisionTareasAdmin,
} from './components/tareas.component.js';
import {
  renderComunicadosAdmin,
  renderVerComunicados,
} from './components/comunicados.component.js';
import {
  renderMensajesProfesor,
  renderMisMensajesEstudiante,
} from './components/mensajes.component.js';
import { renderMatriculasAdmin } from './components/matriculas.component.js';
import { renderConfiguracionAdmin } from './components/configuracion.component.js';
import { renderReportesAdmin } from './components/reportes.component.js';
import { renderActividadesAdmin } from './components/actividades.component.js';

// ── 1. Rutas Públicas ─────────────────────────
registerRoute('/', {
  render: renderLanding,
  title: 'I.E.P. Santo Tomás de Aquino',
});

registerRoute('/login', {
  render: renderLogin,
  publicOnly: true,
  title: 'Santo Tomás de Aquino — Acceso',
});

// ── 2. Rutas de Administrador ─────────────────
registerRoute('/admin', {
  render: renderDashboard,
  roles: ['administrador'],
  title: 'Santo Tomás — Administrador',
});

registerRoute('/admin/usuarios', {
  render: renderUsuariosAdmin,
  roles: ['administrador'],
  title: 'Santo Tomás — Gestionar usuarios',
});

registerRoute('/admin/cursos', {
  render: renderCursosAdmin,
  roles: ['administrador'],
  title: 'Santo Tomás — Cursos',
});

registerRoute('/admin/horarios', {
  render: renderHorariosAdmin,
  roles: ['administrador'],
  title: 'Santo Tomás — Horarios',
});

registerRoute('/admin/matriculas', {
  render: renderMatriculasAdmin,
  roles: ['administrador'],
  title: 'Santo Tomás — Matrículas',
});

registerRoute('/admin/comunicados', {
  render: renderComunicadosAdmin,
  roles: ['administrador'],
  title: 'Santo Tomás — Comunicados',
});

registerRoute('/admin/revision-tareas', {
  render: renderRevisionTareasAdmin,
  roles: ['administrador'],
  title: 'Santo Tomás — Revisión de tareas',
});

registerRoute('/admin/reportes', {
  render: renderReportesAdmin,
  roles: ['administrador'],
  title: 'Santo Tomás — Reportes',
});

registerRoute('/admin/actividades', {
  render: renderActividadesAdmin,
  roles: ['administrador'],
  title: 'Santo Tomás — Actividades',
});

registerRoute('/admin/configuracion', {
  render: renderConfiguracionAdmin,
  roles: ['administrador'],
  title: 'Santo Tomás — Configuración',
});

// ── 3. Rutas de Profesor ──────────────────────
registerRoute('/profesor', {
  render: renderDashboard,
  roles: ['profesor'],
  title: 'Santo Tomás — Profesor',
});

registerRoute('/profesor/comunicados', {
  render: renderVerComunicados,
  roles: ['profesor', 'administrador'],
  title: 'Santo Tomás — Comunicados',
});

registerRoute('/profesor/mis-cursos', {
  render: renderMisCursosProfesor,
  roles: ['profesor'],
  title: 'Santo Tomás — Mis cursos',
});

registerRoute('/profesor/registrar-notas', {
  render: renderRegistrarNotasProfesor,
  roles: ['profesor'],
  title: 'Santo Tomás — Registrar Notas',
});

registerRoute('/profesor/horario', {
  render: renderMiHorarioProfesor,
  roles: ['profesor'],
  title: 'Santo Tomás — Mi Horario',
});

registerRoute('/profesor/asistencia', {
  render: renderAsistenciaProfesor,
  roles: ['profesor'],
  title: 'Santo Tomás — Asistencia',
});

registerRoute('/profesor/mensajes', {
  render: renderMensajesProfesor,
  roles: ['profesor'],
  title: 'Santo Tomás — Mensajes',
});

registerRoute('/profesor/tareas', {
  render: renderTareasProfesor,
  roles: ['profesor'],
  title: 'Santo Tomás — Tareas',
});

// ── 4. Rutas de Estudiante ────────────────────
registerRoute('/estudiante', {
  render: renderDashboard,
  roles: ['estudiante'],
  title: 'Santo Tomás — Estudiante',
});

registerRoute('/estudiante/comunicados', {
  render: renderVerComunicados,
  roles: ['estudiante', 'administrador'],
  title: 'Santo Tomás — Comunicados',
});

registerRoute('/estudiante/mis-notas', {
  render: renderMisNotasEstudiante,
  roles: ['estudiante'],
  title: 'Santo Tomás — Mis Notas',
});

registerRoute('/estudiante/mi-horario', {
  render: renderMiHorarioEstudiante,
  roles: ['estudiante'],
  title: 'Santo Tomás — Mi Horario',
});

registerRoute('/estudiante/mis-mensajes', {
  render: renderMisMensajesEstudiante,
  roles: ['estudiante'],
  title: 'Santo Tomás — Mis Mensajes',
});

registerRoute('/estudiante/mis-tareas', {
  render: renderMisTareasEstudiante,
  roles: ['estudiante'],
  title: 'Santo Tomás — Mis Tareas',
});

registerRoute('/estudiante/mi-asistencia', {
  render: renderMiAsistenciaEstudiante,
  roles: ['estudiante'],
  title: 'Santo Tomás — Mi Asistencia',
});

// ── Inicialización de la Aplicación ───────────
document.addEventListener('DOMContentLoaded', async () => {
  // Pre-cargar token CSRF opcional desde /api/csrf-token
  ensureCsrfToken();

  // Iniciar enrutador SPA
  initRouter();
});

