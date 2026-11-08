/**
 * =============================================
 * SANTO TOMÁS DE AQUINO — Componente Horarios
 * - Admin: CRUD de bloques (/api/horarios)
 * - Profesor: Mi horario (/api/horarios/mi-horario)
 * - Estudiante: Mi horario (/api/horarios/mi-horario-estudiante)
 * =============================================
 */

import { horariosApi } from '../api/horarios.api.js';
import { cursosApi } from '../api/cursos.api.js';
import { escapeHtml, escapeAttr, mostrarAlerta } from '../utils/dom.js';
import { formatHora } from '../utils/formatters.js';
import { esRangoHoraValido } from '../utils/validators.js';
import { renderNavbarHTML, bindNavbarEvents } from './navbar.component.js';

const COLORES_DIA = {
  Lunes:     '#dbeafe',
  Martes:    '#dcfce7',
  Miércoles: '#fef9c3',
  Jueves:    '#ffe4e6',
  Viernes:   '#f3e8ff',
};

const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

const ANIOS_HORARIO = [
  '1ro',
  '2do',
  '3ro',
  '4to',
  '5to',
  '6to',
  '1ro Primaria',
  '2do Primaria',
  '3ro Primaria',
  '4to Primaria',
  '5to Primaria',
  '6to Primaria',
  '1ro Secundaria',
  '2do Secundaria',
  '3ro Secundaria',
  '4to Secundaria',
  '5to Secundaria',
];

/**
 * Vista Administrador: Gestión de Horarios
 */
export function renderHorariosAdmin(container) {
  let todosLosHorarios = [];
  let bloqueAEliminar = null;

  const opcionesAnio = ANIOS_HORARIO.map(
    (a) => `<option value="${escapeAttr(a)}">${escapeHtml(a)}</option>`
  ).join('');

  container.innerHTML = `
    ${renderNavbarHTML()}

    <main class="dash-main">
      <div class="page-header">
        <div>
          <a href="#/admin" class="back-link">
            <i class="bi bi-arrow-left"></i> Volver al panel
          </a>
          <h2>Horarios</h2>
          <p>Administra los bloques de horario por curso y profesor.</p>
        </div>
        <button id="btnNuevoBloque" class="btn-primario" type="button">
          <i class="bi bi-plus-circle-fill"></i> Nuevo bloque
        </button>
      </div>

      <div id="alertBox" class="alert-box d-none"></div>

      <div class="quick-panel" style="margin-bottom:1.25rem;">
        <h3>Filtrar</h3>
        <div class="filtros">
          <select id="selectProfesor">
            <option value="">— Todos los profesores —</option>
          </select>
        </div>
      </div>

      <div class="tabla-wrapper">
        <table class="tabla-usuarios" id="tablaHorarios">
          <thead>
            <tr>
              <th>Día</th>
              <th>Hora inicio</th>
              <th>Hora fin</th>
              <th>Curso</th>
              <th>Profesor</th>
              <th>Año</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody id="tablaBody">
            <tr><td colspan="7" class="celda-vacia">Cargando horarios...</td></tr>
          </tbody>
        </table>
      </div>
    </main>

    <!-- Modal: Crear/Editar bloque -->
    <div id="modalBloque" class="modal-overlay d-none">
      <div class="modal-box">
        <div class="modal-header">
          <h3 id="modalTitulo">Nuevo bloque</h3>
          <button id="btnCerrarModal" class="btn-cerrar" type="button">&times;</button>
        </div>
        <div class="modal-body">
          <input type="hidden" id="bloqueId"/>

          <div class="form-group">
            <label for="campoCurso">Curso</label>
            <select id="campoCurso" required>
              <option value="">— Selecciona un curso —</option>
            </select>
          </div>

          <div class="form-group">
            <label for="campoProfesor">Profesor</label>
            <select id="campoProfesor">
              <option value="">— Sin asignar —</option>
            </select>
          </div>

          <div class="form-group">
            <label for="campoAnio">Año</label>
            <select id="campoAnio" required>
              <option value="">— Selecciona un año —</option>
              ${opcionesAnio}
            </select>
          </div>

          <div class="form-group">
            <label for="campoDia">Día</label>
            <select id="campoDia" required>
              <option value="">— Selecciona un día —</option>
              <option value="Lunes">Lunes</option>
              <option value="Martes">Martes</option>
              <option value="Miércoles">Miércoles</option>
              <option value="Jueves">Jueves</option>
              <option value="Viernes">Viernes</option>
            </select>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="campoInicio">Hora inicio</label>
              <input type="time" id="campoInicio" min="07:00" max="15:00" required/>
            </div>
            <div class="form-group">
              <label for="campoFin">Hora fin</label>
              <input type="time" id="campoFin" min="07:00" max="15:00" required/>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" id="btnCancelar" class="btn-secundario">Cancelar</button>
            <button type="button" id="btnGuardar" class="btn-primario">Guardar</button>
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
          <p>¿Seguro que deseas eliminar este bloque de horario?</p>
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
  const selectProfesor = container.querySelector('#selectProfesor');
  const modalBloque = container.querySelector('#modalBloque');
  const modalConfirmar = container.querySelector('#modalConfirmar');
  const campoCurso = container.querySelector('#campoCurso');
  const campoProfesor = container.querySelector('#campoProfesor');
  const campoAnio = container.querySelector('#campoAnio');
  const campoDia = container.querySelector('#campoDia');
  const campoInicio = container.querySelector('#campoInicio');
  const campoFin = container.querySelector('#campoFin');

  async function cargarProfesores() {
    try {
      const { ok, data } = await cursosApi.listarProfesores();
      if (!ok || !data.profesores?.length) return;

      data.profesores.forEach((p) => {
        const label = `${p.apellido}, ${p.nombre}`;
        const optFiltro = document.createElement('option');
        optFiltro.value = p.id;
        optFiltro.textContent = label;
        selectProfesor.appendChild(optFiltro);

        const optModal = document.createElement('option');
        optModal.value = p.id;
        optModal.textContent = label;
        campoProfesor.appendChild(optModal);
      });
    } catch (err) {
      console.error('Error cargando profesores:', err);
    }
  }

  async function cargarHorarios() {
    try {
      const { ok, data } = await horariosApi.listar();
      if (!ok) {
        tablaBody.innerHTML = `<tr><td colspan="7" class="celda-vacia">${escapeHtml(data.mensaje || 'Error al cargar horarios.')}</td></tr>`;
        return;
      }
      todosLosHorarios = data.horarios || [];
      renderTabla();
    } catch (err) {
      console.error('Error cargando horarios:', err);
      tablaBody.innerHTML = '<tr><td colspan="7" class="celda-vacia">Error de conexión.</td></tr>';
    }
  }

  function renderTabla() {
    const filtroProfesor = selectProfesor.value;
    let horarios = todosLosHorarios;
    if (filtroProfesor) {
      horarios = horarios.filter((h) => String(h.profesor_id) === String(filtroProfesor));
    }

    if (!horarios.length) {
      tablaBody.innerHTML = '<tr><td colspan="7" class="celda-vacia">No hay bloques de horario registrados.</td></tr>';
      return;
    }

    tablaBody.innerHTML = horarios
      .map(
        (h) => `
      <tr>
        <td><strong>${escapeHtml(h.dia)}</strong></td>
        <td>${formatHora(h.hora_inicio)}</td>
        <td>${formatHora(h.hora_fin)}</td>
        <td>${escapeHtml(h.curso_nombre)}</td>
        <td>${h.profesor_apellido ? `${escapeHtml(h.profesor_apellido)}, ${escapeHtml(h.profesor_nombre)}` : '—'}</td>
        <td>${escapeHtml(h.anio)}</td>
        <td>
          <div class="acciones-cell">
            <button class="btn-icono btn-editar-bloque" title="Editar" data-id="${h.id}">
              <i class="bi bi-pencil-fill"></i>
            </button>
            <button class="btn-icono icono-eliminar" title="Eliminar" data-id="${h.id}">
              <i class="bi bi-trash3-fill"></i>
            </button>
          </div>
        </td>
      </tr>
    `
      )
      .join('');

    tablaBody.querySelectorAll('.btn-editar-bloque').forEach((btn) => {
      btn.addEventListener('click', () => abrirEditar(btn.dataset.id));
    });
    tablaBody.querySelectorAll('.icono-eliminar').forEach((btn) => {
      btn.addEventListener('click', () => confirmarEliminar(btn.dataset.id));
    });
  }

  async function cargarCursosModal() {
    campoCurso.innerHTML = '<option value="">— Selecciona un curso —</option>';
    try {
      const { ok, data } = await cursosApi.listar();
      if (!ok || !data.cursos?.length) return;
      data.cursos.forEach((c) => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = c.nombre;
        campoCurso.appendChild(opt);
      });
    } catch (err) {
      console.error('Error cargando cursos:', err);
    }
  }

  container.querySelector('#btnNuevoBloque').addEventListener('click', async () => {
    container.querySelector('#modalTitulo').textContent = 'Nuevo bloque';
    container.querySelector('#bloqueId').value = '';
    campoProfesor.value = '';
    campoAnio.value = '';
    campoDia.value = '';
    campoInicio.value = '';
    campoFin.value = '';
    await cargarCursosModal();
    modalBloque.classList.remove('d-none');
  });

  async function abrirEditar(id) {
    const h = todosLosHorarios.find((x) => String(x.id) === String(id));
    if (!h) return;

    container.querySelector('#modalTitulo').textContent = 'Editar bloque';
    container.querySelector('#bloqueId').value = h.id;

    if (h.anio && ![...campoAnio.options].some((o) => o.value === h.anio)) {
      const opt = document.createElement('option');
      opt.value = h.anio;
      opt.textContent = h.anio;
      campoAnio.appendChild(opt);
    }
    campoAnio.value = h.anio;
    campoDia.value = h.dia;
    campoInicio.value = formatHora(h.hora_inicio);
    campoFin.value = formatHora(h.hora_fin);

    await cargarCursosModal();
    campoCurso.value = h.curso_id;
    campoProfesor.value = h.profesor_id || '';

    modalBloque.classList.remove('d-none');
  }

  container.querySelector('#btnCerrarModal').addEventListener('click', () => modalBloque.classList.add('d-none'));
  container.querySelector('#btnCancelar').addEventListener('click', () => modalBloque.classList.add('d-none'));

  container.querySelector('#btnGuardar').addEventListener('click', async () => {
    const id = container.querySelector('#bloqueId').value;
    const curso_id = campoCurso.value;
    const profesor_id = campoProfesor.value;
    const anio = campoAnio.value;
    const dia = campoDia.value;
    const hora_inicio = campoInicio.value;
    const hora_fin = campoFin.value;

    if (!curso_id || !anio || !dia || !hora_inicio || !hora_fin) {
      mostrarAlerta('Curso, año, día, hora inicio y hora fin son obligatorios.', 'error');
      return;
    }

    if (!esRangoHoraValido(hora_inicio, hora_fin)) {
      mostrarAlerta('La hora de fin debe ser mayor a la hora de inicio.', 'error');
      return;
    }

    const btnGuardar = container.querySelector('#btnGuardar');
    btnGuardar.disabled = true;
    btnGuardar.textContent = 'Guardando...';

    const payload = {
      curso_id: Number(curso_id),
      profesor_id: profesor_id ? Number(profesor_id) : null,
      anio,
      dia,
      hora_inicio,
      hora_fin,
    };

    try {
      const { ok, data } = id
        ? await horariosApi.actualizar(id, payload)
        : await horariosApi.crear(payload);

      if (!ok) {
        mostrarAlerta(data.mensaje || 'Error al guardar.', 'error');
      } else {
        modalBloque.classList.add('d-none');
        mostrarAlerta(`✓ ${data.mensaje || 'Bloque guardado correctamente.'}`, 'exito');
        cargarHorarios();
      }
    } catch (err) {
      console.error('Error guardando bloque:', err);
      mostrarAlerta('Error de conexión.', 'error');
    } finally {
      btnGuardar.disabled = false;
      btnGuardar.textContent = 'Guardar';
    }
  });

  function confirmarEliminar(id) {
    bloqueAEliminar = id;
    modalConfirmar.classList.remove('d-none');
  }

  container.querySelector('#btnCerrarConfirmar').addEventListener('click', () => modalConfirmar.classList.add('d-none'));
  container.querySelector('#btnCancelarEliminar').addEventListener('click', () => modalConfirmar.classList.add('d-none'));

  container.querySelector('#btnConfirmarEliminar').addEventListener('click', async () => {
    if (!bloqueAEliminar) return;
    try {
      const { ok, data } = await horariosApi.eliminar(bloqueAEliminar);
      modalConfirmar.classList.add('d-none');
      if (!ok) {
        mostrarAlerta(data.mensaje || 'Error al eliminar.', 'error');
      } else {
        mostrarAlerta('✓ Bloque eliminado correctamente.', 'exito');
        cargarHorarios();
      }
    } catch (err) {
      console.error('Error eliminando:', err);
      mostrarAlerta('Error de conexión.', 'error');
    }
    bloqueAEliminar = null;
  });

  selectProfesor.addEventListener('change', renderTabla);

  cargarProfesores();
  cargarHorarios();
}

/**
 * Renderiza la grilla semanal agrupada por día para Profesor o Estudiante
 */
function renderGrillaSemanal(horarios, esEstudiante = false) {
  if (!horarios || !horarios.length) {
    return '<tr><td colspan="5" class="celda-vacia">No tienes bloques de horario asignados aún.</td></tr>';
  }

  const porDia = {};
  DIAS_SEMANA.forEach((d) => {
    porDia[d] = [];
  });
  horarios.forEach((h) => {
    if (porDia[h.dia]) porDia[h.dia].push(h);
  });

  let filas = '';
  DIAS_SEMANA.forEach((dia) => {
    const bloques = porDia[dia];
    if (!bloques.length) return;
    const color = COLORES_DIA[dia] || '#f8fafc';

    bloques.forEach((b, i) => {
      const ultimaColumna = esEstudiante
        ? b.profesor_apellido
          ? `${escapeHtml(b.profesor_apellido)}, ${escapeHtml(b.profesor_nombre)}`
          : '—'
        : escapeHtml(b.anio);

      filas += `
        <tr>
          ${
            i === 0
              ? `<td rowspan="${bloques.length}" style="background:${color};font-weight:700;text-align:center;vertical-align:middle;">${escapeHtml(dia)}</td>`
              : ''
          }
          <td>${formatHora(b.hora_inicio)}</td>
          <td>${formatHora(b.hora_fin)}</td>
          <td><strong>${escapeHtml(b.curso_nombre)}</strong></td>
          <td>${ultimaColumna}</td>
        </tr>
      `;
    });
  });

  return filas || '<tr><td colspan="5" class="celda-vacia">No hay bloques registrados.</td></tr>';
}

/**
 * Vista Profesor: Mi Horario
 */
export function renderMiHorarioProfesor(container) {
  container.innerHTML = `
    ${renderNavbarHTML()}

    <main class="dash-main">
      <div class="page-header">
        <div>
          <a href="#/profesor" class="back-link">
            <i class="bi bi-arrow-left"></i> Volver al panel
          </a>
          <h2>Mi horario</h2>
          <p>Distribución semanal de tus clases.</p>
        </div>
      </div>

      <div class="tabla-wrapper">
        <table class="tabla-usuarios" id="tablaHorario">
          <thead>
            <tr>
              <th>Día</th>
              <th>Hora inicio</th>
              <th>Hora fin</th>
              <th>Curso</th>
              <th>Año</th>
            </tr>
          </thead>
          <tbody id="tablaBody">
            <tr><td colspan="5" class="celda-vacia">Cargando horario...</td></tr>
          </tbody>
        </table>
      </div>
    </main>
  `;

  bindNavbarEvents(container);
  const tablaBody = container.querySelector('#tablaBody');

  (async function cargar() {
    try {
      const { ok, data } = await horariosApi.obtenerMiHorarioProfesor();
      if (!ok) {
        tablaBody.innerHTML = `<tr><td colspan="5" class="celda-vacia">${escapeHtml(data.mensaje || 'Error al cargar horario.')}</td></tr>`;
        return;
      }
      tablaBody.innerHTML = renderGrillaSemanal(data.horarios || [], false);
    } catch (err) {
      console.error('Error cargando horario:', err);
      tablaBody.innerHTML = '<tr><td colspan="5" class="celda-vacia">Error de conexión.</td></tr>';
    }
  })();
}

/**
 * Vista Estudiante: Mi Horario
 */
export function renderMiHorarioEstudiante(container) {
  container.innerHTML = `
    ${renderNavbarHTML()}

    <main class="dash-main">
      <div class="page-header">
        <div>
          <a href="#/estudiante" class="back-link">
            <i class="bi bi-arrow-left"></i> Volver al panel
          </a>
          <h2>Mi horario</h2>
          <p>Distribución semanal de tus clases.</p>
        </div>
      </div>

      <div class="tabla-wrapper">
        <table class="tabla-usuarios" id="tablaHorario">
          <thead>
            <tr>
              <th>Día</th>
              <th>Hora inicio</th>
              <th>Hora fin</th>
              <th>Curso</th>
              <th>Profesor</th>
            </tr>
          </thead>
          <tbody id="tablaBody">
            <tr><td colspan="5" class="celda-vacia">Cargando horario...</td></tr>
          </tbody>
        </table>
      </div>
    </main>
  `;

  bindNavbarEvents(container);
  const tablaBody = container.querySelector('#tablaBody');

  (async function cargar() {
    try {
      const { ok, data } = await horariosApi.obtenerMiHorarioEstudiante();
      if (!ok) {
        tablaBody.innerHTML = `<tr><td colspan="5" class="celda-vacia">${escapeHtml(data.mensaje || 'Error al cargar horario.')}</td></tr>`;
        return;
      }
      tablaBody.innerHTML = renderGrillaSemanal(data.horarios || [], true);
    } catch (err) {
      console.error('Error cargando horario:', err);
      tablaBody.innerHTML = '<tr><td colspan="5" class="celda-vacia">Error de conexión.</td></tr>';
    }
  })();
}

