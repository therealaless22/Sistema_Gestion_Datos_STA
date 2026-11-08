/**
 * =============================================
 * SANTO TOMÁS DE AQUINO — Componente Tareas y Entregas
 * - Profesor: Crear, editar, eliminar tareas y calificar entregas (/api/tareas, /api/entregas/:id/calificar)
 * - Estudiante: Ver y entregar tareas (/api/tareas/mis-tareas-estudiante, /api/entregas)
 * - Administrador: Revisión mensual de tareas subidas (/api/tareas/admin)
 * =============================================
 */

import { tareasApi } from '../api/tareas.api.js';
import { cursosApi } from '../api/cursos.api.js';
import { escapeHtml, escapeAttr, mostrarAlerta, resolveFileUrl } from '../utils/dom.js';
import { formatearFecha, formatearFechaHora, notaConLetraHTML } from '../utils/formatters.js';
import { esNotaValida } from '../utils/validators.js';
import { renderNavbarHTML, bindNavbarEvents } from './navbar.component.js';

/**
 * Vista Profesor: Gestión de Tareas y Calificación de Entregas
 */
export function renderTareasProfesor(container) {
  let tareasCache = [];
  let tareaAEliminar = null;

  container.innerHTML = `
    ${renderNavbarHTML()}

    <main class="dash-main">
      <div class="page-header">
        <div>
          <a href="#/profesor" class="back-link">
            <i class="bi bi-arrow-left"></i> Volver al panel
          </a>
          <h2>Tareas</h2>
          <p>Crea, edita o elimina tareas para tus cursos y califica las entregas.</p>
        </div>
        <button id="btnNuevaTarea" class="btn-primario" type="button">
          <i class="bi bi-plus-circle-fill"></i> Nueva tarea
        </button>
      </div>

      <div id="alertBox" class="alert-box d-none"></div>

      <div class="tabla-wrapper">
        <table class="tabla-usuarios">
          <thead>
            <tr>
              <th>Curso</th>
              <th>Título</th>
              <th>Tipo</th>
              <th>Fecha límite</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody id="tablaTareas">
            <tr><td colspan="5" class="celda-vacia">Cargando tareas...</td></tr>
          </tbody>
        </table>
      </div>
    </main>

    <!-- Modal: Crear/Editar tarea -->
    <div id="modalTarea" class="modal-overlay d-none">
      <div class="modal-box">
        <div class="modal-header">
          <h3 id="modalTitulo">Nueva tarea</h3>
          <button id="btnCerrarModal" class="btn-cerrar" type="button">&times;</button>
        </div>
        <div class="modal-body">
          <input type="hidden" id="tareaId"/>

          <div class="form-group">
            <label for="campoCurso">Curso</label>
            <select id="campoCurso" required>
              <option value="">— Selecciona un curso —</option>
            </select>
          </div>

          <div class="form-group">
            <label for="campoTitulo">Título</label>
            <input type="text" id="campoTitulo" placeholder="Ej: Práctica Calificada 1" required/>
          </div>

          <div class="form-group">
            <label for="campoDescripcion">Indicaciones</label>
            <textarea
              id="campoDescripcion"
              rows="4"
              placeholder="Escribe las indicaciones de la tarea..."
            ></textarea>
          </div>

          <div class="form-group">
            <label for="campoFecha">Fecha límite de entrega</label>
            <input type="date" id="campoFecha"/>
          </div>

          <div class="form-group">
            <label>Tipo de tarea</label>
            <div style="display:flex; gap:0.75rem; margin-top:0.35rem;">
              <label style="display:flex;align-items:center;gap:0.4rem;cursor:pointer;font-size:0.88rem;font-weight:400;">
                <input type="radio" name="tipoTarea" id="tipoConArchivo" value="false" checked style="width:auto;"/>
                Con archivo adjunto
              </label>
              <label style="display:flex;align-items:center;gap:0.4rem;cursor:pointer;font-size:0.88rem;font-weight:400;">
                <input type="radio" name="tipoTarea" id="tipoSoloTexto" value="true" style="width:auto;"/>
                Solo indicaciones (texto)
              </label>
            </div>
          </div>

          <div class="form-group" id="grupoArchivo">
            <label for="campoArchivo">Archivo (PDF o Word)</label>
            <input type="file" id="campoArchivo" accept=".pdf,.doc,.docx"/>
            <span class="form-hint" id="archivoActual"></span>
          </div>

          <div class="modal-footer">
            <button type="button" id="btnCancelar" class="btn-secundario">Cancelar</button>
            <button type="button" id="btnGuardar" class="btn-primario">Guardar</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Ver entregas -->
    <div id="modalEntregas" class="modal-overlay d-none">
      <div class="modal-box modal-grande">
        <div class="modal-header">
          <h3 id="tituloEntregas">Entregas</h3>
          <button id="btnCerrarEntregas" class="btn-cerrar" type="button">&times;</button>
        </div>
        <div class="modal-body">
          <div class="tabla-wrapper" style="box-shadow:none;">
            <table class="tabla-usuarios">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Alumno</th>
                  <th>Estado</th>
                  <th>Evidencia</th>
                  <th>Comentario</th>
                  <th>Fecha entrega</th>
                  <th>Nota</th>
                </tr>
              </thead>
              <tbody id="tablaEntregas">
                <tr><td colspan="7" class="celda-vacia">Cargando...</td></tr>
              </tbody>
            </table>
          </div>
        </div>
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
          <p>¿Seguro que deseas eliminar la tarea <strong id="nombreEliminar"></strong>? Se eliminarán también todas las entregas.</p>
          <div class="modal-footer">
            <button type="button" id="btnCancelarEliminar" class="btn-secundario">Cancelar</button>
            <button type="button" id="btnConfirmarEliminar" class="btn-peligro">Eliminar</button>
          </div>
        </div>
      </div>
    </div>
  `;

  bindNavbarEvents(container);

  const tablaTareas = container.querySelector('#tablaTareas');
  const modalTarea = container.querySelector('#modalTarea');
  const modalEntregas = container.querySelector('#modalEntregas');
  const modalConfirmar = container.querySelector('#modalConfirmar');
  const btnGuardar = container.querySelector('#btnGuardar');
  const grupoArchivo = container.querySelector('#grupoArchivo');

  container.querySelectorAll('input[name="tipoTarea"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      grupoArchivo.style.display = container.querySelector('#tipoSoloTexto').checked ? 'none' : 'block';
    });
  });

  async function cargarCursosModal() {
    const select = container.querySelector('#campoCurso');
    select.innerHTML = '<option value="">— Selecciona un curso —</option>';
    try {
      const { ok, data } = await cursosApi.listarMisCursosProfesor();
      if (!ok || !data.cursos?.length) return;
      data.cursos.forEach((c) => {
        const opt = document.createElement('option');
        opt.value = c.horario_id;
        opt.textContent = `${c.curso_nombre} — ${c.anio}`;
        select.appendChild(opt);
      });
    } catch (err) {
      console.error('Error cargando cursos:', err);
    }
  }

  async function cargarTareas() {
    try {
      const { ok, data } = await tareasApi.listarProfesor();
      if (!ok) {
        tablaTareas.innerHTML = `<tr><td colspan="5" class="celda-vacia">${escapeHtml(data.mensaje || 'Error al cargar tareas.')}</td></tr>`;
        return;
      }

      tareasCache = data.tareas || [];
      if (!tareasCache.length) {
        tablaTareas.innerHTML = '<tr><td colspan="5" class="celda-vacia">No has creado tareas aún.</td></tr>';
        return;
      }

      tablaTareas.innerHTML = tareasCache
        .map(
          (t) => `
        <tr>
          <td>${escapeHtml(t.curso_nombre)} — ${escapeHtml(t.anio)}</td>
          <td>
            <strong>${escapeHtml(t.titulo)}</strong>
            ${
              t.archivo_url
                ? `<br><a href="${escapeAttr(resolveFileUrl(t.archivo_url))}" target="_blank" style="font-size:0.78rem;color:#1a3a5c;">
                    <i class="bi bi-paperclip"></i> Ver archivo
                   </a>`
                : ''
            }
          </td>
          <td>
            <span class="tag ${t.solo_indicaciones ? 'tag-profesor' : 'tag-estudiante'}">
              ${t.solo_indicaciones ? 'Solo texto' : 'Con archivo'}
            </span>
          </td>
          <td>${formatearFecha(t.fecha_entrega)}</td>
          <td>
            <div class="acciones-cell">
              <button class="btn-icono btn-ver-entregas" title="Ver entregas" data-id="${t.id}">
                <i class="bi bi-people-fill"></i>
              </button>
              <button class="btn-icono btn-editar-tarea" title="Editar" data-id="${t.id}">
                <i class="bi bi-pencil-fill"></i>
              </button>
              <button class="btn-icono icono-eliminar" title="Eliminar" data-id="${t.id}">
                <i class="bi bi-trash3-fill"></i>
              </button>
            </div>
          </td>
        </tr>
      `
        )
        .join('');

      tablaTareas.querySelectorAll('.btn-ver-entregas').forEach((btn) => {
        btn.addEventListener('click', () => {
          const tarea = tareasCache.find((x) => String(x.id) === String(btn.dataset.id));
          if (tarea) verEntregas(tarea.id, tarea.titulo);
        });
      });

      tablaTareas.querySelectorAll('.btn-editar-tarea').forEach((btn) => {
        btn.addEventListener('click', () => {
          const tarea = tareasCache.find((x) => String(x.id) === String(btn.dataset.id));
          if (tarea) abrirEditar(tarea);
        });
      });

      tablaTareas.querySelectorAll('.icono-eliminar').forEach((btn) => {
        btn.addEventListener('click', () => {
          const tarea = tareasCache.find((x) => String(x.id) === String(btn.dataset.id));
          if (tarea) confirmarEliminar(tarea.id, tarea.titulo);
        });
      });
    } catch (err) {
      console.error('Error cargando tareas:', err);
      tablaTareas.innerHTML = '<tr><td colspan="5" class="celda-vacia">Error de conexión.</td></tr>';
    }
  }

  container.querySelector('#btnNuevaTarea').addEventListener('click', async () => {
    container.querySelector('#modalTitulo').textContent = 'Nueva tarea';
    container.querySelector('#tareaId').value = '';
    container.querySelector('#campoTitulo').value = '';
    container.querySelector('#campoDescripcion').value = '';
    container.querySelector('#campoFecha').value = '';
    container.querySelector('#campoArchivo').value = '';
    container.querySelector('#archivoActual').textContent = '';
    container.querySelector('#tipoConArchivo').checked = true;
    grupoArchivo.style.display = 'block';

    await cargarCursosModal();
    modalTarea.classList.remove('d-none');
  });

  async function abrirEditar(t) {
    container.querySelector('#modalTitulo').textContent = 'Editar tarea';
    container.querySelector('#tareaId').value = t.id;
    container.querySelector('#campoTitulo').value = t.titulo || '';
    container.querySelector('#campoDescripcion').value = t.descripcion || '';
    container.querySelector('#campoFecha').value = t.fecha_entrega ? t.fecha_entrega.split('T')[0] : '';
    container.querySelector('#campoArchivo').value = '';
    container.querySelector('#archivoActual').textContent = t.archivo_url
      ? `Archivo actual: ${t.archivo_url.split('/').pop()}`
      : '';

    if (t.solo_indicaciones) {
      container.querySelector('#tipoSoloTexto').checked = true;
      grupoArchivo.style.display = 'none';
    } else {
      container.querySelector('#tipoConArchivo').checked = true;
      grupoArchivo.style.display = 'block';
    }

    await cargarCursosModal();
    container.querySelector('#campoCurso').value = t.horario_id;
    modalTarea.classList.remove('d-none');
  }

  container.querySelector('#btnCerrarModal').addEventListener('click', () => modalTarea.classList.add('d-none'));
  container.querySelector('#btnCancelar').addEventListener('click', () => modalTarea.classList.add('d-none'));

  btnGuardar.addEventListener('click', async () => {
    const id = container.querySelector('#tareaId').value;
    const horario_id = container.querySelector('#campoCurso').value;
    const titulo = container.querySelector('#campoTitulo').value.trim();
    const descripcion = container.querySelector('#campoDescripcion').value.trim();
    const fecha_entrega = container.querySelector('#campoFecha').value;
    const soloIndicaciones = container.querySelector('#tipoSoloTexto').checked;
    const archivoInput = container.querySelector('#campoArchivo');

    if (!horario_id || !titulo) {
      mostrarAlerta('Curso y título son obligatorios.', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('horario_id', horario_id);
    formData.append('titulo', titulo);
    formData.append('descripcion', descripcion);
    formData.append('fecha_entrega', fecha_entrega);
    formData.append('solo_indicaciones', soloIndicaciones.toString());

    if (!soloIndicaciones && archivoInput.files[0]) {
      formData.append('archivo', archivoInput.files[0]);
    }

    btnGuardar.disabled = true;
    btnGuardar.textContent = 'Guardando...';

    try {
      const { ok, data } = id
        ? await tareasApi.actualizar(id, formData)
        : await tareasApi.crear(formData);

      if (!ok) {
        mostrarAlerta(data.mensaje || 'Error al guardar.', 'error');
      } else {
        modalTarea.classList.add('d-none');
        mostrarAlerta(`✓ ${data.mensaje || 'Tarea guardada correctamente.'}`, 'exito');
        cargarTareas();
      }
    } catch (err) {
      console.error('Error guardando tarea:', err);
      mostrarAlerta('Error de conexión.', 'error');
    } finally {
      btnGuardar.disabled = false;
      btnGuardar.textContent = 'Guardar';
    }
  });

  async function verEntregas(tareaId, titulo) {
    container.querySelector('#tituloEntregas').textContent = `Entregas — ${titulo}`;
    const tablaEntregas = container.querySelector('#tablaEntregas');
    tablaEntregas.innerHTML = '<tr><td colspan="7" class="celda-vacia">Cargando...</td></tr>';
    modalEntregas.classList.remove('d-none');

    try {
      const { ok, data } = await tareasApi.listarEntregasDeTarea(tareaId);
      if (!ok) {
        tablaEntregas.innerHTML = `<tr><td colspan="7" class="celda-vacia">${escapeHtml(data.mensaje || 'Error al cargar entregas.')}</td></tr>`;
        return;
      }

      const entregas = data.entregas || [];
      if (!entregas.length) {
        tablaEntregas.innerHTML = '<tr><td colspan="7" class="celda-vacia">No hay alumnos registrados para esta tarea.</td></tr>';
        return;
      }

      tablaEntregas.innerHTML = entregas
        .map(
          (e, i) => `
        <tr>
          <td>${i + 1}</td>
          <td><strong>${escapeHtml(e.estudiante_apellido)}</strong>, ${escapeHtml(e.estudiante_nombre)}</td>
          <td>
            <span class="tag ${e.entrega_id ? 'tag-activo' : 'tag-inactivo'}">
              ${e.entrega_id ? 'Entregado' : 'Pendiente'}
            </span>
          </td>
          <td>
            ${
              e.entrega_archivo
                ? `<a href="${escapeAttr(resolveFileUrl(e.entrega_archivo))}" target="_blank" style="color:#1a3a5c;font-size:0.82rem;">
                    <i class="bi bi-paperclip"></i> Ver evidencia
                   </a>`
                : '—'
            }
          </td>
          <td style="max-width:180px;font-size:0.82rem;white-space:normal;">${escapeHtml(e.entrega_comentario || '—')}</td>
          <td style="white-space:nowrap;font-size:0.82rem">${formatearFechaHora(e.entregado_en)}</td>
          <td>
            ${
              e.entrega_id
                ? `
              <div style="display:flex;align-items:center;gap:0.4rem;">
                <input type="number" class="input-nota-entrega" min="0" max="20" step="0.5"
                  value="${escapeAttr(e.nota ?? '')}" data-entrega-id="${e.entrega_id}"
                  style="width:60px;padding:0.35rem;border:1px solid #e2e8f0;border-radius:6px;font-size:0.85rem;"/>
                <span class="preview-letra-nota" data-entrega-id="${e.entrega_id}">
                  ${e.nota !== null && e.nota !== undefined ? notaConLetraHTML(e.nota) : ''}
                </span>
                <button class="btn-icono btn-guardar-nota" data-entrega-id="${e.entrega_id}" title="Guardar nota">
                  <i class="bi bi-check-lg"></i>
                </button>
              </div>
            `
                : '—'
            }
          </td>
        </tr>
      `
        )
        .join('');

      tablaEntregas.querySelectorAll('.btn-guardar-nota').forEach((btn) => {
        btn.addEventListener('click', () => guardarNotaEntrega(btn.dataset.entregaId));
      });

      tablaEntregas.querySelectorAll('.input-nota-entrega').forEach((input) => {
        input.addEventListener('input', () => {
          const preview = tablaEntregas.querySelector(
            `.preview-letra-nota[data-entrega-id="${input.dataset.entregaId}"]`
          );
          const valor = parseFloat(input.value);
          if (preview) {
            preview.innerHTML = esNotaValida(valor) ? notaConLetraHTML(valor) : '';
          }
        });
      });
    } catch (err) {
      console.error('Error cargando entregas:', err);
    }
  }

  container.querySelector('#btnCerrarEntregas').addEventListener('click', () => modalEntregas.classList.add('d-none'));

  async function guardarNotaEntrega(entregaId) {
    const input = container.querySelector(`.input-nota-entrega[data-entrega-id="${entregaId}"]`);
    if (!input || !esNotaValida(input.value)) {
      mostrarAlerta('Ingresa una nota válida entre 0 y 20.', 'error');
      return;
    }

    const notaNum = parseFloat(input.value);
    try {
      const { ok, data } = await tareasApi.calificarEntrega(entregaId, notaNum);
      if (!ok) {
        mostrarAlerta(data.mensaje || 'Error al guardar la nota.', 'error');
        return;
      }
      mostrarAlerta('✓ Nota guardada correctamente.', 'exito');
      const preview = container.querySelector(`.preview-letra-nota[data-entrega-id="${entregaId}"]`);
      if (preview) preview.innerHTML = notaConLetraHTML(notaNum);
    } catch (err) {
      console.error('Error guardando nota:', err);
      mostrarAlerta('Error de conexión.', 'error');
    }
  }

  function confirmarEliminar(id, titulo) {
    tareaAEliminar = id;
    container.querySelector('#nombreEliminar').textContent = titulo;
    modalConfirmar.classList.remove('d-none');
  }

  container.querySelector('#btnCerrarConfirmar').addEventListener('click', () => modalConfirmar.classList.add('d-none'));
  container.querySelector('#btnCancelarEliminar').addEventListener('click', () => modalConfirmar.classList.add('d-none'));

  container.querySelector('#btnConfirmarEliminar').addEventListener('click', async () => {
    if (!tareaAEliminar) return;
    try {
      const { ok, data } = await tareasApi.eliminar(tareaAEliminar);
      modalConfirmar.classList.add('d-none');
      if (!ok) {
        mostrarAlerta(data.mensaje || 'Error al eliminar.', 'error');
      } else {
        mostrarAlerta('✓ Tarea eliminada correctamente.', 'exito');
        cargarTareas();
      }
    } catch (err) {
      console.error('Error eliminando:', err);
      mostrarAlerta('Error de conexión.', 'error');
    }
    tareaAEliminar = null;
  });

  cargarTareas();
}

/**
 * Vista Estudiante: Mis Tareas y Envío de Entregas
 */
export function renderMisTareasEstudiante(container) {
  let tareasCache = [];

  container.innerHTML = `
    ${renderNavbarHTML()}

    <main class="dash-main">
      <div class="page-header">
        <div>
          <a href="#/estudiante" class="back-link">
            <i class="bi bi-arrow-left"></i> Volver al panel
          </a>
          <h2>Mis tareas</h2>
          <p>Tareas asignadas por tus profesores en cada curso.</p>
        </div>
      </div>

      <div id="alertBox" class="alert-box d-none"></div>

      <div class="tabla-wrapper">
        <table class="tabla-usuarios">
          <thead>
            <tr>
              <th>Curso</th>
              <th>Título</th>
              <th>Fecha límite</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody id="tablaTareas">
            <tr><td colspan="5" class="celda-vacia">Cargando tareas...</td></tr>
          </tbody>
        </table>
      </div>
    </main>

    <!-- Modal: Ver indicaciones / Entregar tarea -->
    <div id="modalTarea" class="modal-overlay d-none">
      <div class="modal-box">
        <div class="modal-header">
          <h3 id="modalTitulo">Tarea</h3>
          <button id="btnCerrarModal" class="btn-cerrar" type="button">&times;</button>
        </div>
        <div class="modal-body">
          <input type="hidden" id="tareaId"/>

          <div class="form-group">
            <label>Indicaciones</label>
            <p id="modalDescripcion" style="font-size:0.88rem; color:#4a5568; white-space:pre-wrap; margin:0;">—</p>
          </div>

          <div class="form-group" id="grupoArchivoProfesor">
            <label>Archivo de la tarea</label>
            <a id="linkArchivoProfesor" href="#" target="_blank" style="font-size:0.85rem; color:#1a3a5c;">
              <i class="bi bi-paperclip"></i> Ver archivo adjunto
            </a>
          </div>

          <hr style="border:none; border-top:1px solid #edf2f7; margin:1.25rem 0;"/>

          <div id="bloqueEntrega">
            <div class="form-group">
              <label for="campoComentario">Comentario (opcional)</label>
              <textarea
                id="campoComentario"
                rows="3"
                placeholder="Escribe un comentario para tu profesor..."
              ></textarea>
            </div>

            <div class="form-group">
              <label for="campoArchivo">Archivo de tu entrega (PDF, Word o imagen)</label>
              <input type="file" id="campoArchivo" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"/>
              <span class="form-hint" id="entregaActual"></span>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" id="btnCancelar" class="btn-secundario">Cerrar</button>
            <button type="button" id="btnEntregar" class="btn-primario">
              <i class="bi bi-upload"></i> Entregar
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  bindNavbarEvents(container);

  const tablaTareas = container.querySelector('#tablaTareas');
  const modalTarea = container.querySelector('#modalTarea');
  const btnEntregar = container.querySelector('#btnEntregar');
  const grupoArchivoProfesor = container.querySelector('#grupoArchivoProfesor');
  const linkArchivoProfesor = container.querySelector('#linkArchivoProfesor');

  function obtenerEstadoHTML(t) {
    if (!t.entrega_id) {
      return '<span class="tag tag-inactivo">Pendiente</span>';
    }
    if (t.nota === null || t.nota === undefined) {
      return '<span class="tag tag-revision">Pendiente de revisión</span>';
    }
    return notaConLetraHTML(t.nota);
  }

  async function cargarTareas() {
    try {
      const { ok, data } = await tareasApi.listarMisTareasEstudiante();
      if (!ok) {
        tablaTareas.innerHTML = `<tr><td colspan="5" class="celda-vacia">${escapeHtml(data.mensaje || 'Error al cargar tareas.')}</td></tr>`;
        return;
      }

      tareasCache = data.tareas || [];
      if (!tareasCache.length) {
        tablaTareas.innerHTML = '<tr><td colspan="5" class="celda-vacia">No tienes tareas asignadas por el momento.</td></tr>';
        return;
      }

      tablaTareas.innerHTML = tareasCache
        .map(
          (t) => `
        <tr>
          <td>${escapeHtml(t.curso_nombre)} — ${escapeHtml(t.anio)}</td>
          <td><strong>${escapeHtml(t.titulo)}</strong></td>
          <td>${formatearFecha(t.fecha_entrega)}</td>
          <td>${obtenerEstadoHTML(t)}</td>
          <td>
            <div class="acciones-cell">
              <button class="btn-icono btn-abrir-tarea" title="${t.entrega_id ? 'Ver / actualizar entrega' : 'Ver y entregar'}" data-id="${t.id}">
                <i class="bi ${t.entrega_id ? 'bi-eye-fill' : 'bi-upload'}"></i>
              </button>
            </div>
          </td>
        </tr>
      `
        )
        .join('');

      tablaTareas.querySelectorAll('.btn-abrir-tarea').forEach((btn) => {
        btn.addEventListener('click', () => abrirTarea(btn.dataset.id));
      });
    } catch (err) {
      console.error('Error cargando tareas:', err);
      tablaTareas.innerHTML = '<tr><td colspan="5" class="celda-vacia">Error de conexión.</td></tr>';
    }
  }

  function abrirTarea(id) {
    const t = tareasCache.find((x) => String(x.id) === String(id));
    if (!t) return;

    container.querySelector('#modalTitulo').textContent = t.titulo;
    container.querySelector('#tareaId').value = t.id;
    container.querySelector('#modalDescripcion').textContent = t.descripcion || 'Sin indicaciones adicionales.';
    container.querySelector('#campoComentario').value = t.entrega_comentario || '';
    container.querySelector('#campoArchivo').value = '';

    if (t.archivo_url) {
      grupoArchivoProfesor.classList.remove('d-none');
      linkArchivoProfesor.href = resolveFileUrl(t.archivo_url);
    } else {
      grupoArchivoProfesor.classList.add('d-none');
    }

    const entregaActual = container.querySelector('#entregaActual');
    if (t.entrega_id) {
      let textoEntrega =
        `Ya entregaste el ${formatearFechaHora(t.entregado_en)}.` +
        (t.entrega_archivo
          ? ` <a href="${escapeAttr(resolveFileUrl(t.entrega_archivo))}" target="_blank">Ver archivo entregado</a>`
          : '');

      if (t.nota !== null && t.nota !== undefined) {
        textoEntrega += `<br><strong>Nota: </strong>${notaConLetraHTML(t.nota)}`;
        textoEntrega +=
          '<br><span style="color:#c0392b;font-size:0.78rem;">Si vuelves a entregar, se borrará esta nota hasta que el profesor revise de nuevo.</span>';
      } else {
        textoEntrega += '<br><span style="color:#7b4d00;">Pendiente de revisión por el profesor.</span>';
      }

      entregaActual.innerHTML = textoEntrega;
      btnEntregar.innerHTML = '<i class="bi bi-arrow-repeat"></i> Actualizar entrega';
    } else {
      entregaActual.textContent = '';
      btnEntregar.innerHTML = '<i class="bi bi-upload"></i> Entregar';
    }

    modalTarea.classList.remove('d-none');
  }

  container.querySelector('#btnCerrarModal').addEventListener('click', () => modalTarea.classList.add('d-none'));
  container.querySelector('#btnCancelar').addEventListener('click', () => modalTarea.classList.add('d-none'));

  btnEntregar.addEventListener('click', async () => {
    const tarea_id = container.querySelector('#tareaId').value;
    const comentario = container.querySelector('#campoComentario').value.trim();
    const archivoInput = container.querySelector('#campoArchivo');

    const formData = new FormData();
    formData.append('tarea_id', tarea_id);
    formData.append('comentario', comentario);

    if (archivoInput.files[0]) {
      formData.append('archivo', archivoInput.files[0]);
    }

    btnEntregar.disabled = true;
    const textoOriginal = btnEntregar.innerHTML;
    btnEntregar.textContent = 'Enviando...';

    try {
      const { ok, data } = await tareasApi.enviarEntregaEstudiante(formData);
      if (!ok) {
        mostrarAlerta(data.mensaje || 'Error al entregar la tarea.', 'error');
      } else {
        modalTarea.classList.add('d-none');
        mostrarAlerta(`✓ ${data.mensaje || 'Entrega registrada correctamente.'}`, 'exito');
        cargarTareas();
      }
    } catch (err) {
      console.error('Error entregando tarea:', err);
      mostrarAlerta('Error de conexión.', 'error');
    } finally {
      btnEntregar.disabled = false;
      btnEntregar.innerHTML = textoOriginal;
    }
  });

  cargarTareas();
}

/**
 * Vista Administrador: Revisión de Tareas
 */
const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

export function renderRevisionTareasAdmin(container) {
  let tareasCache = [];
  const hoy = new Date();
  const mesActual = hoy.getMonth() + 1;
  const anioActual = hoy.getFullYear();

  const opcionesMeses = MESES.map(
    (nombreMes, i) => `<option value="${i + 1}" ${i + 1 === mesActual ? 'selected' : ''}>${nombreMes}</option>`
  ).join('');

  container.innerHTML = `
    ${renderNavbarHTML()}

    <main class="dash-main">
      <div class="page-header">
        <div>
          <a href="#/admin" class="back-link">
            <i class="bi bi-arrow-left"></i> Volver al panel
          </a>
          <h2>Revisión de tareas</h2>
          <p>Verifica si los profesores cumplieron con el mínimo de tareas subidas por curso y mes.</p>
        </div>
      </div>

      <div id="alertBox" class="alert-box d-none"></div>

      <div class="filtros">
        <select id="filtroCurso">
          <option value="">Todos los cursos</option>
        </select>

        <select id="filtroAnio">
          <option value="">Todos los años</option>
        </select>

        <select id="filtroMes">
          ${opcionesMeses}
        </select>

        <input type="number" id="filtroAnioCalendario" value="${anioActual}" placeholder="Año" style="max-width:110px" min="2020" max="2100">
      </div>

      <div class="grafico-card">
        <h4><i class="bi bi-clipboard-check-fill"></i> Tareas subidas por curso</h4>
        <div class="tabla-wrapper" style="margin-top:1rem">
          <table class="tabla-usuarios">
            <thead>
              <tr>
                <th>Profesor</th>
                <th>Curso</th>
                <th>Año</th>
                <th>Tareas subidas</th>
              </tr>
            </thead>
            <tbody id="tablaResumen">
              <tr><td colspan="4" class="celda-vacia">Cargando...</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="grafico-card" style="margin-top:1.5rem">
        <h4><i class="bi bi-list-check"></i> Detalle de tareas subidas en el período</h4>
        <div class="tabla-wrapper" style="margin-top:1rem">
          <table class="tabla-usuarios">
            <thead>
              <tr>
                <th>Título</th>
                <th>Curso</th>
                <th>Año</th>
                <th>Profesor</th>
                <th>Subida el</th>
                <th>Fecha de entrega</th>
                <th>Detalle</th>
              </tr>
            </thead>
            <tbody id="tablaDetalle">
              <tr><td colspan="7" class="celda-vacia">Cargando...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>

    <!-- Modal: detalle de la tarea (solo lectura) -->
    <div id="modalDetalle" class="modal-overlay d-none">
      <div class="modal-box">
        <div class="modal-header">
          <h3><i class="bi bi-file-earmark-text-fill"></i> Detalle de la tarea</h3>
          <button id="btnCerrarDetalle" class="btn-cerrar" type="button">&times;</button>
        </div>
        <div class="modal-body">
          <p class="mb-2"><strong>Título:</strong> <span id="detTitulo"></span></p>
          <p class="mb-2"><strong>Curso:</strong> <span id="detCurso"></span> — <span id="detAnio"></span></p>
          <p class="mb-2"><strong>Profesor:</strong> <span id="detProfesor"></span></p>
          <p class="mb-2"><strong>Tipo:</strong> <span id="detTipo"></span></p>
          <p class="mb-2"><strong>Subida el:</strong> <span id="detSubida"></span></p>
          <p class="mb-2"><strong>Fecha de entrega:</strong> <span id="detEntrega"></span></p>
          <p class="mb-2"><strong>Descripción / indicaciones:</strong></p>
          <p id="detDescripcion" class="mb-3" style="white-space:pre-wrap;color:#4a5568;"></p>
          <p id="detArchivoWrap"><strong>Archivo adjunto:</strong> <span id="detArchivo"></span></p>
        </div>
        <div class="modal-footer" style="padding:0 1.5rem 1.25rem;">
          <button id="btnCerrarDetalle2" class="btn-secundario" type="button">Cerrar</button>
        </div>
      </div>
    </div>
  `;

  bindNavbarEvents(container);

  const filtroCurso = container.querySelector('#filtroCurso');
  const filtroAnio = container.querySelector('#filtroAnio');
  const filtroMes = container.querySelector('#filtroMes');
  const filtroAnioCalendario = container.querySelector('#filtroAnioCalendario');
  const tablaResumen = container.querySelector('#tablaResumen');
  const tablaDetalle = container.querySelector('#tablaDetalle');
  const modalDetalle = container.querySelector('#modalDetalle');

  async function cargarFiltros() {
    try {
      const [respCursos, respAnios] = await Promise.all([
        cursosApi.listar(),
        cursosApi.listarAnios(),
      ]);

      if (respCursos.ok && respCursos.data.cursos) {
        respCursos.data.cursos.forEach((c) => {
          const opt = document.createElement('option');
          opt.value = c.id;
          opt.textContent = c.nombre;
          filtroCurso.appendChild(opt);
        });
      }

      if (respAnios.ok && respAnios.data.anios) {
        respAnios.data.anios.forEach((a) => {
          const opt = document.createElement('option');
          opt.value = a;
          opt.textContent = a;
          filtroAnio.appendChild(opt);
        });
      }
    } catch (err) {
      console.error('Error cargando filtros:', err);
    }
  }

  async function cargarRevision() {
    tablaResumen.innerHTML = '<tr><td colspan="4" class="celda-vacia">Cargando...</td></tr>';
    tablaDetalle.innerHTML = '<tr><td colspan="7" class="celda-vacia">Cargando...</td></tr>';

    try {
      const { ok, data } = await tareasApi.listarRevisionAdmin({
        curso_id: filtroCurso.value,
        anio: filtroAnio.value,
        mes: filtroMes.value,
        anio_calendario: filtroAnioCalendario.value,
      });

      if (!ok) {
        mostrarAlerta(data.mensaje || 'No se pudo cargar la revisión de tareas.', 'error');
        tablaResumen.innerHTML = '<tr><td colspan="4" class="celda-vacia">Error al cargar.</td></tr>';
        tablaDetalle.innerHTML = '<tr><td colspan="7" class="celda-vacia">Error al cargar.</td></tr>';
        return;
      }

      renderizarResumen(data.resumen || []);
      tareasCache = data.tareas || [];
      renderizarDetalle(tareasCache);
    } catch (err) {
      console.error('Error cargando revisión:', err);
      mostrarAlerta('No se pudo conectar con el servidor.', 'error');
    }
  }

  function renderizarResumen(bloques) {
    if (!bloques.length) {
      tablaResumen.innerHTML = '<tr><td colspan="4" class="celda-vacia">No hay cursos asignados para estos filtros.</td></tr>';
      return;
    }

    tablaResumen.innerHTML = bloques
      .map((b) => {
        const profesorNombre = b.profesor_nombre
          ? `${escapeHtml(b.profesor_apellido)}, ${escapeHtml(b.profesor_nombre)}`
          : '— Sin profesor asignado —';

        return `
          <tr>
            <td>${profesorNombre}</td>
            <td>${escapeHtml(b.curso_nombre)}</td>
            <td>${escapeHtml(b.anio)}</td>
            <td>${b.total_tareas}</td>
          </tr>
        `;
      })
      .join('');
  }

  function renderizarDetalle(tareas) {
    if (!tareas.length) {
      tablaDetalle.innerHTML = '<tr><td colspan="7" class="celda-vacia">No se subieron tareas en este período.</td></tr>';
      return;
    }

    tablaDetalle.innerHTML = tareas
      .map((t, i) => {
        const profesorNombre = t.profesor_nombre
          ? `${escapeHtml(t.profesor_apellido)}, ${escapeHtml(t.profesor_nombre)}`
          : '—';

        return `
          <tr>
            <td>${escapeHtml(t.titulo)}</td>
            <td>${escapeHtml(t.curso_nombre)}</td>
            <td>${escapeHtml(t.anio)}</td>
            <td>${profesorNombre}</td>
            <td>${formatearFecha(t.creado_en)}</td>
            <td>${formatearFecha(t.fecha_entrega)}</td>
            <td>
              <button class="btn-icono btn-ver-detalle" title="Ver detalle" data-index="${i}">
                <i class="bi bi-eye-fill"></i>
              </button>
            </td>
          </tr>
        `;
      })
      .join('');

    tablaDetalle.querySelectorAll('.btn-ver-detalle').forEach((btn) => {
      btn.addEventListener('click', () => verDetalleTarea(Number(btn.dataset.index)));
    });
  }

  function verDetalleTarea(indice) {
    const t = tareasCache[indice];
    if (!t) return;

    container.querySelector('#detTitulo').textContent = t.titulo || '—';
    container.querySelector('#detCurso').textContent = t.curso_nombre || '—';
    container.querySelector('#detAnio').textContent = t.anio || '—';
    container.querySelector('#detProfesor').textContent = t.profesor_nombre
      ? `${t.profesor_apellido}, ${t.profesor_nombre}`
      : '—';
    container.querySelector('#detTipo').textContent = t.solo_indicaciones
      ? 'Solo indicaciones (sin archivo)'
      : 'Con archivo adjunto';
    container.querySelector('#detSubida').textContent = formatearFechaHora(t.creado_en);
    container.querySelector('#detEntrega').textContent = t.fecha_entrega
      ? formatearFecha(t.fecha_entrega)
      : 'Sin fecha límite';
    container.querySelector('#detDescripcion').textContent = t.descripcion?.trim() || 'Sin descripción.';

    const detArchivo = container.querySelector('#detArchivo');
    if (t.archivo_url) {
      detArchivo.innerHTML = `<a href="${escapeAttr(resolveFileUrl(t.archivo_url))}" target="_blank" style="color:#1a3a5c;"><i class="bi bi-paperclip"></i> Ver archivo</a>`;
    } else {
      detArchivo.textContent = 'No se adjuntó ningún archivo.';
    }

    modalDetalle.classList.remove('d-none');
  }

  function cerrarModalDetalle() {
    modalDetalle.classList.add('d-none');
  }

  container.querySelector('#btnCerrarDetalle').addEventListener('click', cerrarModalDetalle);
  container.querySelector('#btnCerrarDetalle2').addEventListener('click', cerrarModalDetalle);
  modalDetalle.addEventListener('click', (e) => {
    if (e.target === modalDetalle) cerrarModalDetalle();
  });

  [filtroCurso, filtroAnio, filtroMes, filtroAnioCalendario].forEach((el) => {
    el.addEventListener('change', cargarRevision);
  });

  (async function init() {
    await cargarFiltros();
    await cargarRevision();
  })();
}

