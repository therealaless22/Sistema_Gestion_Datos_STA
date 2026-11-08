/**
 * =============================================
 * SANTO TOMÁS DE AQUINO — Componente Cursos
 * - Admin: CRUD de cursos (/api/cursos)
 * - Profesor: Mis cursos asignados (/api/cursos/mis-cursos)
 * =============================================
 */

import { cursosApi } from '../api/cursos.api.js';
import { escapeHtml, escapeAttr, mostrarAlerta } from '../utils/dom.js';
import { formatHora } from '../utils/formatters.js';
import { renderNavbarHTML, bindNavbarEvents } from './navbar.component.js';

/**
 * Vista Administrador: Gestión de Cursos
 */
export function renderCursosAdmin(container) {
  let cursosCache = [];
  let idAEliminar = null;

  container.innerHTML = `
    ${renderNavbarHTML()}

    <main class="dash-main">
      <div class="page-header">
        <div>
          <a href="#/admin" class="back-link">
            <i class="bi bi-arrow-left"></i> Volver al panel
          </a>
          <h2>Cursos</h2>
          <p>Crea, edita o elimina los cursos (materias) del colegio. El profesor y el año se asignan en Horarios.</p>
        </div>

        <button id="btnNuevoCurso" class="btn-primario" type="button">
          <i class="bi bi-plus-circle-fill"></i> Nuevo curso
        </button>
      </div>

      <div id="alertBox" class="alert-box d-none"></div>

      <div class="filtros">
        <input type="text" id="buscador" placeholder="Buscar por nombre...">
      </div>

      <div class="tabla-wrapper">
        <table class="tabla-usuarios">
          <thead>
            <tr>
              <th>ID</th>
              <th>Curso</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody id="tablaBody">
            <tr><td colspan="3" class="celda-vacia">Cargando cursos...</td></tr>
          </tbody>
        </table>
      </div>
    </main>

    <!-- Modal: Crear / Editar curso -->
    <div id="modalCurso" class="modal-overlay d-none">
      <div class="modal-box">
        <div class="modal-header">
          <h3 id="modalTitulo">Nuevo curso</h3>
          <button id="btnCerrarModal" class="btn-cerrar" type="button">&times;</button>
        </div>

        <form id="formCurso" class="modal-body">
          <input type="hidden" id="cursoId">

          <div class="form-group">
            <label for="campoNombre">Nombre del curso</label>
            <input type="text" id="campoNombre" placeholder="Ej: Matemática" required>
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
          <p>¿Seguro que deseas eliminar el curso <strong id="nombreEliminar"></strong>? Esta acción no se puede deshacer.</p>
          <div class="modal-footer">
            <button type="button" id="btnCancelarEliminar" class="btn-secundario">Cancelar</button>
            <button type="button" id="btnConfirmarEliminar" class="btn-peligro">Eliminar</button>
          </div>
        </div>
      </div>
    </div>
  `;

  bindNavbarEvents(container);

  const tablaBody = container.querySelector('#tablaBody');
  const buscador = container.querySelector('#buscador');
  const modalCurso = container.querySelector('#modalCurso');
  const modalTitulo = container.querySelector('#modalTitulo');
  const formCurso = container.querySelector('#formCurso');
  const campoId = container.querySelector('#cursoId');
  const campoNombre = container.querySelector('#campoNombre');
  const modalConfirmar = container.querySelector('#modalConfirmar');
  const nombreEliminar = container.querySelector('#nombreEliminar');

  async function cargarCursos() {
    try {
      const { ok, data } = await cursosApi.listar();
      if (!ok) {
        mostrarAlerta(data.mensaje || 'No se pudieron cargar los cursos.', 'error');
        tablaBody.innerHTML = '<tr><td colspan="3" class="celda-vacia">Error al cargar cursos.</td></tr>';
        return;
      }
      cursosCache = data.cursos || [];
      renderizarTabla();
    } catch (error) {
      console.error(error);
      mostrarAlerta('No se pudo conectar con el servidor.', 'error');
      tablaBody.innerHTML = '<tr><td colspan="3" class="celda-vacia">Error de conexión.</td></tr>';
    }
  }

  function renderizarTabla() {
    const texto = buscador.value.trim().toLowerCase();
    const filtrados = cursosCache.filter(
      (c) => !texto || (c.nombre || '').toLowerCase().includes(texto)
    );

    if (filtrados.length === 0) {
      tablaBody.innerHTML = '<tr><td colspan="3" class="celda-vacia">No se encontraron cursos.</td></tr>';
      return;
    }

    tablaBody.innerHTML = filtrados
      .map(
        (c) => `
      <tr>
        <td>${c.id}</td>
        <td>${escapeHtml(c.nombre)}</td>
        <td>
          <div class="acciones-cell">
            <button class="btn-icono icono-editar" title="Editar" data-id="${c.id}">
              <i class="bi bi-pencil-fill"></i>
            </button>
            <button class="btn-icono icono-eliminar" title="Eliminar" data-id="${c.id}" data-nombre="${escapeAttr(c.nombre)}">
              <i class="bi bi-trash-fill"></i>
            </button>
          </div>
        </td>
      </tr>
    `
      )
      .join('');

    tablaBody.querySelectorAll('.icono-editar').forEach((btn) => {
      btn.addEventListener('click', () => abrirModalEdicion(btn.dataset.id));
    });
    tablaBody.querySelectorAll('.icono-eliminar').forEach((btn) => {
      btn.addEventListener('click', () => abrirModalConfirmar(btn.dataset.id, btn.dataset.nombre));
    });
  }

  function abrirModal() {
    formCurso.reset();
    campoId.value = '';
    modalTitulo.textContent = 'Nuevo curso';
    modalCurso.classList.remove('d-none');
  }

  function abrirModalEdicion(id) {
    const c = cursosCache.find((item) => String(item.id) === String(id));
    if (!c) return;
    formCurso.reset();
    campoId.value = c.id;
    campoNombre.value = c.nombre || '';
    modalTitulo.textContent = 'Editar curso';
    modalCurso.classList.remove('d-none');
  }

  function cerrarModal() {
    modalCurso.classList.add('d-none');
  }

  async function guardarCurso(e) {
    e.preventDefault();
    const id = campoId.value;
    const esEdicion = Boolean(id);
    const payload = { nombre: campoNombre.value.trim() };

    const btnGuardar = container.querySelector('#btnGuardar');
    btnGuardar.disabled = true;
    btnGuardar.textContent = 'Guardando...';

    try {
      const { ok, data } = esEdicion
        ? await cursosApi.actualizar(id, payload)
        : await cursosApi.crear(payload);

      if (!ok) {
        mostrarAlerta(data.mensaje || 'Error al guardar el curso.', 'error');
        return;
      }

      mostrarAlerta(data.mensaje || 'Curso guardado correctamente.', 'exito');
      cerrarModal();
      cargarCursos();
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

  async function eliminarCursoConfirmado() {
    if (!idAEliminar) return;
    try {
      const { ok, data } = await cursosApi.eliminar(idAEliminar);
      if (!ok) {
        mostrarAlerta(data.mensaje || 'Error al eliminar el curso.', 'error');
        cerrarModalConfirmar();
        return;
      }
      mostrarAlerta(data.mensaje || 'Curso eliminado correctamente.', 'exito');
      cerrarModalConfirmar();
      cargarCursos();
    } catch (error) {
      console.error(error);
      mostrarAlerta('No se pudo conectar con el servidor.', 'error');
      cerrarModalConfirmar();
    }
  }

  container.querySelector('#btnNuevoCurso').addEventListener('click', abrirModal);
  container.querySelector('#btnCerrarModal').addEventListener('click', cerrarModal);
  container.querySelector('#btnCancelar').addEventListener('click', cerrarModal);
  modalCurso.addEventListener('click', (e) => {
    if (e.target === modalCurso) cerrarModal();
  });

  container.querySelector('#btnCerrarConfirmar').addEventListener('click', cerrarModalConfirmar);
  container.querySelector('#btnCancelarEliminar').addEventListener('click', cerrarModalConfirmar);
  modalConfirmar.addEventListener('click', (e) => {
    if (e.target === modalConfirmar) cerrarModalConfirmar();
  });
  container.querySelector('#btnConfirmarEliminar').addEventListener('click', eliminarCursoConfirmado);

  formCurso.addEventListener('submit', guardarCurso);
  buscador.addEventListener('input', renderizarTabla);

  cargarCursos();
}

/**
 * Vista Profesor: Mis Cursos Asignados
 */
export function renderMisCursosProfesor(container) {
  container.innerHTML = `
    ${renderNavbarHTML()}

    <main class="dash-main">
      <div class="page-header">
        <div>
          <a href="#/profesor" class="back-link">
            <i class="bi bi-arrow-left"></i> Volver al panel
          </a>
          <h2>Mis cursos</h2>
          <p>Cursos asignados a tu cuenta este período.</p>
        </div>
      </div>

      <div class="tabla-wrapper">
        <table class="tabla-usuarios">
          <thead>
            <tr>
              <th>Curso</th>
              <th>Año</th>
              <th>Día</th>
              <th>Hora</th>
            </tr>
          </thead>
          <tbody id="tablaCursos">
            <tr><td colspan="4" class="celda-vacia">Cargando cursos...</td></tr>
          </tbody>
        </table>
      </div>
    </main>
  `;

  bindNavbarEvents(container);
  const tablaCursos = container.querySelector('#tablaCursos');

  (async function cargar() {
    try {
      const { ok, data } = await cursosApi.listarMisCursosProfesor();
      if (!ok) {
        tablaCursos.innerHTML = `<tr><td colspan="4" class="celda-vacia">${escapeHtml(data.mensaje || 'Error al cargar cursos.')}</td></tr>`;
        return;
      }

      const cursos = data.cursos || [];
      if (cursos.length === 0) {
        tablaCursos.innerHTML = '<tr><td colspan="4" class="celda-vacia">No tienes cursos asignados.</td></tr>';
        return;
      }

      tablaCursos.innerHTML = cursos
        .map(
          (curso) => `
        <tr>
          <td><strong>${escapeHtml(curso.curso_nombre)}</strong></td>
          <td>${escapeHtml(curso.anio)}</td>
          <td>${escapeHtml(curso.dia)}</td>
          <td>${formatHora(curso.hora_inicio)} - ${formatHora(curso.hora_fin)}</td>
        </tr>
      `
        )
        .join('');
    } catch (error) {
      console.error(error);
      tablaCursos.innerHTML = '<tr><td colspan="4" class="celda-vacia">Error de conexión con el servidor.</td></tr>';
    }
  })();
}

