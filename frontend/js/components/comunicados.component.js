/**
 * =============================================
 * SANTO TOMÁS DE AQUINO — Componente Comunicados
 * - Admin: CRUD de comunicados (/api/comunicados)
 * - Profesor / Estudiante: Ver comunicados (/api/comunicados/mis)
 * =============================================
 */

import { comunicadosApi } from '../api/comunicados.api.js';
import { store } from '../state.js';
import { escapeHtml, escapeAttr, mostrarAlerta } from '../utils/dom.js';
import { formatearFechaLarga } from '../utils/formatters.js';
import { getDashboardRouteByRole } from '../utils/router.js';
import { renderNavbarHTML, bindNavbarEvents } from './navbar.component.js';

/**
 * Vista Administrador: Gestión de Comunicados
 */
export function renderComunicadosAdmin(container) {
  let comunicadosCache = [];
  let idAEliminar = null;

  container.innerHTML = `
    ${renderNavbarHTML()}

    <main class="dash-main">
      <div class="page-header">
        <div>
          <a href="#/admin" class="back-link">
            <i class="bi bi-arrow-left"></i> Volver al panel
          </a>
          <h2>Comunicados</h2>
          <p>Crea y gestiona comunicados para estudiantes, profesores o todos.</p>
        </div>
        <button id="btnNuevoComunicado" class="btn-primario" type="button">
          <i class="bi bi-megaphone-fill"></i> Nuevo comunicado
        </button>
      </div>

      <div id="alertBox" class="alert-box d-none"></div>

      <div class="filtros">
        <input type="text" id="buscador" placeholder="Buscar por título...">
        <select id="filtroDirigido">
          <option value="">Todos los destinatarios</option>
          <option value="estudiantes">Estudiantes</option>
          <option value="profesores">Profesores</option>
          <option value="todos">Todos</option>
        </select>
      </div>

      <div id="listaComunicados"></div>
    </main>

    <!-- Modal: Crear / Editar comunicado -->
    <div id="modalComunicado" class="modal-overlay d-none">
      <div class="modal-box modal-mediano">
        <div class="modal-header">
          <h3 id="modalTitulo">Nuevo comunicado</h3>
          <button id="btnCerrarModal" class="btn-cerrar" type="button">&times;</button>
        </div>
        <form id="formComunicado" class="modal-body">
          <input type="hidden" id="comunicadoId">

          <div class="form-group">
            <label for="campoTitulo">Título</label>
            <input type="text" id="campoTitulo" placeholder="Ej: Suspensión de actividades" required>
          </div>

          <div class="form-group">
            <label for="campoDirigido">Dirigido a</label>
            <select id="campoDirigido" required>
              <option value="estudiantes">Estudiantes</option>
              <option value="profesores">Profesores</option>
              <option value="todos">Todos</option>
            </select>
          </div>

          <div class="form-group">
            <label for="campoContenido">Contenido</label>
            <textarea id="campoContenido" rows="6" placeholder="Escribe el comunicado aquí..." required></textarea>
          </div>

          <div class="form-group" id="grupoActivo" style="display:none">
            <label for="campoActivo">Estado</label>
            <select id="campoActivo">
              <option value="1">Activo</option>
              <option value="0">Inactivo</option>
            </select>
          </div>

          <div class="modal-footer">
            <button type="button" id="btnCancelar" class="btn-secundario">Cancelar</button>
            <button type="submit" id="btnGuardar" class="btn-primario">Guardar</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal: Confirmar eliminación -->
    <div id="modalConfirmar" class="modal-overlay d-none">
      <div class="modal-box modal-pequeno">
        <div class="modal-header">
          <h3>Confirmar eliminación</h3>
          <button id="btnCerrarConfirmar" class="btn-cerrar" type="button">&times;</button>
        </div>
        <div class="modal-body">
          <p>¿Seguro que deseas eliminar el comunicado <strong id="nombreEliminar"></strong>? Esta acción no se puede deshacer.</p>
          <div class="modal-footer">
            <button type="button" id="btnCancelarEliminar" class="btn-secundario">Cancelar</button>
            <button type="button" id="btnConfirmarEliminar" class="btn-peligro">Eliminar</button>
          </div>
        </div>
      </div>
    </div>
  `;

  bindNavbarEvents(container);

  const listaEl = container.querySelector('#listaComunicados');
  const buscador = container.querySelector('#buscador');
  const filtroDirigido = container.querySelector('#filtroDirigido');
  const modalComunicado = container.querySelector('#modalComunicado');
  const modalTitulo = container.querySelector('#modalTitulo');
  const formComunicado = container.querySelector('#formComunicado');
  const grupoActivo = container.querySelector('#grupoActivo');
  const campoId = container.querySelector('#comunicadoId');
  const campoTitulo = container.querySelector('#campoTitulo');
  const campoDirigido = container.querySelector('#campoDirigido');
  const campoContenido = container.querySelector('#campoContenido');
  const campoActivo = container.querySelector('#campoActivo');
  const modalConfirmar = container.querySelector('#modalConfirmar');
  const nombreEliminar = container.querySelector('#nombreEliminar');

  async function cargarComunicados() {
    try {
      const { ok, data } = await comunicadosApi.listarTodosAdmin();
      if (!ok) {
        listaEl.innerHTML = '<div class="sin-comunicados"><i class="bi bi-exclamation-triangle"></i>Error al cargar comunicados.</div>';
        return;
      }
      comunicadosCache = data.comunicados || [];
      renderizar();
    } catch (error) {
      console.error(error);
      listaEl.innerHTML = '<div class="sin-comunicados"><i class="bi bi-exclamation-triangle"></i>Error de conexión.</div>';
    }
  }

  function renderizar() {
    const texto = buscador.value.trim().toLowerCase();
    const dirigido = filtroDirigido.value;

    const filtrados = comunicadosCache.filter((c) => {
      const coincideTexto = !texto || (c.titulo || '').toLowerCase().includes(texto);
      const coincideDirigido = !dirigido || c.dirigido_a === dirigido;
      return coincideTexto && coincideDirigido;
    });

    if (filtrados.length === 0) {
      listaEl.innerHTML = '<div class="sin-comunicados"><i class="bi bi-megaphone"></i>No hay comunicados.</div>';
      return;
    }

    listaEl.innerHTML = filtrados
      .map(
        (c) => `
      <div class="comunicado-card ${c.activo ? '' : 'inactivo'}">
        <div class="comunicado-titulo">${escapeHtml(c.titulo)}</div>
        <div class="comunicado-meta">
          <span><i class="bi bi-person"></i> ${escapeHtml(c.autor_nombre || '')} ${escapeHtml(c.autor_apellido || '')}</span>
          <span><i class="bi bi-calendar3"></i> ${formatearFechaLarga(c.creado_en)}</span>
          <span><span class="badge-dirigido badge-${escapeAttr(c.dirigido_a)}">${escapeHtml(c.dirigido_a)}</span></span>
          ${c.activo ? '' : '<span class="tag tag-inactivo">Inactivo</span>'}
        </div>
        <div class="comunicado-contenido">${escapeHtml(c.contenido)}</div>
        <div class="acciones-cell">
          <button class="btn-icono icono-editar" title="Editar" data-id="${c.id}">
            <i class="bi bi-pencil-fill"></i>
          </button>
          <button class="btn-icono icono-eliminar" title="Eliminar" data-id="${c.id}" data-nombre="${escapeAttr(c.titulo)}">
            <i class="bi bi-trash-fill"></i>
          </button>
        </div>
      </div>
    `
      )
      .join('');

    listaEl.querySelectorAll('.icono-editar').forEach((btn) => {
      btn.addEventListener('click', () => abrirModalEdicion(btn.dataset.id));
    });
    listaEl.querySelectorAll('.icono-eliminar').forEach((btn) => {
      btn.addEventListener('click', () => abrirModalConfirmar(btn.dataset.id, btn.dataset.nombre));
    });
  }

  function abrirModal() {
    formComunicado.reset();
    campoId.value = '';
    modalTitulo.textContent = 'Nuevo comunicado';
    grupoActivo.style.display = 'none';
    modalComunicado.classList.remove('d-none');
  }

  function abrirModalEdicion(id) {
    const c = comunicadosCache.find((item) => String(item.id) === String(id));
    if (!c) return;

    formComunicado.reset();
    campoId.value = c.id;
    campoTitulo.value = c.titulo || '';
    campoDirigido.value = c.dirigido_a || 'todos';
    campoContenido.value = c.contenido || '';
    campoActivo.value = c.activo ? '1' : '0';

    modalTitulo.textContent = 'Editar comunicado';
    grupoActivo.style.display = '';
    modalComunicado.classList.remove('d-none');
  }

  function cerrarModal() {
    modalComunicado.classList.add('d-none');
  }

  async function guardarComunicado(e) {
    e.preventDefault();

    const id = campoId.value;
    const esEdicion = Boolean(id);

    const payload = {
      titulo: campoTitulo.value.trim(),
      contenido: campoContenido.value.trim(),
      dirigido_a: campoDirigido.value,
    };

    if (esEdicion) {
      payload.activo = Number(campoActivo.value);
    }

    const btnGuardar = container.querySelector('#btnGuardar');
    btnGuardar.disabled = true;
    btnGuardar.textContent = 'Guardando...';

    try {
      const { ok, data } = esEdicion
        ? await comunicadosApi.actualizar(id, payload)
        : await comunicadosApi.crear(payload);

      if (!ok) {
        mostrarAlerta(data.mensaje || 'Error al guardar.', 'error');
        return;
      }

      mostrarAlerta(data.mensaje || 'Comunicado guardado correctamente.', 'exito');
      cerrarModal();
      cargarComunicados();
    } catch (error) {
      console.error(error);
      mostrarAlerta('No se pudo conectar con el servidor.', 'error');
    } finally {
      btnGuardar.disabled = false;
      btnGuardar.textContent = 'Guardar';
    }
  }

  function abrirModalConfirmar(id, nombre) {
    idAEliminar = id;
    nombreEliminar.textContent = nombre;
    modalConfirmar.classList.remove('d-none');
  }

  function cerrarModalConfirmar() {
    modalConfirmar.classList.add('d-none');
    idAEliminar = null;
  }

  async function eliminarComunicadoConfirmado() {
    if (!idAEliminar) return;
    try {
      const { ok, data } = await comunicadosApi.eliminar(idAEliminar);
      if (!ok) {
        mostrarAlerta(data.mensaje || 'Error al eliminar.', 'error');
        cerrarModalConfirmar();
        return;
      }
      mostrarAlerta(data.mensaje || 'Comunicado eliminado correctamente.', 'exito');
      cerrarModalConfirmar();
      cargarComunicados();
    } catch (error) {
      console.error(error);
      mostrarAlerta('No se pudo conectar con el servidor.', 'error');
      cerrarModalConfirmar();
    }
  }

  container.querySelector('#btnNuevoComunicado').addEventListener('click', abrirModal);
  container.querySelector('#btnCerrarModal').addEventListener('click', cerrarModal);
  container.querySelector('#btnCancelar').addEventListener('click', cerrarModal);
  modalComunicado.addEventListener('click', (e) => {
    if (e.target === modalComunicado) cerrarModal();
  });

  container.querySelector('#btnCerrarConfirmar').addEventListener('click', cerrarModalConfirmar);
  container.querySelector('#btnCancelarEliminar').addEventListener('click', cerrarModalConfirmar);
  modalConfirmar.addEventListener('click', (e) => {
    if (e.target === modalConfirmar) cerrarModalConfirmar();
  });
  container.querySelector('#btnConfirmarEliminar').addEventListener('click', eliminarComunicadoConfirmado);

  formComunicado.addEventListener('submit', guardarComunicado);
  buscador.addEventListener('input', renderizar);
  filtroDirigido.addEventListener('change', renderizar);

  cargarComunicados();
}

/**
 * Vista Profesor / Estudiante: Ver Mis Comunicados
 */
export function renderVerComunicados(container) {
  const usuario = store.getUser() || {};
  const backHref = getDashboardRouteByRole(usuario.rol);
  const subtitulo =
    usuario.rol === 'profesor'
      ? 'Comunicados para profesores.'
      : 'Comunicados para estudiantes.';

  container.innerHTML = `
    ${renderNavbarHTML()}

    <main class="dash-main">
      <div class="page-header">
        <div>
          <a href="${backHref}" class="back-link">
            <i class="bi bi-arrow-left"></i> Volver al panel
          </a>
          <h2>Comunicados</h2>
          <p>${escapeHtml(subtitulo)}</p>
        </div>
      </div>

      <div id="listaComunicados">
        <div class="sin-comunicados">Cargando comunicados...</div>
      </div>
    </main>
  `;

  bindNavbarEvents(container);
  const listaEl = container.querySelector('#listaComunicados');

  (async function cargar() {
    try {
      const { ok, data } = await comunicadosApi.listarMisComunicados();
      if (!ok) {
        listaEl.innerHTML = '<div class="sin-comunicados"><i class="bi bi-exclamation-triangle"></i>Error al cargar comunicados.</div>';
        return;
      }

      const comunicados = data.comunicados || [];
      if (comunicados.length === 0) {
        listaEl.innerHTML = '<div class="sin-comunicados"><i class="bi bi-megaphone"></i>No hay comunicados para ti.</div>';
        return;
      }

      listaEl.innerHTML = comunicados
        .map(
          (c) => `
        <div class="comunicado-card">
          <div class="comunicado-titulo">${escapeHtml(c.titulo)}</div>
          <div class="comunicado-meta">
            <span><i class="bi bi-person"></i> ${escapeHtml(c.autor_nombre || '')} ${escapeHtml(c.autor_apellido || '')}</span>
            <span><i class="bi bi-calendar3"></i> ${formatearFechaLarga(c.creado_en)}</span>
          </div>
          <div class="comunicado-contenido" style="margin-bottom:0;">${escapeHtml(c.contenido)}</div>
        </div>
      `
        )
        .join('');
    } catch (error) {
      console.error(error);
      listaEl.innerHTML = '<div class="sin-comunicados"><i class="bi bi-exclamation-triangle"></i>Error de conexión.</div>';
    }
  })();
}

