/**
 * =============================================
 * SANTO TOMÁS DE AQUINO — Componente Actividades (Admin)
 * Historial de auditoría del sistema (/api/actividades)
 * =============================================
 */

import { reportesApi } from '../api/reportes.api.js';
import { escapeHtml } from '../utils/dom.js';
import { formatearFechaHora } from '../utils/formatters.js';
import { renderNavbarHTML, bindNavbarEvents } from './navbar.component.js';

function iconoAccion(accion = '') {
  const mapa = {
    login:               { icono: 'bi-box-arrow-in-right', clase: 'icono-login' },
    usuario_crear:       { icono: 'bi-person-plus',        clase: 'icono-usuario_crear' },
    usuario_editar:      { icono: 'bi-pencil',             clase: 'icono-usuario_editar' },
    usuario_eliminar:    { icono: 'bi-person-x',           clase: 'icono-usuario_eliminar' },
    curso_crear:         { icono: 'bi-plus-circle',        clase: 'icono-curso_crear' },
    curso_editar:        { icono: 'bi-pencil',             clase: 'icono-curso_editar' },
    curso_eliminar:      { icono: 'bi-x-circle',           clase: 'icono-curso_eliminar' },
    comunicado_crear:    { icono: 'bi-megaphone',          clase: 'icono-comunicado_crear' },
    comunicado_editar:   { icono: 'bi-pencil',             clase: 'icono-comunicado_editar' },
    comunicado_eliminar: { icono: 'bi-trash',              clase: 'icono-comunicado_eliminar' },
    matricula_crear:     { icono: 'bi-person-check',       clase: 'icono-matricula_crear' },
    matricula_eliminar:  { icono: 'bi-person-x',           clase: 'icono-matricula_eliminar' },
  };
  if (accion.startsWith('config_')) return { icono: 'bi-gear', clase: 'icono-config' };
  return mapa[accion] || { icono: 'bi-circle', clase: 'icono-config' };
}

function etiquetaAccion(accion = '') {
  const mapa = {
    login:               'Inicio de sesión',
    usuario_crear:       'Usuario creado',
    usuario_editar:      'Usuario editado',
    usuario_eliminar:    'Usuario eliminado',
    curso_crear:         'Curso creado',
    curso_editar:        'Curso editado',
    curso_eliminar:      'Curso eliminado',
    comunicado_crear:    'Comunicado creado',
    comunicado_editar:   'Comunicado editado',
    comunicado_eliminar: 'Comunicado eliminado',
    matricula_crear:     'Matrícula creada',
    matricula_eliminar:  'Matrícula eliminada',
    config_colegio:      'Datos del colegio actualizados',
    config_perfil:       'Perfil actualizado',
    config_password:     'Contraseña cambiada',
  };
  return mapa[accion] || accion;
}

export function renderActividadesAdmin(container) {
  container.innerHTML = `
    ${renderNavbarHTML()}

    <main class="dash-main">
      <div class="page-header">
        <div>
          <a href="#/admin" class="back-link">
            <i class="bi bi-arrow-left"></i> Volver al panel
          </a>
          <h2>Registro de actividades</h2>
          <p>Todas las acciones realizadas en el sistema.</p>
        </div>
      </div>

      <div class="tabla-wrapper" style="overflow: visible;">
        <div id="listaActividades">
          <div class="actividad-item"><span class="celda-vacia" style="padding:1rem">Cargando...</span></div>
        </div>
      </div>
    </main>
  `;

  bindNavbarEvents(container);
  const listaEl = container.querySelector('#listaActividades');

  (async function cargarActividades() {
    try {
      const { ok, data } = await reportesApi.listarActividades();
      if (!ok) {
        listaEl.innerHTML = '<div class="actividad-item"><span class="celda-vacia">Error al cargar.</span></div>';
        return;
      }

      const actividades = data.actividades || [];
      if (actividades.length === 0) {
        listaEl.innerHTML = '<div class="actividad-item"><span class="celda-vacia">No hay actividades registradas.</span></div>';
        return;
      }

      listaEl.innerHTML = actividades
        .map((a) => {
          const icono = iconoAccion(a.accion);
          return `
            <div class="actividad-item">
              <div class="actividad-icono ${icono.clase}">
                <i class="bi ${icono.icono}"></i>
              </div>
              <div class="actividad-contenido">
                <div class="actividad-accion">${escapeHtml(etiquetaAccion(a.accion))}</div>
                <div class="actividad-detalle">${escapeHtml(a.detalle || '')}</div>
                <div class="actividad-meta">
                  ${escapeHtml(a.usuario_nombre_completo || '')} ${escapeHtml(a.usuario_apellido || '')} (@${escapeHtml(a.usuario_nombre || '')}) · ${formatearFechaHora(a.creado_en)}
                </div>
              </div>
            </div>
          `;
        })
        .join('');
    } catch (error) {
      console.error(error);
      listaEl.innerHTML = '<div class="actividad-item"><span class="celda-vacia">Error de conexión.</span></div>';
    }
  })();
}

