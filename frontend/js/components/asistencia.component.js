/**
 * =============================================
 * SANTO TOMÁS DE AQUINO — Componente Asistencia
 * - Profesor: Registrar/editar asistencia (/api/asistencia)
 * - Estudiante: Resumen de mi asistencia (/api/asistencia/mi-resumen)
 * =============================================
 */

import { asistenciaApi } from '../api/asistencia.api.js';
import { cursosApi } from '../api/cursos.api.js';
import { escapeHtml, escapeAttr, mostrarAlerta, ocultarAlerta } from '../utils/dom.js';
import { obtenerFechaHoyISO } from '../utils/validators.js';
import { renderNavbarHTML, bindNavbarEvents } from './navbar.component.js';

const ESTADOS_ASISTENCIA = [
  { value: 'asistio',              label: 'Asistió' },
  { value: 'tardanza',             label: 'Tardanza' },
  { value: 'falta',                label: 'Falta' },
  { value: 'falta_justificada',    label: 'Falta justificada' },
  { value: 'tardanza_justificada', label: 'Tardanza justificada' },
];

function esJustificada(estado) {
  return estado === 'falta_justificada' || estado === 'tardanza_justificada';
}

/**
 * Vista Profesor: Control de Asistencia
 */
export function renderAsistenciaProfesor(container) {
  const hoy = obtenerFechaHoyISO();

  container.innerHTML = `
    ${renderNavbarHTML()}

    <main class="dash-main">
      <div class="page-header">
        <div>
          <a href="#/profesor" class="back-link">
            <i class="bi bi-arrow-left"></i> Volver al panel
          </a>
          <h2>Asistencia</h2>
          <p>Registra o edita la asistencia diaria de tus alumnos.</p>
        </div>
      </div>

      <div id="alertBox" class="alert-box d-none"></div>

      <div class="quick-panel" style="margin-bottom: 1.25rem;">
        <h3>Filtros</h3>
        <div class="filtros">
          <select id="selectCurso">
            <option value="">— Selecciona un curso —</option>
          </select>
          <input type="date" id="inputFecha" value="${hoy}" max="${hoy}"/>
          <button id="btnCargar" class="btn-primario" type="button" disabled>
            <i class="bi bi-search"></i> Cargar
          </button>
        </div>
      </div>

      <div id="seccionAsistencia" class="d-none">
        <div class="tabla-wrapper">
          <table class="tabla-usuarios">
            <thead>
              <tr>
                <th>#</th>
                <th>Apellidos y nombres</th>
                <th>Estado</th>
                <th>Motivo <small style="font-weight:400;text-transform:none;letter-spacing:0">(solo justificadas)</small></th>
              </tr>
            </thead>
            <tbody id="tablaAsistencia">
              <tr><td colspan="4" class="celda-vacia">Cargando...</td></tr>
            </tbody>
          </table>
        </div>

        <div style="display:flex; justify-content:flex-end; margin-top:1rem;">
          <button id="btnGuardar" class="btn-primario" type="button">
            <i class="bi bi-floppy-fill"></i> Guardar asistencia
          </button>
        </div>
      </div>
    </main>
  `;

  bindNavbarEvents(container);

  const selectCurso = container.querySelector('#selectCurso');
  const inputFecha = container.querySelector('#inputFecha');
  const btnCargar = container.querySelector('#btnCargar');
  const seccionAsistencia = container.querySelector('#seccionAsistencia');
  const tablaAsistencia = container.querySelector('#tablaAsistencia');
  const btnGuardar = container.querySelector('#btnGuardar');

  function validarFiltros() {
    btnCargar.disabled = !(selectCurso.value && inputFecha.value);
  }

  selectCurso.addEventListener('change', validarFiltros);
  inputFecha.addEventListener('change', validarFiltros);

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
      validarFiltros();
    } catch (err) {
      console.error('Error cargando cursos:', err);
    }
  }

  function renderFila(alumno, index, asistenciaExistente) {
    const estadoActual = asistenciaExistente?.estado || 'asistio';
    const motivoActual = asistenciaExistente?.observacion || '';
    const asistenciaId = asistenciaExistente?.id || '';
    const mostrarMotivo = esJustificada(estadoActual);

    const opcionesSelect = ESTADOS_ASISTENCIA.map(
      (e) => `<option value="${e.value}" ${estadoActual === e.value ? 'selected' : ''}>${e.label}</option>`
    ).join('');

    return `
      <tr>
        <td>${index + 1}</td>
        <td><strong>${escapeHtml(alumno.apellido)}</strong>, ${escapeHtml(alumno.nombre)}</td>
        <td>
          <select
            class="select-estado select-tabla"
            data-alumno="${alumno.id}"
            data-asistencia-id="${escapeAttr(asistenciaId)}"
          >
            ${opcionesSelect}
          </select>
        </td>
        <td>
          <input
            type="text"
            class="input-motivo input-tabla-texto"
            data-alumno="${alumno.id}"
            placeholder="Escribe el motivo..."
            value="${escapeAttr(motivoActual)}"
            style="display: ${mostrarMotivo ? 'block' : 'none'};"
          />
          <span
            class="motivo-placeholder"
            data-alumno="${alumno.id}"
            style="display: ${mostrarMotivo ? 'none' : 'inline'}; font-size: 0.8rem; color: #a0aec0;"
          >—</span>
        </td>
      </tr>
    `;
  }

  async function cargarTablaAsistencia() {
    const horarioId = selectCurso.value;
    const fecha = inputFecha.value;

    seccionAsistencia.classList.remove('d-none');
    tablaAsistencia.innerHTML = '<tr><td colspan="4" class="celda-vacia">Cargando alumnos...</td></tr>';

    try {
      const [respAlumnos, respAsistencia] = await Promise.all([
        cursosApi.listarAlumnosDeHorario(horarioId),
        asistenciaApi.obtenerPorHorarioYFecha(horarioId, fecha),
      ]);

      if (!respAlumnos.ok) {
        tablaAsistencia.innerHTML = `<tr><td colspan="4" class="celda-vacia">${escapeHtml(respAlumnos.data.mensaje || 'Error al cargar alumnos.')}</td></tr>`;
        return;
      }

      const alumnos = respAlumnos.data.alumnos || [];
      if (!alumnos.length) {
        tablaAsistencia.innerHTML = '<tr><td colspan="4" class="celda-vacia">Este curso no tiene alumnos del año correspondiente.</td></tr>';
        return;
      }

      const asistenciasExistentes = {};
      if (respAsistencia.ok && Array.isArray(respAsistencia.data.asistencias)) {
        respAsistencia.data.asistencias.forEach((a) => {
          asistenciasExistentes[a.estudiante_id] = a;
        });
      }

      tablaAsistencia.innerHTML = alumnos
        .map((al, i) => renderFila(al, i, asistenciasExistentes[al.id]))
        .join('');

      tablaAsistencia.querySelectorAll('.select-estado').forEach((selectEl) => {
        selectEl.addEventListener('change', () => {
          const alumnoId = selectEl.dataset.alumno;
          const estado = selectEl.value;
          const inputMotivo = tablaAsistencia.querySelector(`.input-motivo[data-alumno="${alumnoId}"]`);
          const placeholder = tablaAsistencia.querySelector(`.motivo-placeholder[data-alumno="${alumnoId}"]`);

          if (esJustificada(estado)) {
            inputMotivo.style.display = 'block';
            placeholder.style.display = 'none';
          } else {
            inputMotivo.style.display = 'none';
            inputMotivo.value = '';
            placeholder.style.display = 'inline';
          }
        });
      });
    } catch (err) {
      console.error('Error:', err);
      tablaAsistencia.innerHTML = '<tr><td colspan="4" class="celda-vacia">Error de conexión con el servidor.</td></tr>';
    }
  }

  btnCargar.addEventListener('click', async () => {
    ocultarAlerta();
    await cargarTablaAsistencia();
  });

  btnGuardar.addEventListener('click', async () => {
    const horarioId = selectCurso.value;
    const fecha = inputFecha.value;
    const selects = tablaAsistencia.querySelectorAll('.select-estado');
    const payload = [];

    selects.forEach((sel) => {
      const alumnoId = sel.dataset.alumno;
      const asistenciaId = sel.dataset.asistenciaId;
      const estado = sel.value;
      const motivoInput = tablaAsistencia.querySelector(`.input-motivo[data-alumno="${alumnoId}"]`);
      const observacion = esJustificada(estado) ? motivoInput?.value.trim() || '' : '';

      payload.push({
        asistencia_id: asistenciaId ? parseInt(asistenciaId, 10) : null,
        estudiante_id: parseInt(alumnoId, 10),
        horario_id: parseInt(horarioId, 10),
        fecha,
        estado,
        observacion,
      });
    });

    if (!payload.length) {
      mostrarAlerta('No hay alumnos para guardar.', 'error');
      return;
    }

    btnGuardar.disabled = true;
    btnGuardar.innerHTML = '<i class="bi bi-hourglass-split"></i> Guardando...';

    try {
      const { ok, data } = await asistenciaApi.guardar(payload);
      if (!ok) {
        mostrarAlerta(data.mensaje || 'Error al guardar.', 'error');
      } else {
        mostrarAlerta(`✓ ${data.mensaje || 'Asistencia guardada correctamente.'}`, 'exito');
        cargarTablaAsistencia();
      }
    } catch (err) {
      console.error('Error guardando:', err);
      mostrarAlerta('Error de conexión con el servidor.', 'error');
    } finally {
      btnGuardar.disabled = false;
      btnGuardar.innerHTML = '<i class="bi bi-floppy-fill"></i> Guardar asistencia';
    }
  });

  cargarCursos();
}

/**
 * Vista Estudiante: Mi Resumen de Asistencia
 */
const ETIQUETAS_RESUMEN = {
  asistio:              { label: 'Asistencias',            icon: 'bi-check-circle-fill' },
  tardanza:             { label: 'Tardanzas',              icon: 'bi-clock-fill' },
  falta:                { label: 'Faltas',                 icon: 'bi-x-circle-fill' },
  tardanza_justificada: { label: 'Tardanzas justificadas', icon: 'bi-patch-check-fill' },
  falta_justificada:    { label: 'Faltas justificadas',    icon: 'bi-patch-check-fill' },
};

export function renderMiAsistenciaEstudiante(container) {
  container.innerHTML = `
    ${renderNavbarHTML()}

    <main class="dash-main">
      <div class="page-header">
        <div>
          <a href="#/estudiante" class="back-link">
            <i class="bi bi-arrow-left"></i> Volver al panel
          </a>
          <h2>Mi asistencia</h2>
          <p>Resumen total de tu asistencia registrada.</p>
        </div>
      </div>

      <div class="resumen-grid" id="resumenGrid">
        <div class="resumen-card total">
          <div class="valor">—</div>
          <div class="etiqueta">Total de registros</div>
        </div>
      </div>
    </main>
  `;

  bindNavbarEvents(container);
  const resumenGrid = container.querySelector('#resumenGrid');

  (async function cargarResumen() {
    try {
      const { ok, data } = await asistenciaApi.obtenerMiResumenEstudiante();
      if (!ok) {
        resumenGrid.innerHTML = `<div class="resumen-card"><div class="etiqueta">${escapeHtml(data.mensaje || 'Error al cargar resumen.')}</div></div>`;
        return;
      }

      let html = `
        <div class="resumen-card total">
          <div class="valor">${data.total_registros ?? 0}</div>
          <div class="etiqueta"><i class="bi bi-card-list"></i> Total de registros</div>
        </div>
      `;

      const resumen = data.resumen || {};
      Object.entries(ETIQUETAS_RESUMEN).forEach(([clave, info]) => {
        html += `
          <div class="resumen-card ${clave}">
            <div class="valor">${resumen[clave] ?? 0}</div>
            <div class="etiqueta"><i class="bi ${info.icon}"></i> ${info.label}</div>
          </div>
        `;
      });

      resumenGrid.innerHTML = html;
    } catch (err) {
      console.error('Error cargando resumen de asistencia:', err);
      resumenGrid.innerHTML = '<div class="resumen-card"><div class="etiqueta">Error de conexión.</div></div>';
    }
  })();
}

