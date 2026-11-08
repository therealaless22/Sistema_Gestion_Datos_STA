/**
 * =============================================
 * SANTO TOMÁS DE AQUINO — Componente Matrículas (Admin)
 * Gestión de matrículas (/api/matriculas, /estudiantes, /secciones)
 * =============================================
 */

import { matriculasApi } from '../api/matriculas.api.js';
import { escapeHtml, escapeAttr, mostrarAlerta } from '../utils/dom.js';
import { renderNavbarHTML, bindNavbarEvents } from './navbar.component.js';

const GRADOS_DEFAULT = [
  '1er grado',
  '2do grado',
  '3er grado',
  '4to grado',
  '5to grado',
  '6to grado',
  '1ro Secundaria',
  '2do Secundaria',
  '3ro Secundaria',
  '4to Secundaria',
  '5to Secundaria',
];

const SECCIONES_DEFAULT = ['A', 'B', 'C', 'D'];

export function renderMatriculasAdmin(container) {
  let matriculasCache = [];
  let idAEliminar = null;

  container.innerHTML = `
    ${renderNavbarHTML()}

    <main class="dash-main">
      <div class="page-header">
        <div>
          <a href="#/admin" class="back-link">
            <i class="bi bi-arrow-left"></i> Volver al panel
          </a>
          <h2>Matrículas</h2>
          <p>Asigna estudiantes a su grado y sección correspondiente.</p>
        </div>
        <button id="btnNuevaMatricula" class="btn-primario" type="button">
          <i class="bi bi-person-plus-fill"></i> Nueva matrícula
        </button>
      </div>

      <div id="alertBox" class="alert-box d-none"></div>

      <div class="filtros">
        <input type="text" id="buscador" placeholder="Buscar por grado, sección o estudiante...">
        <select id="filtroGrado">
          <option value="">Todos los grados</option>
        </select>
        <select id="filtroSeccion">
          <option value="">Todas las secciones</option>
        </select>
      </div>

      <div class="tabla-wrapper">
        <table class="tabla-usuarios">
          <thead>
            <tr>
              <th>ID</th>
              <th>Grado</th>
              <th>Sección</th>
              <th>Estudiante</th>
              <th>Usuario</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody id="tablaBody">
            <tr><td colspan="6" class="celda-vacia">Cargando matrículas...</td></tr>
          </tbody>
        </table>
      </div>
    </main>

    <!-- Modal: Nueva matrícula -->
    <div id="modalMatricula" class="modal-overlay d-none">
      <div class="modal-box modal-pequeno">
        <div class="modal-header">
          <h3>Nueva matrícula</h3>
          <button id="btnCerrarModal" class="btn-cerrar" type="button">&times;</button>
        </div>
        <form id="formMatricula" class="modal-body">
          <div class="form-group">
            <label for="campoGrado">Grado</label>
            <select id="campoGrado" required>
              <option value="">Seleccionar grado...</option>
            </select>
          </div>
          <div class="form-group">
            <label for="campoSeccion">Sección</label>
            <select id="campoSeccion" required>
              <option value="">Seleccionar sección...</option>
            </select>
          </div>
          <div class="form-group">
            <label for="campoEstudiante">Estudiante</label>
            <select id="campoEstudiante" required>
              <option value="">Seleccionar estudiante...</option>
            </select>
          </div>
          <div class="modal-footer">
            <button type="button" id="btnCancelar" class="btn-secundario">Cancelar</button>
            <button type="submit" id="btnGuardar" class="btn-primario">Matricular</button>
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
          <p>¿Seguro que deseas eliminar esta matrícula?</p>
          <p class="mt-2"><strong id="nombreEliminar"></strong></p>
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
  const filtroGrado = container.querySelector('#filtroGrado');
  const filtroSeccion = container.querySelector('#filtroSeccion');
  const modalMatricula = container.querySelector('#modalMatricula');
  const formMatricula = container.querySelector('#formMatricula');
  const campoGrado = container.querySelector('#campoGrado');
  const campoSeccion = container.querySelector('#campoSeccion');
  const campoEstudiante = container.querySelector('#campoEstudiante');
  const modalConfirmar = container.querySelector('#modalConfirmar');
  const nombreEliminar = container.querySelector('#nombreEliminar');

  async function cargarSeccionesYGrados() {
    let grados = [...GRADOS_DEFAULT];
    let secciones = [...SECCIONES_DEFAULT];

    try {
      const { ok, data } = await matriculasApi.listarSecciones();
      if (ok && data) {
        if (Array.isArray(data.grados) && data.grados.length) {
          grados = [...new Set([...grados, ...data.grados])];
        }
        if (Array.isArray(data.secciones) && data.secciones.length) {
          const secExtra = data.secciones.map((s) => (typeof s === 'string' ? s : s.seccion || s.nombre)).filter(Boolean);
          secciones = [...new Set([...secciones, ...secExtra])];
        }
      }
    } catch {
      // Fallback a lista predeterminada
    }

    const opcionesGrados = grados
      .map((g) => `<option value="${escapeAttr(g)}">${escapeHtml(g)}</option>`)
      .join('');
    const opcionesSecciones = secciones
      .map((s) => `<option value="${escapeAttr(s)}">${escapeHtml(s)}</option>`)
      .join('');

    filtroGrado.innerHTML = '<option value="">Todos los grados</option>' + opcionesGrados;
    filtroSeccion.innerHTML = '<option value="">Todas las secciones</option>' + opcionesSecciones;
    campoGrado.innerHTML = '<option value="">Seleccionar grado...</option>' + opcionesGrados;
    campoSeccion.innerHTML = '<option value="">Seleccionar sección...</option>' + opcionesSecciones;
  }

  async function cargarMatriculas() {
    try {
      const { ok, data } = await matriculasApi.listar();
      if (!ok) {
        tablaBody.innerHTML = '<tr><td colspan="6" class="celda-vacia">Error al cargar.</td></tr>';
        return;
      }
      matriculasCache = data.matriculas || [];
      renderizarTabla();
    } catch (error) {
      console.error(error);
      tablaBody.innerHTML = '<tr><td colspan="6" class="celda-vacia">Error al cargar.</td></tr>';
    }
  }

  async function cargarEstudiantes() {
    try {
      const { ok, data } = await matriculasApi.listarEstudiantes();
      if (!ok || !data.estudiantes) return;
      campoEstudiante.innerHTML =
        '<option value="">Seleccionar estudiante...</option>' +
        data.estudiantes
          .map(
            (e) =>
              `<option value="${e.id}">${escapeHtml(e.nombre)} ${escapeHtml(e.apellido)} (${escapeHtml(e.usuario)})</option>`
          )
          .join('');
    } catch (error) {
      console.error(error);
    }
  }

  function renderizarTabla() {
    const texto = buscador.value.trim().toLowerCase();
    const gradoFiltro = filtroGrado.value;
    const seccionFiltro = filtroSeccion.value;

    const filtrados = matriculasCache.filter((m) => {
      const coincideGrado = !gradoFiltro || m.grado === gradoFiltro;
      const coincideSeccion = !seccionFiltro || m.seccion === seccionFiltro;
      const coincideTexto =
        !texto ||
        (m.grado || '').toLowerCase().includes(texto) ||
        (m.seccion || '').toLowerCase().includes(texto) ||
        `${m.estudiante_nombre || ''} ${m.estudiante_apellido || ''}`.toLowerCase().includes(texto) ||
        (m.estudiante_usuario || '').toLowerCase().includes(texto);
      return coincideGrado && coincideSeccion && coincideTexto;
    });

    if (filtrados.length === 0) {
      tablaBody.innerHTML = '<tr><td colspan="6" class="celda-vacia">No hay matrículas.</td></tr>';
      return;
    }

    tablaBody.innerHTML = filtrados
      .map(
        (m) => `
      <tr>
        <td>${m.id}</td>
        <td>${escapeHtml(m.grado)}</td>
        <td>${escapeHtml(m.seccion)}</td>
        <td>${escapeHtml(m.estudiante_nombre)} ${escapeHtml(m.estudiante_apellido)}</td>
        <td>${escapeHtml(m.estudiante_usuario)}</td>
        <td>
          <button
            class="btn-icono icono-eliminar"
            title="Eliminar"
            data-id="${m.id}"
            data-nombre="${escapeAttr(`${m.estudiante_nombre} ${m.estudiante_apellido} - ${m.grado} "${m.seccion}"`)}"
          >
            <i class="bi bi-trash-fill"></i>
          </button>
        </td>
      </tr>
    `
      )
      .join('');

    tablaBody.querySelectorAll('.icono-eliminar').forEach((btn) => {
      btn.addEventListener('click', () => abrirModalConfirmar(btn.dataset.id, btn.dataset.nombre));
    });
  }

  function abrirModal() {
    formMatricula.reset();
    modalMatricula.classList.remove('d-none');
  }

  function cerrarModal() {
    modalMatricula.classList.add('d-none');
  }

  async function guardarMatricula(e) {
    e.preventDefault();
    const payload = {
      estudiante_id: Number(campoEstudiante.value),
      grado: campoGrado.value,
      seccion: campoSeccion.value,
    };

    const btn = container.querySelector('#btnGuardar');
    btn.disabled = true;
    btn.textContent = 'Matriculando...';

    try {
      const { ok, data } = await matriculasApi.crear(payload);
      if (!ok) {
        mostrarAlerta(data.mensaje || 'Error al matricular.', 'error');
        return;
      }
      mostrarAlerta(data.mensaje || 'Matrícula registrada correctamente.', 'exito');
      cerrarModal();
      cargarMatriculas();
    } catch (error) {
      console.error(error);
      mostrarAlerta('Error de conexión.', 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Matricular';
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

  async function eliminarMatriculaConfirmado() {
    if (!idAEliminar) return;
    try {
      const { ok, data } = await matriculasApi.eliminar(idAEliminar);
      if (!ok) {
        mostrarAlerta(data.mensaje || 'Error al eliminar.', 'error');
        cerrarModalConfirmar();
        return;
      }
      mostrarAlerta(data.mensaje || 'Matrícula eliminada.', 'exito');
      cerrarModalConfirmar();
      cargarMatriculas();
    } catch (error) {
      console.error(error);
      mostrarAlerta('Error de conexión.', 'error');
      cerrarModalConfirmar();
    }
  }

  container.querySelector('#btnNuevaMatricula').addEventListener('click', abrirModal);
  container.querySelector('#btnCerrarModal').addEventListener('click', cerrarModal);
  container.querySelector('#btnCancelar').addEventListener('click', cerrarModal);
  modalMatricula.addEventListener('click', (e) => {
    if (e.target === modalMatricula) cerrarModal();
  });

  container.querySelector('#btnCerrarConfirmar').addEventListener('click', cerrarModalConfirmar);
  container.querySelector('#btnCancelarEliminar').addEventListener('click', cerrarModalConfirmar);
  modalConfirmar.addEventListener('click', (e) => {
    if (e.target === modalConfirmar) cerrarModalConfirmar();
  });
  container.querySelector('#btnConfirmarEliminar').addEventListener('click', eliminarMatriculaConfirmado);

  formMatricula.addEventListener('submit', guardarMatricula);
  buscador.addEventListener('input', renderizarTabla);
  filtroGrado.addEventListener('change', renderizarTabla);
  filtroSeccion.addEventListener('change', renderizarTabla);

  (async function init() {
    await cargarSeccionesYGrados();
    await Promise.all([cargarMatriculas(), cargarEstudiantes()]);
  })();
}

