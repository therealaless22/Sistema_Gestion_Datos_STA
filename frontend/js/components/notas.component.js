/**
 * =============================================
 * SANTO TOMÁS DE AQUINO — Componente Notas
 * - Profesor: Registrar y actualizar notas (/api/notas)
 * - Estudiante: Consultar mis notas (/api/notas/mis-cursos y /api/notas/mis-notas)
 * =============================================
 */

import { notasApi } from '../api/notas.api.js';
import { cursosApi } from '../api/cursos.api.js';
import { escapeHtml, escapeAttr, mostrarAlerta, ocultarAlerta } from '../utils/dom.js';
import { notaConLetraHTML } from '../utils/formatters.js';
import { esNotaValida } from '../utils/validators.js';
import { renderNavbarHTML, bindNavbarEvents } from './navbar.component.js';

/**
 * Vista Profesor: Registrar Notas
 */
export function renderRegistrarNotasProfesor(container) {
  container.innerHTML = `
    ${renderNavbarHTML()}

    <main class="dash-main">
      <div class="page-header">
        <div>
          <a href="#/profesor" class="back-link">
            <i class="bi bi-arrow-left"></i> Volver al panel
          </a>
          <h2>Registrar notas</h2>
          <p>Selecciona el curso y año, y completa las notas de los estudiantes.</p>
        </div>
      </div>

      <div id="alertBox" class="alert-box d-none"></div>

      <div class="quick-panel" style="margin-bottom: 1.25rem;">
        <h3>Filtros</h3>
        <div class="filtros">
          <select id="selectCurso">
            <option value="">— Selecciona un curso —</option>
          </select>
          <select id="selectPeriodo">
            <option value="">— Selecciona un período —</option>
            <option value="Bimestre 1">Bimestre 1</option>
            <option value="Bimestre 2">Bimestre 2</option>
            <option value="Bimestre 3">Bimestre 3</option>
            <option value="Bimestre 4">Bimestre 4</option>
          </select>
          <button id="btnCargarAlumnos" class="btn-primario" type="button" disabled>
            <i class="bi bi-search"></i> Cargar alumnos
          </button>
        </div>
      </div>

      <div id="seccionNotas" class="d-none">
        <div class="tabla-wrapper">
          <table class="tabla-usuarios">
            <thead>
              <tr>
                <th>#</th>
                <th>Apellidos y nombres</th>
                <th>Nota <small style="font-weight:400;text-transform:none;letter-spacing:0">(0 – 20)</small></th>
                <th>Observación <small style="font-weight:400;text-transform:none;letter-spacing:0">(opcional)</small></th>
              </tr>
            </thead>
            <tbody id="tablaNotas">
              <tr><td colspan="4" class="celda-vacia">Cargando alumnos...</td></tr>
            </tbody>
          </table>
        </div>

        <div style="display:flex; justify-content:flex-end; margin-top:1rem;">
          <button id="btnGuardarNotas" class="btn-primario" type="button">
            <i class="bi bi-floppy-fill"></i> Guardar notas
          </button>
        </div>
      </div>
    </main>
  `;

  bindNavbarEvents(container);

  const selectCurso = container.querySelector('#selectCurso');
  const selectPeriodo = container.querySelector('#selectPeriodo');
  const btnCargar = container.querySelector('#btnCargarAlumnos');
  const seccionNotas = container.querySelector('#seccionNotas');
  const tablaNotas = container.querySelector('#tablaNotas');
  const btnGuardar = container.querySelector('#btnGuardarNotas');

  function validarFiltros() {
    btnCargar.disabled = !(selectCurso.value && selectPeriodo.value);
  }

  selectCurso.addEventListener('change', validarFiltros);
  selectPeriodo.addEventListener('change', validarFiltros);

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

  async function cargarTablaNotas() {
    const horarioId = selectCurso.value;
    const periodo = selectPeriodo.value;

    seccionNotas.classList.remove('d-none');
    tablaNotas.innerHTML = '<tr><td colspan="4" class="celda-vacia">Cargando alumnos...</td></tr>';

    try {
      const [respAlumnos, respNotas] = await Promise.all([
        cursosApi.listarAlumnosDeHorario(horarioId),
        notasApi.obtenerPorHorarioYPeriodo(horarioId, periodo),
      ]);

      if (!respAlumnos.ok) {
        tablaNotas.innerHTML = `<tr><td colspan="4" class="celda-vacia">${escapeHtml(respAlumnos.data.mensaje || 'Error al cargar alumnos.')}</td></tr>`;
        return;
      }

      const alumnos = respAlumnos.data.alumnos || [];
      if (!alumnos.length) {
        tablaNotas.innerHTML = '<tr><td colspan="4" class="celda-vacia">Este curso no tiene alumnos del año correspondiente.</td></tr>';
        return;
      }

      const notasExistentes = {};
      if (respNotas.ok && Array.isArray(respNotas.data.notas)) {
        respNotas.data.notas.forEach((n) => {
          notasExistentes[n.estudiante_id] = n;
        });
      }

      tablaNotas.innerHTML = alumnos
        .map((al, i) => {
          const notaExistente = notasExistentes[al.id];
          const valorNota = notaExistente ? notaExistente.nota : '';
          const valorObs = notaExistente ? notaExistente.observacion || '' : '';
          const notaId = notaExistente ? notaExistente.id : '';

          return `
            <tr>
              <td>${i + 1}</td>
              <td><strong>${escapeHtml(al.apellido)}</strong>, ${escapeHtml(al.nombre)}</td>
              <td>
                <input
                  type="number"
                  class="input-nota input-tabla-numero"
                  data-alumno="${al.id}"
                  data-nota-id="${escapeAttr(notaId)}"
                  min="0" max="20" step="0.5"
                  placeholder="—"
                  value="${escapeAttr(valorNota)}"
                />
              </td>
              <td>
                <input
                  type="text"
                  class="input-obs input-tabla-texto"
                  data-alumno="${al.id}"
                  placeholder="Sin observación"
                  value="${escapeAttr(valorObs)}"
                />
              </td>
            </tr>
          `;
        })
        .join('');
    } catch (err) {
      console.error('Error cargando alumnos:', err);
      tablaNotas.innerHTML = '<tr><td colspan="4" class="celda-vacia">Error de conexión con el servidor.</td></tr>';
    }
  }

  btnCargar.addEventListener('click', async () => {
    ocultarAlerta();
    await cargarTablaNotas();
  });

  btnGuardar.addEventListener('click', async () => {
    const horarioId = selectCurso.value;
    const periodo = selectPeriodo.value;
    const inputsNota = tablaNotas.querySelectorAll('.input-nota');
    const payload = [];
    let hayError = false;

    inputsNota.forEach((input) => {
      if (input.value === '') return;

      if (!esNotaValida(input.value)) {
        hayError = true;
        input.style.borderColor = '#c0392b';
        return;
      }

      input.style.borderColor = '#e2e8f0';
      const nota = parseFloat(input.value);
      const alumnoId = input.dataset.alumno;
      const notaId = input.dataset.notaId;

      const obsInput = tablaNotas.querySelector(`.input-obs[data-alumno="${alumnoId}"]`);
      const observacion = obsInput ? obsInput.value.trim() : '';

      const item = {
        estudiante_id: parseInt(alumnoId, 10),
        horario_id: parseInt(horarioId, 10),
        nota,
        periodo,
        observacion,
      };
      if (notaId) {
        item.nota_id = parseInt(notaId, 10);
      } else {
        item.nota_id = null;
      }

      payload.push(item);
    });

    if (hayError) {
      mostrarAlerta('Corrige las notas resaltadas en rojo (deben estar entre 0 y 20).', 'error');
      return;
    }

    if (!payload.length) {
      mostrarAlerta('No hay notas para guardar. Completa al menos una nota.', 'error');
      return;
    }

    btnGuardar.disabled = true;
    btnGuardar.innerHTML = '<i class="bi bi-hourglass-split"></i> Guardando...';

    try {
      const { ok, data } = await notasApi.guardar(payload);
      if (!ok) {
        mostrarAlerta(data.mensaje || 'Error al guardar las notas.', 'error');
      } else {
        mostrarAlerta(`✓ ${data.mensaje || 'Notas guardadas correctamente.'}`, 'exito');
        cargarTablaNotas();
      }
    } catch (err) {
      console.error('Error guardando notas:', err);
      mostrarAlerta('Error de conexión con el servidor.', 'error');
    } finally {
      btnGuardar.disabled = false;
      btnGuardar.innerHTML = '<i class="bi bi-floppy-fill"></i> Guardar notas';
    }
  });

  cargarCursos();
}

/**
 * Vista Estudiante: Mis Notas
 */
export function renderMisNotasEstudiante(container) {
  container.innerHTML = `
    ${renderNavbarHTML()}

    <main class="dash-main">
      <div class="page-header">
        <div>
          <a href="#/estudiante" class="back-link">
            <i class="bi bi-arrow-left"></i> Volver al panel
          </a>
          <h2>Mis notas</h2>
          <p>Selecciona un curso para ver tus notas por bimestre.</p>
        </div>
      </div>

      <div class="filtros">
        <select id="selectCurso">
          <option value="">— Selecciona un curso —</option>
        </select>
      </div>

      <div class="tabla-wrapper">
        <table class="tabla-usuarios" id="tablaNotas">
          <thead>
            <tr>
              <th>Periodo</th>
              <th>Nota</th>
              <th>Observación</th>
            </tr>
          </thead>
          <tbody id="tablaBody">
            <tr><td colspan="3" class="celda-vacia">Selecciona un curso para ver tus notas.</td></tr>
          </tbody>
        </table>
      </div>
    </main>
  `;

  bindNavbarEvents(container);

  const selectCurso = container.querySelector('#selectCurso');
  const tablaBody = container.querySelector('#tablaBody');

  async function cargarCursos() {
    try {
      const { ok, data } = await notasApi.listarMisCursosEstudiante();
      if (!ok) {
        selectCurso.innerHTML = '<option value="">Error al cargar cursos</option>';
        return;
      }

      const cursos = data.cursos || [];
      if (!cursos.length) {
        selectCurso.innerHTML = '<option value="">No estás matriculado en ningún curso</option>';
        return;
      }

      selectCurso.innerHTML =
        '<option value="">— Selecciona un curso —</option>' +
        cursos
          .map(
            (c) =>
              `<option value="${escapeAttr(c.horario_id)}">${escapeHtml(c.curso_nombre)} — ${escapeHtml(c.anio)}${
                c.profesor_apellido ? ` (Prof. ${escapeHtml(c.profesor_apellido)})` : ''
              }</option>`
          )
          .join('');
    } catch (err) {
      console.error('Error cargando cursos:', err);
      selectCurso.innerHTML = '<option value="">Error de conexión</option>';
    }
  }

  async function cargarNotas(horarioId) {
    if (!horarioId) {
      tablaBody.innerHTML = '<tr><td colspan="3" class="celda-vacia">Selecciona un curso para ver tus notas.</td></tr>';
      return;
    }

    tablaBody.innerHTML = '<tr><td colspan="3" class="celda-vacia">Cargando notas...</td></tr>';

    try {
      const { ok, data } = await notasApi.obtenerMisNotasEstudiante(horarioId);
      if (!ok) {
        tablaBody.innerHTML = `<tr><td colspan="3" class="celda-vacia">${escapeHtml(data.mensaje || 'Error al cargar notas.')}</td></tr>`;
        return;
      }

      const notas = data.notas || [];
      if (!notas.length) {
        tablaBody.innerHTML = '<tr><td colspan="3" class="celda-vacia">Aún no tienes notas registradas en este curso.</td></tr>';
        return;
      }

      tablaBody.innerHTML = notas
        .map(
          (n) => `
        <tr>
          <td><strong>${escapeHtml(n.periodo)}</strong></td>
          <td>${notaConLetraHTML(n.nota)}</td>
          <td>${escapeHtml(n.observacion || '—')}</td>
        </tr>
      `
        )
        .join('');
    } catch (err) {
      console.error('Error cargando notas:', err);
      tablaBody.innerHTML = '<tr><td colspan="3" class="celda-vacia">Error de conexión.</td></tr>';
    }
  }

  selectCurso.addEventListener('change', () => cargarNotas(selectCurso.value));
  cargarCursos();
}

