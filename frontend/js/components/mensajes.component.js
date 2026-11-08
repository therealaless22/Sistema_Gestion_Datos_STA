/**
 * =============================================
 * SANTO TOMÁS DE AQUINO — Componente Mensajes
 * - Profesor: Enviar y gestionar mensajes (/api/mensajes/enviar, /enviados, /:id)
 * - Estudiante: Bandeja de mensajes recibidos (/api/mensajes/recibidos)
 * =============================================
 */

import { mensajesApi } from '../api/mensajes.api.js';
import { cursosApi } from '../api/cursos.api.js';
import { escapeHtml, escapeAttr, mostrarAlerta } from '../utils/dom.js';
import { formatearFechaHora } from '../utils/formatters.js';
import { renderNavbarHTML, bindNavbarEvents } from './navbar.component.js';

/**
 * Vista Profesor: Enviar Mensajes e Historial
 */
export function renderMensajesProfesor(container) {
  let historialCache = [];
  let mensajeAEliminar = null;

  container.innerHTML = `
    ${renderNavbarHTML()}

    <main class="dash-main">
      <div class="page-header">
        <div>
          <a href="#/profesor" class="back-link">
            <i class="bi bi-arrow-left"></i> Volver al panel
          </a>
          <h2>Mensajes</h2>
          <p>Envía mensajes a los alumnos de tus cursos.</p>
        </div>
      </div>

      <div id="alertBox" class="alert-box d-none"></div>

      <div class="quick-panel" id="panelFormulario" style="margin-bottom: 1.25rem;">
        <h3>Nuevo mensaje</h3>

        <div class="form-group">
          <label for="selectCurso">Curso</label>
          <select id="selectCurso">
            <option value="">— Selecciona un curso —</option>
          </select>
        </div>

        <div class="form-group">
          <label for="selectAlumno">Alumno</label>
          <select id="selectAlumno" disabled>
            <option value="">— Selecciona un alumno —</option>
          </select>
        </div>

        <div class="form-group">
          <label for="inputAsunto">Asunto</label>
          <input type="text" id="inputAsunto" placeholder="Ej: Recordatorio de exposición"/>
        </div>

        <div class="form-group">
          <label for="inputMensaje">Mensaje</label>
          <textarea
            id="inputMensaje"
            placeholder="Escribe tu mensaje aquí..."
            rows="4"
          ></textarea>
        </div>

        <div style="display:flex; justify-content:flex-end;">
          <button id="btnEnviar" class="btn-primario" type="button" disabled>
            <i class="bi bi-send-fill"></i> Enviar mensaje
          </button>
        </div>
      </div>

      <div class="tabla-wrapper">
        <table class="tabla-usuarios">
          <thead>
            <tr>
              <th>Fecha y hora</th>
              <th>Alumno</th>
              <th>Asunto</th>
              <th>Mensaje</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody id="tablaHistorial">
            <tr><td colspan="5" class="celda-vacia">Cargando historial...</td></tr>
          </tbody>
        </table>
      </div>
    </main>

    <!-- Modal confirmar eliminación -->
    <div id="modalConfirmar" class="modal-overlay d-none">
      <div class="modal-box modal-pequeno">
        <div class="modal-header">
          <h3>Confirmar eliminación</h3>
          <button id="btnCerrarConfirmar" class="btn-cerrar" type="button">&times;</button>
        </div>
        <div class="modal-body">
          <p>¿Seguro que deseas eliminar este mensaje? Esta acción no se puede deshacer.</p>
          <div class="modal-footer">
            <button id="btnCancelarEliminar" class="btn-secundario" type="button">Cancelar</button>
            <button id="btnConfirmarEliminar" class="btn-peligro" type="button">Eliminar</button>
          </div>
        </div>
      </div>
    </div>
  `;

  bindNavbarEvents(container);

  const selectCurso = container.querySelector('#selectCurso');
  const selectAlumno = container.querySelector('#selectAlumno');
  const inputAsunto = container.querySelector('#inputAsunto');
  const inputMensaje = container.querySelector('#inputMensaje');
  const btnEnviar = container.querySelector('#btnEnviar');
  const tablaHistorial = container.querySelector('#tablaHistorial');
  const modalConfirmar = container.querySelector('#modalConfirmar');

  function validarFormulario() {
    btnEnviar.disabled = !(
      selectCurso.value &&
      selectAlumno.value &&
      inputAsunto.value.trim() &&
      inputMensaje.value.trim()
    );
  }

  selectCurso.addEventListener('change', async () => {
    await cargarAlumnos(selectCurso.value);
    validarFormulario();
  });
  selectAlumno.addEventListener('change', validarFormulario);
  inputAsunto.addEventListener('input', validarFormulario);
  inputMensaje.addEventListener('input', validarFormulario);

  async function cargarCursos() {
    try {
      const { ok, data } = await cursosApi.listarMisCursosProfesor();
      if (!ok || !data.cursos?.length) return;
      data.cursos.forEach((c) => {
        const opt = document.createElement('option');
        opt.value = c.horario_id;
        opt.textContent = `${c.curso_nombre} — ${c.anio}`;
        selectCurso.appendChild(opt);
      });
    } catch (err) {
      console.error('Error cargando cursos:', err);
    }
  }

  async function cargarAlumnos(horarioId) {
    selectAlumno.innerHTML = '<option value="">— Selecciona un alumno —</option>';
    selectAlumno.disabled = true;
    if (!horarioId) return;

    try {
      const { ok, data } = await cursosApi.listarAlumnosDeHorario(horarioId);
      if (!ok || !data.alumnos?.length) return;
      data.alumnos.forEach((al) => {
        const opt = document.createElement('option');
        opt.value = al.id;
        opt.textContent = `${al.apellido}, ${al.nombre}`;
        selectAlumno.appendChild(opt);
      });
      selectAlumno.disabled = false;
    } catch (err) {
      console.error('Error cargando alumnos:', err);
    }
  }

  async function cargarHistorial() {
    try {
      const { ok, data } = await mensajesApi.listarEnviadosProfesor();
      if (!ok) {
        tablaHistorial.innerHTML = `<tr><td colspan="5" class="celda-vacia">${escapeHtml(data.mensaje || 'Error al cargar historial.')}</td></tr>`;
        return;
      }

      historialCache = data.mensajes || [];
      if (!historialCache.length) {
        tablaHistorial.innerHTML = '<tr><td colspan="5" class="celda-vacia">No has enviado mensajes aún.</td></tr>';
        return;
      }

      tablaHistorial.innerHTML = historialCache
        .map(
          (m) => `
        <tr>
          <td style="white-space:nowrap">${formatearFechaHora(m.creado_en)}</td>
          <td><strong>${escapeHtml(m.destinatario_apellido)}</strong>, ${escapeHtml(m.destinatario_nombre)}</td>
          <td>${escapeHtml(m.asunto || '—')}</td>
          <td style="max-width:260px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap"
              title="${escapeAttr(m.mensaje)}">${escapeHtml(m.mensaje)}</td>
          <td>
            <div class="acciones-cell">
              <button class="btn-icono btn-reenviar" title="Reenviar" data-id="${m.id}">
                <i class="bi bi-reply-fill"></i>
              </button>
              <button class="btn-icono icono-eliminar" title="Eliminar" data-id="${m.id}">
                <i class="bi bi-trash3-fill"></i>
              </button>
            </div>
          </td>
        </tr>
      `
        )
        .join('');

      tablaHistorial.querySelectorAll('.btn-reenviar').forEach((btn) => {
        btn.addEventListener('click', () => {
          const item = historialCache.find((x) => String(x.id) === String(btn.dataset.id));
          if (item) reenviarMensaje(item);
        });
      });

      tablaHistorial.querySelectorAll('.icono-eliminar').forEach((btn) => {
        btn.addEventListener('click', () => confirmarEliminar(btn.dataset.id));
      });
    } catch (err) {
      console.error('Error cargando historial:', err);
      tablaHistorial.innerHTML = '<tr><td colspan="5" class="celda-vacia">Error de conexión.</td></tr>';
    }
  }

  function reenviarMensaje(m) {
    const optionExiste = [...selectAlumno.options].find(
      (o) => String(o.value) === String(m.destinatario_id)
    );
    if (optionExiste) {
      selectAlumno.value = m.destinatario_id;
    }
    inputAsunto.value = m.asunto || '';
    inputMensaje.value = m.mensaje || '';
    validarFormulario();
    container.querySelector('#panelFormulario').scrollIntoView({ behavior: 'smooth' });
  }

  btnEnviar.addEventListener('click', async () => {
    const destinatario_id = parseInt(selectAlumno.value, 10);
    const asunto = inputAsunto.value.trim();
    const mensaje = inputMensaje.value.trim();

    btnEnviar.disabled = true;
    btnEnviar.innerHTML = '<i class="bi bi-hourglass-split"></i> Enviando...';

    try {
      const { ok, data } = await mensajesApi.enviar({ destinatario_id, asunto, mensaje });
      if (!ok) {
        mostrarAlerta(data.mensaje || 'Error al enviar el mensaje.', 'error');
      } else {
        mostrarAlerta('✓ Mensaje enviado correctamente.', 'exito');
        inputAsunto.value = '';
        inputMensaje.value = '';
        selectAlumno.value = '';
        validarFormulario();
        cargarHistorial();
      }
    } catch (err) {
      console.error('Error enviando:', err);
      mostrarAlerta('Error de conexión con el servidor.', 'error');
    } finally {
      btnEnviar.disabled = false;
      btnEnviar.innerHTML = '<i class="bi bi-send-fill"></i> Enviar mensaje';
    }
  });

  function confirmarEliminar(id) {
    mensajeAEliminar = id;
    modalConfirmar.classList.remove('d-none');
  }

  function cerrarModal() {
    modalConfirmar.classList.add('d-none');
    mensajeAEliminar = null;
  }

  container.querySelector('#btnCerrarConfirmar').addEventListener('click', cerrarModal);
  container.querySelector('#btnCancelarEliminar').addEventListener('click', cerrarModal);

  container.querySelector('#btnConfirmarEliminar').addEventListener('click', async () => {
    if (!mensajeAEliminar) return;
    try {
      const { ok, data } = await mensajesApi.eliminar(mensajeAEliminar);
      cerrarModal();
      if (!ok) {
        mostrarAlerta(data.mensaje || 'Error al eliminar.', 'error');
      } else {
        mostrarAlerta('✓ Mensaje eliminado.', 'exito');
        cargarHistorial();
      }
    } catch (err) {
      console.error('Error eliminando:', err);
      mostrarAlerta('Error de conexión.', 'error');
      cerrarModal();
    }
  });

  cargarCursos();
  cargarHistorial();
}

/**
 * Vista Estudiante: Mis Mensajes Recibidos
 */
export function renderMisMensajesEstudiante(container) {
  let mensajesCache = [];

  container.innerHTML = `
    ${renderNavbarHTML()}

    <main class="dash-main">
      <div class="page-header">
        <div>
          <a href="#/estudiante" class="back-link">
            <i class="bi bi-arrow-left"></i> Volver al panel
          </a>
          <h2>Mis mensajes</h2>
          <p>Mensajes enviados por tus profesores.</p>
        </div>
      </div>

      <div id="alertBox" class="alert-box d-none"></div>

      <div class="tabla-wrapper">
        <table class="tabla-usuarios">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Profesor</th>
              <th>Asunto</th>
              <th>Mensaje</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody id="tablaMensajes">
            <tr><td colspan="5" class="celda-vacia">Cargando mensajes...</td></tr>
          </tbody>
        </table>
      </div>

      <div id="modalMensaje" class="modal-overlay d-none">
        <div class="modal-box">
          <div class="modal-header">
            <h3 id="modalAsunto">—</h3>
            <button id="btnCerrarModal" class="btn-cerrar" type="button">&times;</button>
          </div>
          <div class="modal-body">
            <p style="font-size:0.82rem;color:#a0aec0;margin-bottom:0.75rem;">
              <i class="bi bi-person-fill"></i>
              <span id="modalRemitente">—</span>
            </p>
            <p id="modalTexto" style="font-size:0.9rem;color:#2d3748;white-space:pre-wrap;line-height:1.6;"></p>
            <div class="modal-footer" style="margin-top:1.25rem;">
              <button type="button" id="btnCerrar" class="btn-primario">Cerrar</button>
            </div>
          </div>
        </div>
      </div>
    </main>
  `;

  bindNavbarEvents(container);

  const tablaMensajes = container.querySelector('#tablaMensajes');
  const modalMensaje = container.querySelector('#modalMensaje');

  async function cargarMensajes() {
    try {
      const { ok, data } = await mensajesApi.listarRecibidosEstudiante();
      if (!ok) {
        tablaMensajes.innerHTML = `<tr><td colspan="5" class="celda-vacia">${escapeHtml(data.mensaje || 'Error al cargar mensajes.')}</td></tr>`;
        return;
      }

      mensajesCache = data.mensajes || [];
      if (!mensajesCache.length) {
        tablaMensajes.innerHTML = '<tr><td colspan="5" class="celda-vacia">No tienes mensajes recibidos aún.</td></tr>';
        return;
      }

      tablaMensajes.innerHTML = mensajesCache
        .map(
          (m) => `
        <tr style="${!m.leido ? 'font-weight:600;background:#f0f7ff;' : ''}">
          <td style="white-space:nowrap;font-size:0.82rem;">${formatearFechaHora(m.creado_en)}</td>
          <td>${escapeHtml(m.remitente_apellido)}, ${escapeHtml(m.remitente_nombre)}</td>
          <td>${escapeHtml(m.asunto || '—')}</td>
          <td style="max-width:260px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;"
              title="${escapeAttr(m.mensaje)}">${escapeHtml(m.mensaje)}</td>
          <td>
            <div class="acciones-cell">
              <span class="tag ${m.leido ? 'tag-inactivo' : 'tag-revision'}" style="margin-right:0.4rem;">
                ${m.leido ? 'Leído' : 'Nuevo'}
              </span>
              <button class="btn-icono btn-ver-mensaje" title="Ver mensaje completo" data-id="${m.id}">
                <i class="bi bi-envelope-open-fill"></i>
              </button>
            </div>
          </td>
        </tr>
      `
        )
        .join('');

      tablaMensajes.querySelectorAll('.btn-ver-mensaje').forEach((btn) => {
        btn.addEventListener('click', () => verMensaje(btn.dataset.id));
      });
    } catch (err) {
      console.error('Error cargando mensajes:', err);
      tablaMensajes.innerHTML = '<tr><td colspan="5" class="celda-vacia">Error de conexión.</td></tr>';
    }
  }

  async function verMensaje(id) {
    try {
      const { ok, data } = await mensajesApi.listarRecibidosEstudiante();
      if (ok && data.mensajes) {
        mensajesCache = data.mensajes;
      }
    } catch {
      // Usar caché local si falla la actualización
    }

    const m = mensajesCache.find((x) => String(x.id) === String(id));
    if (!m) return;

    container.querySelector('#modalAsunto').textContent = m.asunto || '(Sin asunto)';
    container.querySelector('#modalRemitente').textContent = `${m.remitente_apellido}, ${m.remitente_nombre} — ${formatearFechaHora(m.creado_en)}`;
    container.querySelector('#modalTexto').textContent = m.mensaje || '';

    modalMensaje.classList.remove('d-none');
    cargarMensajes();
  }

  container.querySelector('#btnCerrarModal').addEventListener('click', () => modalMensaje.classList.add('d-none'));
  container.querySelector('#btnCerrar').addEventListener('click', () => modalMensaje.classList.add('d-none'));
  modalMensaje.addEventListener('click', (e) => {
    if (e.target === modalMensaje) modalMensaje.classList.add('d-none');
  });

  cargarMensajes();
}

